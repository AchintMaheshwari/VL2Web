import { Component, OnInit, AfterContentInit, AfterViewInit, TemplateRef, Inject, OnDestroy } from '@angular/core';
import { TooltipModule, TabsModule, AccordionConfig, BsModalRef, BsModalService } from 'ngx-bootstrap';
import { LobbyService } from '../../../services/lobby.service';
import { HttpParams } from '@angular/common/http';
import { LessonModel } from '../../../models/lesson.model';
import { SharedlibraryService } from '../../../services/sharedlibrary.service';
import { MatDialog } from '../../../../../node_modules/@angular/material';
import { Router } from '../../../../../node_modules/@angular/router';
import { CommonService } from '../../../common/common.service';
import { ToastrService } from 'ngx-toastr';
import { SongsService } from '../../../services/song.service';
import { ExerciseLibraryService } from '../../../services/exercise-library.service';
import { RateTeacherDialogComponent } from '../../../student/rate-teacher-dialog/rate-teacher-dialog.component';

declare var VidyoIOPlayer: any;
declare var VoiceLessons: any;
declare var VoiceLessonsExercisePlayer: any;
declare var LivePlayer: any;
declare var vidyoConnector: any;

@Component({
  selector: 'app-connected',
  templateUrl: './connected.component.html',
  styleUrls: ['./connected.component.scss'],
})

export class ConnectedComponent implements OnInit, OnDestroy {
  ngOnDestroy() {
    CommonService.parentNodeList = undefined;
    this.sharedLibrary.libraryNodes = undefined;
    VoiceLessons.destoryPlayer();
    VoiceLessonsExercisePlayer.stopMusic();
    CommonService.isEditLessonQueueLoaded = false;
    CommonService.isPlayerStarted = false;
    clearInterval(LivePlayer.checkFormControllerProperties);
  }
  token: string = null;
  role: string = null;
  modalRef: BsModalRef;
  isDropup = true;
  LessonId = null;
  LessonModel: LessonModel;

  isStudent: number;

  displayName: string;

  constructor(private modalService: BsModalService, public lobbyService: LobbyService, private toastr: ToastrService,
    public sharedLibrary: SharedlibraryService, public dialog: MatDialog, private router: Router, private songService: SongsService,
    private exerciseService: ExerciseLibraryService) {
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
    

    var userData = CommonService.getUser();
   
    this.isStudent = userData.IsStudent;

    if(this.isStudent == 0) 
      this.displayName = localStorage.getItem('lobbyStudentDisplayName');
    else 
      this.displayName = localStorage.getItem('lobbyTeacherDisplayName');

    this.unloadLibraryListComponent();
    localStorage.setItem("UserName", 'Achint');
    this.role = localStorage.getItem("UserType");
    this.lobbyService.get("/vidyo/CreateToken", new HttpParams()).subscribe((resultData: any) => {
      this.token = resultData;
      localStorage.setItem("Token", resultData);
      VidyoIOPlayer.init(this.token);
    });
  }

  loadLibraryListComponent() {
    this.sharedLibrary.isSong = this.sharedLibrary.isExercise = this.sharedLibrary.isVideo = this.sharedLibrary.isStep2 = this.sharedLibrary.isStep3 = false;
    this.sharedLibrary.isLibrary = true;
  }

  unloadLibraryListComponent() {
    this.sharedLibrary.isLibrary = this.sharedLibrary.isSong = this.sharedLibrary.isExercise = this.sharedLibrary.isStep2 = this.sharedLibrary.isStep3 = false;
    this.sharedLibrary.isVideo = true;
  }

  endLesson() {
    if(vidyoConnector != null)
    vidyoConnector.Disconnect();

    if (this.isStudent == 0) {
      if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
        this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
        if (this.sharedLibrary.LessonModel.Student != undefined) {
          if (this.sharedLibrary.LessonModel.Student.length > 0) {
            this.sharedLibrary.LessonModel.Student.forEach(element => {
              if (this.sharedLibrary.LessonModel.Users == null)
                this.sharedLibrary.LessonModel.Users = element.UserId + ',';
              else
                this.sharedLibrary.LessonModel.Users = this.sharedLibrary.LessonModel.Users + element.UserId + ',';
            });
          }
          else {
            this.sharedLibrary.LessonModel.Users = "";
          }
        }
        else {
          this.sharedLibrary.LessonModel.Users = "";
        }
        if (this.sharedLibrary.libraryNodes != undefined) {
          var nodeLength = this.sharedLibrary.libraryNodes.length;
          for (let index = 0; index < nodeLength; index++) {
            if (this.sharedLibrary.libraryNodes[0].LabelName == 'Drag Here!...') {
              this.sharedLibrary.libraryNodes.splice(index, 1);
              break;
            }
          }
          if (this.sharedLibrary.libraryNodes.length > 0) {
            this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(this.sharedLibrary.libraryNodes);
          } else {
            this.sharedLibrary.LessonModel.LessonQueue = "";
          }
        } else {
          this.sharedLibrary.LessonModel.LessonQueue = "";
        }
        if (this.sharedLibrary.LessonModel.Tags == null) {
          this.sharedLibrary.LessonModel.Tags = "";
        }
        //this.sharedLibrary.LessonModel.Ended = CommonService.convertToUTCDate(Date.now.toString());
        this.sharedLibrary.LessonModel.Ended =  CommonService.convertToUTCDate(new Date().toString());
        this.sharedLibrary.post('/lesson/UpsertLesson', this.sharedLibrary.LessonModel, new HttpParams()).subscribe((response: any) => {          
          LivePlayer.SendEndLesson(true);
          this.toastr.success("Lesson ended successfully.");
          localStorage.removeItem("EditLesson");
          localStorage.removeItem("LessonGuid");
          this.sharedLibrary.LessonModel = null;
          CommonService.isEditLessonQueueLoaded = false;
           if (localStorage.getItem('userRole') == 'Teacher')
            this.router.navigate(['teacher/dashboard'])
          else
            this.router.navigate(['student/dashboard'])
        });
      } else {
        if (this.sharedLibrary.libraryNodes != undefined) {
          var nodeLength = this.sharedLibrary.libraryNodes.length;
          for (let index = 0; index < nodeLength; index++) {
            if (this.sharedLibrary.libraryNodes[0].LabelName == 'Drag Here!...') {
              this.sharedLibrary.libraryNodes.splice(index, 1);
              break;
            }
          }
          if (this.sharedLibrary.libraryNodes.length > 0) {
            this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(this.sharedLibrary.libraryNodes);
          } else {
            this.sharedLibrary.LessonModel.LessonQueue = "";
          }
        } else {
          this.sharedLibrary.LessonModel.LessonQueue = "";
        }

        if (CommonService.treeViewObject == null) {
          this.sharedLibrary.LessonModel.LessonHistory = '';
        }
        else {
          this.sharedLibrary.LessonModel.LessonHistory = JSON.stringify(CommonService.treeViewObject.libraryHistory);
        }
        if (this.sharedLibrary.LessonModel.Tags == null) {
          this.sharedLibrary.LessonModel.Tags = "";
        }
        //this.sharedLibrary.LessonModel.Ended = CommonService.convertToUTCDate(Date.now.toString());
        this.sharedLibrary.LessonModel.Ended =  CommonService.convertToUTCDate(new Date().toString());
        this.sharedLibrary.post('/lesson/UpsertLesson', this.sharedLibrary.LessonModel, new HttpParams()).subscribe((response: any) => {
          this.toastr.success("Lesson ended successfully.");
          localStorage.removeItem("EditLesson");
          localStorage.removeItem("LessonGuid");
          this.sharedLibrary.LessonModel = null;
           if (localStorage.getItem('userRole') == 'Teacher')
            this.router.navigate(['teacher/dashboard'])
          else
            this.router.navigate(['student/dashboard']) 
        });
      }
    }
    else {
      if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
        this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
        this.openRateTeacherDialog();
      }
    }
  }

  addSong() {
    this.sharedLibrary.isLibrary = this.sharedLibrary.isExercise = this.sharedLibrary.isVideo = this.sharedLibrary.isStep2 = this.sharedLibrary.isStep3 = false;
    this.sharedLibrary.isSong = true;
    this.songService.songId = 0;
    this.songService.songTags = "";
    this.songService.IsAddedFromLibrary = false;
    if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
      this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      CommonService.isEditLessonQueueLoaded = false;
    }
  }

  addExercise() {
    this.sharedLibrary.isLibrary = this.sharedLibrary.isSong = this.sharedLibrary.isVideo = this.sharedLibrary.isStep2 = this.sharedLibrary.isStep3 = false;
    this.sharedLibrary.isExercise = true;
    this.exerciseService.exerciseId = 0;
    this.exerciseService.exerciseTags = "";
    this.exerciseService.IsAddedFromLibrary = false;
    if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
      this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      CommonService.isEditLessonQueueLoaded = false;
    }
  }

  openRateTeacherDialog(): void {
    const dialogRef = this.dialog.open(RateTeacherDialogComponent, {
      maxHeight: '80vh'
    });
  }


}
