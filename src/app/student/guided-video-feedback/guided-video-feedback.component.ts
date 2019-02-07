import { Component, OnInit } from '@angular/core';
import { GuidedvideoService } from '../../services/guidedvideo.service';
import { Router } from '../../../../node_modules/@angular/router';
import * as moment from 'moment';
import { LoaderService } from '../../services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { RateTeacherService } from '../../services/rate-teacher.service';
import { CommonService } from '../../common/common.service';

export interface GuidedVideo {
    Video: string;
    Created: string;
    DateReceived: string;
    FeedbackStatus: string;
    rowIndex: number;
}
declare var VoicelessonsGuidedVideoPlayer: any;
@Component({
    selector: 'app-guided-video-feedback',
    templateUrl: './guided-video-feedback.component.html',
    styleUrls: ['./guided-video-feedback.component.scss']
})
export class GuidedVideoFeedbackComponent implements OnInit {
    guidedVideoList: any;
    filteredItems: GuidedVideo[];
    pages: number = 10;
    pageSize: number = 10;
    pageNumber: number = 0;
    currentIndex: number = 1;
    items: GuidedVideo[];
    pagesIndex: Array<number>;
    pageStart: number = 1;
    userId: any;

    constructor(public guidedvideoService: GuidedvideoService, private route: Router, private loaderService: LoaderService,
        private toastr: ToastrService, private rateTeacherService: RateTeacherService) {
        this.getGuidedVideoList();
    }

    ngOnInit() {
        this.loaderService.processloader = false;
        //this.toastr.info('Please complete your singing evaluation to continue your musical journey.')
    }

    getGuidedVideoList() {
        this.guidedvideoService.getGuidedVideoFeedbackList().subscribe((response: any) => {
            response.forEach(element => {
                if (element.DateReceived != "" && element.DateReceived != "1900-01-01T00:00:00") {
                    element.DateReceived = moment(element.DateReceived).format('M/DD/YYYY h:mm A');
                } else {
                    element.DateReceived = "";
                }
                element.Created = moment(element.Created).format('M/DD/YYYY h:mm A');

                if (element.LessonQueue != null && element.LessonQueue != '') {
                    var VideoUrl = this.getdefaultVideo(JSON.parse(element.LessonQueue));
                    element.TeacherVideoUrl = VideoUrl;
                }
            });
            this.guidedvideoService.guidedVideoList = response;
            this.filteredItems = this.guidedvideoService.guidedVideoList;
            let i = 0;
            this.filteredItems.forEach(element => {
                element.rowIndex = i++;
            });
            this.guidedVideoList = this.guidedvideoService.guidedVideoList;
            this.initList();
        })
    }

    getdefaultVideo(lessonQueue) {
        let isDefaultVideoUrl = false; let defaultVideoUrl = "";
        lessonQueue.forEach(element => {
            if (!isDefaultVideoUrl && element.VideoUrl.length > 0) {
                defaultVideoUrl = element.VideoUrl;
                isDefaultVideoUrl = true;
            }
        });
        return defaultVideoUrl;

    }


    initList() {
        this.currentIndex = 1;
        this.pageStart = 1;
        this.pages = 10;

        this.pageNumber = parseInt("" + (this.filteredItems.length / this.pageSize));
        if (this.filteredItems.length % this.pageSize != 0) {
            this.pageNumber++;
        }

        if (this.pageNumber < this.pages) {
            this.pages = this.pageNumber;
        }

        this.refreshItems();
    }


    fillArray(): any {
        var obj = new Array();
        for (var index = this.pageStart; index < this.pageStart + this.pages; index++) {
            obj.push(index);
        }
        return obj;
    }

    refreshItems() {
        this.items = this.filteredItems.slice((this.currentIndex - 1) * this.pageSize, (this.currentIndex) * this.pageSize);
        this.pagesIndex = this.fillArray();
        CommonService.guidedVideoLsit = this.items;
        setTimeout(function () {
            CommonService.guidedVideoLsit.forEach(element => {
                debugger;
                if (element.VideoUrl != undefined)
                    VoicelessonsGuidedVideoPlayer.init('#videoDiv_' + element.rowIndex, element.VideoUrl, '', null);
                if (element.TeacherVideoUrl != undefined)
                    VoicelessonsGuidedVideoPlayer.init('#teacherVideoDiv_' + element.rowIndex, element.TeacherVideoUrl, '', null);
            });
        }, 500)
    }

    prevPage() {
        if (this.currentIndex > 1) {
            this.currentIndex--;
        }
        if (this.currentIndex < this.pageStart) {
            this.pageStart = this.currentIndex;
        }
        this.refreshItems();
    }

    nextPage() {
        if (this.currentIndex < this.pageNumber) {
            this.currentIndex++;
        }
        if (this.currentIndex >= (this.pageStart + this.pages)) {
            this.pageStart = this.currentIndex - this.pages + 1;
        }

        this.refreshItems();
    }

    setPage(index: number) {
        this.currentIndex = index;
        this.refreshItems();
    }

    getfeedbackdata(Source, LessonGuid, VideoSubmissionId, TeacherId, LessonId, IsPaid) {
        this.guidedvideoService.videoSubmissionId = VideoSubmissionId;
        this.guidedvideoService.guidedLessonGuid = LessonGuid;
        this.rateTeacherService.TeacherReviewModel.LessonId = LessonId;
        this.rateTeacherService.TeacherReviewModel.TeacherUserId = TeacherId;
        this.guidedvideoService.IsPaid = IsPaid;
        if (IsPaid == false) {
            this.guidedvideoService.getGuidedVideoCostDetailsbySource(Source, VideoSubmissionId).subscribe((response: any) => {
                if (response.result.IsPayBeforeSubmission == false) {
                    this.guidedvideoService.PaymentTime = 'PayBeforeViewResult';
                    this.guidedvideoService.Price = response.result.Cost;
                    this.route.navigate(['/student/guidedvideofeedback']);
                } else {
                    this.guidedvideoService.PaymentTime = 'PayBeforeSubmission';
                    this.guidedvideoService.Price = 0;
                    this.route.navigate(['/student/guidedvideofeedback']);
                }
            });
        } else {
            this.guidedvideoService.PaymentTime = '';
            this.guidedvideoService.Price = 0;
            this.route.navigate(['/student/guidedvideofeedback']);
        }
    }
}