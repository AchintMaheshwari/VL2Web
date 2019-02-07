import { Component, OnInit, OnDestroy } from '@angular/core';
import { VideoService } from '../../../services/video.service';
import { Router } from '../../../../../node_modules/@angular/router';
import { LessonsService } from '../../../services/lessons.service';
import { CommonService } from '../../../common/common.service';
import { MatDialog } from '@angular/material';
import { ConfirmDeleteVideoComponent } from '../../confirm-delete-video/confirm-delete-video.component';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { SharedlibraryService } from '../../../services/sharedlibrary.service';
import { LoaderService } from '../../../services/loader.service';

declare var VoicelessonsGuidedVideoPlayer: any;
@Component({
  selector: 'app-video-library',
  templateUrl: './video-library.component.html',
  styleUrls: ['./video-library.component.scss']
})
export class VideoLibraryComponent implements OnInit, OnDestroy {

  ngOnDestroy(): void {
    this.songPlayer = $('.mediPlayer');
    this.songPlayer.clearSongList();
  }

  panelOpenState: boolean = false;
  filterVideo: any;
  filterSelection: any = [];
  KeyList: any;
  userId: number
  songPlayer: any;
  userType: string;
  constructor(public videoService: VideoService, private router: Router, public lessonService: LessonsService,
    public dialog: MatDialog, private sharedService: SharedlibraryService, private toastr: ToastrService,
    private loaderService: LoaderService, public commonService: CommonService) {
    this.videoService.IsAddedFromLibrary = false;
    this.userType = localStorage.getItem("UserType");
  }

  ngOnInit() {
    this.getVideoLibraries();
    this.userId = CommonService.getUser().UserId;
  }

  initVideoPlayer(selector) {
    if ($('.songPlayer_' + selector).find('svg').length == 0) {
      this.songPlayer = $('.songPlayer_' + selector);
      this.songPlayer.mediaPlayer();
    }
  }

  getVideoLibraries() {
    this.loaderService.processloader = true;
    this.videoService.getVideoLibraryList().subscribe((response: any) => {
      this.loaderService.processloader = false;
      this.videoService.unfilteredVideoList = response;
      this.videoService.videosList = response;
      CommonService.guidedVideoLsit = response;
      setTimeout(function () {
        CommonService.guidedVideoLsit.forEach(element => {
          if (element.VideoURL != undefined)
            VoicelessonsGuidedVideoPlayer.init('#videoDiv_' + element.VideoId, element.VideoURL, '', null);
        });
      }, 500);

    })
  }


  downloadFile(url: string) {
    if (url != "") {
      window.open(url);
      window.URL.revokeObjectURL(url);
    }
  }

  upsertVideo(videoId: number, tags: string) {
    this.videoService.videoId = videoId;
    this.videoService.videoTags = tags;
    this.videoService.IsAddedFromLibrary = true;
    CommonService.parentNodeList = undefined;
    CommonService.isEditLessonQueueLoaded = false;
    if (this.userType === "Teacher") {
      if (localStorage.getItem('EditLesson') === null || localStorage.getItem('EditLesson') === "" ||
        localStorage.getItem('EditLesson') === undefined) {
        this.sharedService.initialiseLessonModel();
      }
      else {
        this.sharedService.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      }
      this.router.navigate(['/teacher/lesson-planner/add-video']);
    }
    else if (this.userType === "Student") {
      this.router.navigate(['/student/playlist/add-video']);
    }
  }

  roleFilterListing(role: any) {
    this.videoService.videosList = this.videoService.unfilteredVideoList;
    if (role === 'Made by me') {
      this.videoService.videosList = this.videoService.videosList.filter(x => x.CreatedBy === this.userId);
    }
  }

  openVideoDeleteDialog(videoId, videoName): void {
    this.videoService.currentVideoId = videoId;
    this.videoService.currentVideoName = videoName;
    this.dialog.open(ConfirmDeleteVideoComponent, {});
  }

  cloneVideo(ObjVideo) {
    this.videoService.get('/Video/GetVideoCloneName', new HttpParams().set("videoId", ObjVideo.VideoId)).subscribe((resultData: any) => {
      this.videoService.copyVideoName = resultData;
      this.videoService.cloneVideoId = ObjVideo.VideoId;
      this.videoService.videoTags = ObjVideo.Tags;
      this.videoService.videoData = ObjVideo;
      this.createVideoCopy();
    });
  }

  createVideoCopy(): any {
    if (this.videoService.cloneVideoId > 0) {
      this.videoService.videoData.videoId = 0;
      this.videoService.videoData.ParentVideoId = this.videoService.cloneVideoId;
      this.videoService.videoData.videoName = this.videoService.copyVideoName;
      this.videoService.videoData.CreatedByUserId = this.userId;
      this.lessonService.post('/Video/UpsertVideo', this.videoService.videoData, new HttpParams()).subscribe((response: any) => {
        this.toastr.success('Video Cloned Succesfully!!');
        this.videoService.videoId = 0;
        this.getVideoLibraries();
      });
    }
  }

  linkCopiedMessage() {
    this.toastr.success('Successfully Cloned!!! Enjoy the musical journey!!!');
  }
}
