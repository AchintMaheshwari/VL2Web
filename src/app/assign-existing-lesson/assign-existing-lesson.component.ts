import { Component, OnInit, Inject } from '@angular/core';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SharedlibraryService } from '../services/sharedlibrary.service';
import { ToastrService } from 'ngx-toastr';
import { GuidedvideoService } from '../services/guidedvideo.service';
import { HttpParams } from '@angular/common/http';
import { GuidedvideoComponent } from '../teacher/guidedvideo/guidedvideo.component';
import { LoaderService } from '../services/loader.service';
import { CommonService } from '../common/common.service';

@Component({
  selector: 'app-assign-existing-lesson',
  templateUrl: './assign-existing-lesson.component.html',
  styleUrls: ['./assign-existing-lesson.component.scss']
})
export class AssignExistingLessonComponent implements OnInit {
  LessonList: any;
  filterLessonByName: any;
  selected: any;

  constructor(private mScrollbarService: MalihuScrollbarService, public dialogRef: MatDialogRef<AssignExistingLessonComponent>,
    private toastr: ToastrService, public sharedService: SharedlibraryService,
    public guidedvideoService: GuidedvideoService, private loaderService: LoaderService) {
    this.guidedvideoService.getLessonsByUserId().subscribe(result => {
      this.LessonList = result;
    });
  }

  ngAfterViewInit() {
    this.mScrollbarService.initScrollbar('#divOne', { axis: 'y', theme: 'dark-thick', scrollButtons: { enable: true } });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

  selectLesson(lessonId: number, index: number) {
    this.guidedvideoService.assignLessonId = lessonId;
    this.selected = index;
    this.selected = lessonId;
  }

  hideModel() {
    this.dialogRef.close();
  }

  assignLesson() {

    if (this.guidedvideoService.assignLessonId != null)
      this.loaderService.processloader = true;
    this.guidedvideoService.post('/lesson/AssignLessonForGuidedVideo', null, new HttpParams()
      .set('lessonId', this.guidedvideoService.assignLessonId.toString())
      .set('teacherVideoClaimsMapId', this.guidedvideoService.teacherVideoClaimsMapId.toString())
      .set('userId', this.guidedvideoService.userId.toString())).subscribe((response: any) => {
        this.dialogRef.close();
        this.toastr.success('Lesson Assign Successfully!');

        this.guidedvideoService.getVideoSubmissionData(this.guidedvideoService.videoSubmissionId.toString()).subscribe((data: any) => {
          this.guidedvideoService.videoSubmissionData = data.result;
          if (this.guidedvideoService.videoSubmissionData.Source === "VLFBMC" || this.guidedvideoService.videoSubmissionData.Source === "FacebookMessangerManyChat") {
            let user = CommonService.getUser();
            let manyChatData = {
              "subscriber_id": this.guidedvideoService.videoSubmissionData.ExternalUserId,
              "data": {
                "version": "v2",
                "content": {
                  "messages": [{
                    "type": "text",
                    "text": "Hi from " + user.FirstName + " on VoiceLessons.com! Your video feedback is Ready. https://vlapp2.azurewebsites.net/#/student/gvFeedback/" + response.LessonGuid
                  }]
                }
              },
              "message_tag": "PAIRING_UPDATE"
            }
            this.guidedvideoService.post('/PostBackGVLFeedback', manyChatData, new HttpParams()).subscribe((response: any) => {
            });
          }
        });

        let guidedvideoComponent = new GuidedvideoComponent(this.guidedvideoService, null, this.toastr, null, this.loaderService);
        guidedvideoComponent.refreshList();
        this.loaderService.processloader = false;
      });
  }

  isActive(item) {
    return this.selected === item.LessonName;
  };
}
