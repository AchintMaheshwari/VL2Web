import { Component, OnInit, AfterContentInit, AfterViewInit, TemplateRef, Inject, OnDestroy } from '@angular/core';
import { TooltipModule, TabsModule, AccordionConfig, BsModalRef, BsModalService } from 'ngx-bootstrap';
import { LobbyService } from '../../../services/lobby.service';
import { HttpParams } from '@angular/common/http';
import { LessonModel } from '../../../models/lesson.model';
import { SharedlibraryService } from '../../../services/sharedlibrary.service';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { CommonService } from '../../../common/common.service';
import { ToastrService } from 'ngx-toastr';
import { SongsService } from '../../../services/song.service';
import { ExerciseLibraryService } from '../../../services/exercise-library.service';
import { GuidedvideoService } from '../../../services/guidedvideo.service';

declare var VidyoIOPlayer: any;
declare var VoiceLessons: any;
declare var VoiceLessonsExercisePlayer: any;
declare var LivePlayer: any;

@Component({
  selector: 'app-guidedvideo-lesson-planner',
  templateUrl: './guidedvideo-lesson-planner.component.html',
  styleUrls: ['./guidedvideo-lesson-planner.component.scss']
})
export class GuidedvideoLessonPlannerComponent implements OnInit {

  token: string = null;
  role: string = null;
  modalRef: BsModalRef;
  isDropup = true;
  LessonId = null;
  LessonModel: LessonModel;

  constructor(private modalService: BsModalService, public lobbyService: LobbyService, private toastr: ToastrService,
    public sharedLibrary: SharedlibraryService, public dialog: MatDialog, private router: Router, private songService: SongsService,
    private exerciseService: ExerciseLibraryService, public guidedvideoService: GuidedvideoService) {
    this.sharedLibrary.saveItemSource = "video";
    function getAccordionConfig(): AccordionConfig {
      return Object.assign(new AccordionConfig(), { closeOthers: true });
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'rateYourTeacher' })
    );
  }

  ngOnInit() {
    if (this.guidedvideoService.redirectfromExercise == false && this.guidedvideoService.redirectfromSong == false) {
      this.loadRecordVideoComponenet();
    } else {
      this.loadLibraryListComponent();
    }
    this.role = localStorage.getItem("UserType");
  }

  loadRecordVideoComponenet() {
    this.guidedvideoService.isLibrary = this.guidedvideoService.isSong = this.guidedvideoService.isExercise = this.guidedvideoService.isVideo = this.sharedLibrary.isStep2 = this.sharedLibrary.isStep3 = false;
    this.guidedvideoService.isRecordVideo = true;
  }

  loadLibraryListComponent() {
    this.guidedvideoService.isVideo = this.guidedvideoService.isSong = this.guidedvideoService.isExercise = this.guidedvideoService.isRecordVideo = this.sharedLibrary.isStep2 = this.sharedLibrary.isStep3 = false;
    this.guidedvideoService.isLibrary = true;
  }

  unloadLibraryListComponent() {
    this.guidedvideoService.isLibrary = this.guidedvideoService.isVideo = this.guidedvideoService.isSong = this.guidedvideoService.isExercise = this.sharedLibrary.isStep2 = this.sharedLibrary.isStep3 = false;
    this.guidedvideoService.isRecordVideo = true;
  }

  endLesson() {
    if (localStorage.getItem('GVLesson') != null && localStorage.getItem('GVLesson') != "") {
      this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
      if (this.guidedvideoService.LessonModel.Student != undefined) {
        if (this.guidedvideoService.LessonModel.Student.length > 0) {
          this.guidedvideoService.LessonModel.Student.forEach(element => {
            if (this.guidedvideoService.LessonModel.Users == null)
              this.guidedvideoService.LessonModel.Users = element.UserId + ',';
            else
              this.guidedvideoService.LessonModel.Users = this.guidedvideoService.LessonModel.Users + element.UserId + ',';
          });
        }
        else {
          this.guidedvideoService.LessonModel.Users = "";
        }
      }
      else {
        this.guidedvideoService.LessonModel.Users = "";
      }
      if (this.guidedvideoService.libraryNodes != undefined) {
        var nodeLength = this.guidedvideoService.libraryNodes.length;
        for (let index = 0; index < nodeLength; index++) {
          if (this.guidedvideoService.libraryNodes[0].LabelName == 'Drag Here!...') {
            this.guidedvideoService.libraryNodes.splice(index, 1);
            break;
          }
        }
        if (this.guidedvideoService.libraryNodes.length > 0) {
          this.guidedvideoService.LessonModel.LessonQueue = JSON.stringify(this.guidedvideoService.libraryNodes);
        } else {
          this.guidedvideoService.LessonModel.LessonQueue = "";
        }
      } else {
        this.guidedvideoService.LessonModel.LessonQueue = "";
      }
      if (this.guidedvideoService.LessonModel.Tags == null) {
        this.guidedvideoService.LessonModel.Tags = "";
      }
      this.guidedvideoService.LessonModel.isGuidedVideoLessonCompleted = true;
      //this.guidedvideoService.LessonModel.Ended = CommonService.convertToUTCDate(Date.now.toString());
      this.guidedvideoService.LessonModel.Ended = CommonService.convertToUTCDate(new Date().toString());
      this.guidedvideoService.post('/lesson/UpsertLesson', this.guidedvideoService.LessonModel, new HttpParams()).subscribe((response: any) => {
        if ((this.guidedvideoService.videoSubmissionData.Source === "VLFBMC" || this.guidedvideoService.videoSubmissionData.Source === "FacebookMessangerManyChat")
          && this.guidedvideoService.LessonModel.isGuidedVideoLessonCompleted) {
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
        this.toastr.success("Lesson ended successfully.");
        localStorage.removeItem("GVLesson");
        localStorage.removeItem("VideoSubmissionId");
        this.guidedvideoService.LessonModel = null;
        CommonService.isGVLessonQueueLoaded = false;
        this.router.navigate(['teacher/guidedvideo-lessonplanner/feedbackcomplete']);
      });
    }
  }

  claimStudentFeedback(videoSubmissionId) {
    let userId = CommonService.getUser().UserId;

    this.guidedvideoService.post("/guidedVideo/ClaimGuidedVideo", null, new HttpParams().set('videoSubmissionId', videoSubmissionId).set('userId', userId)).subscribe((response: any) => {

      this.guidedvideoService.initialiseLessonModel();

      if (this.guidedvideoService.LessonModel.Tags == null) {
        this.guidedvideoService.LessonModel.Tags = "";
      }
     
      this.guidedvideoService.LessonModel.LessonName = 'Beginner Warmup Basics';
      this.guidedvideoService.post('/lesson/UpsertLesson', this.guidedvideoService.LessonModel, new HttpParams()).subscribe((response: any) => {

        if (localStorage.getItem("claimStudent").length > 2) {
          var nextvideoSubmissionId;
          var videoSubmission = localStorage.getItem("claimStudent");
          localStorage.setItem("claimStudent", videoSubmission.substring(2));
          nextvideoSubmissionId = videoSubmission.split(',')[0];
          this.claimStudentFeedback(nextvideoSubmissionId);
        }
        else if (localStorage.getItem("claimStudent").length == 1) {
          var nextvideoSubmissionId;
          var videoSubmission = localStorage.getItem("claimStudent");
          localStorage.setItem("claimStudent", videoSubmission.substring(2));
          nextvideoSubmissionId = videoSubmission;
          this.claimStudentFeedback(nextvideoSubmissionId);
        }
        this.guidedvideoService.LessonModel = response;
        localStorage.setItem("GVLesson", JSON.stringify(this.guidedvideoService.LessonModel));
      });
    });
  }


  addSong() {
    this.guidedvideoService.isLibrary = this.guidedvideoService.isExercise = this.guidedvideoService.isVideo = this.sharedLibrary.isStep2 = this.sharedLibrary.isStep3 = false;
    this.guidedvideoService.isSong = true;
    this.songService.songId = 0;
    this.songService.songTags = "";
    this.songService.IsAddedFromLibrary = false;
    this.router.navigate(['/teacher/guidedvideo-lessonplanner/add-song']);
    if (localStorage.getItem('GVLesson') != null && localStorage.getItem('GVLesson') != "") {
      this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
      CommonService.isGVLessonQueueLoaded = false;
    }
  }

  addExercise() {
    this.guidedvideoService.isLibrary = this.guidedvideoService.isSong = this.guidedvideoService.isVideo = this.sharedLibrary.isStep2 = this.sharedLibrary.isStep3 = false;
    this.guidedvideoService.isExercise = true;
    this.exerciseService.exerciseId = 0;
    this.exerciseService.exerciseTags = "";
    this.exerciseService.IsAddedFromLibrary = false;
    this.router.navigate(['/teacher/guidedvideo-lessonplanner/add-exercise']);
    if (localStorage.getItem('GVLesson') != null && localStorage.getItem('GVLesson') != "") {
      this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
      CommonService.isGVLessonQueueLoaded = false;
    }
  }

  addVideo() {
    this.router.navigate(['/teacher/guidedvideo-lessonplanner/add-video']);
    if (localStorage.getItem('GVLesson') != null && localStorage.getItem('GVLesson') != "") {
      this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
      CommonService.isGVLessonQueueLoaded = false;
    }
  }
}
