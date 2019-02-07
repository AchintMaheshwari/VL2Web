import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../services/student.service';
import { TeacherService } from '../../../services/teacher.service';
import { CommonService } from '../../../common/common.service';
import { HttpParams } from '@angular/common/http';
import { StudentProfileStatusModel } from '../../../models/studentProfileStatus.model';
import { Router } from '@angular/router';
import { SchedulingService } from '../../../services/Scheduling.Service';
import { LoaderService } from '../../../services/loader.service';
import { RateTeacherService } from '../../../services/rate-teacher.service';
import { MatDialog } from '../../../../../node_modules/@angular/material';
import { RateTeacherDialogComponent } from '../../rate-teacher-dialog/rate-teacher-dialog.component';
import { GuidedvideoService } from '../../../services/guidedvideo.service';

declare var LivePlayer: any;
@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  //public adapter: ChatAdapter;
  associatedTeachersList: any;
  upcomingSchedules: any;
  id: any;
  constructor(private studentService: StudentService, private teacherService: TeacherService, private router: Router,
    private schedulingService: SchedulingService, private route: Router, private loaderService: LoaderService,
    private rateTeacherService: RateTeacherService, public dialog: MatDialog, private guidedvideoService: GuidedvideoService) {
    this.initializeProfileCompletionData();
  }

  userId: any;
  profileStatusData: StudentProfileStatusModel;
  profileStatusId: string;
  percentage: any;
  isProfileComplete: boolean = false;
  lessonStartTimeLeft: number;
  lessonStartTeacherName: string;
  lessonStartStudentName: string;
  pendingReview: any;

  ngOnInit(): void {
    var userData = CommonService.getUser();
    this.userId = userData.Student[0].StudentId;
    this.profileStatusId = userData.StudentProfileStatusId;
    this.getStudentProfileCompletionData();
    this.getAssociatedTeachers();
    this.getStudentUpcomingSchedules();
    this.getUpcomingLessonTime();
    this.id = setInterval(() => {
      this.getUpcomingLessonTime();
    }, 60000);
    if (this.guidedvideoService.guidedLessonGuid == "" || this.guidedvideoService.guidedLessonGuid == undefined) {
      this.openReviewTeacherPopForGuidedVideoLesson();
    }
    this.guidedvideoService.guidedLessonGuid = "";
  }

  ngOnDestroy() {
    if (this.id) {
      clearInterval(this.id);
    }
  }

  openReviewTeacherPopForGuidedVideoLesson() {
    if (CommonService.isLogin == true) {
      CommonService.isLogin = false;
      let userData = CommonService.getUser();
      var studentId = userData.Student[0].StudentId;
      var userId = userData.UserId;
      this.rateTeacherService.getPendingGuidedLessonReview(studentId, userId).subscribe((response: any) => {
        this.pendingReview = response;
        if (this.pendingReview.length > 0) {
          this.rateTeacherService.TeacherReviewModel.StudentUserId = this.pendingReview[0].StudentUserId;
          this.rateTeacherService.TeacherReviewModel.TeacherUserId = this.pendingReview[0].TeacherUserId;
          this.rateTeacherService.TeacherReviewModel.LessonId = this.pendingReview[0].LessonId;
          const dialogRef = this.dialog.open(RateTeacherDialogComponent, {
            maxHeight: '80vh'
          });
        }
      });
    }
  }

  getUpcomingLessonTime() {
    this.studentService.get('/student/GetUpcomingLessonTime', new HttpParams().
      set('studentId', this.userId)).subscribe((result: any) => {
        var data = result.split(',');
        this.lessonStartTimeLeft = data[0];
        this.lessonStartTeacherName = data[1];
        this.lessonStartStudentName = data[2];
      });
  }

  getStudentProfileCompletionData() {
    this.loaderService.processloader = true;
    this.studentService.get('/sProfile/GetStudentProfileCompletionStatus', new HttpParams().
      set('profileStatusId', this.profileStatusId)).subscribe((result: any) => {
        this.loaderService.processloader = false;
        this.profileStatusData = result;
        this.isProfileComplete = result.ProfileCompletionflag;
        this.percentage = result.PercentageCompletion + '%';
        // if (!(this.profileStatusData.QuestionnaireFlag && this.profileStatusData.VideoFlag)) {
        //   this.completeStudentOnBoardingFlow();
        // }
      });
  }

  initializeProfileCompletionData() {
    this.profileStatusData = {
      StudentProfileStatusId: 0,
      StudentId: 0,
      StudentProfileId: 0,
      SettingsFlag: false,
      QuestionnaireFlag: false,
      VideoFlag: false,
      ProfileFlag: false,
      ProfileCompletionflag: false,
      PercentageCompletion: 0
    }
  }

  getAssociatedTeachers() {
    this.studentService.getStudentAssociatedTeachers().subscribe((response: any) => {
      this.associatedTeachersList = response;
    })
  }

  getStudentUpcomingSchedules() {
    this.studentService.getStudentUpcomingSchedules().subscribe((result: any) => {
      result.forEach(element => {
        element.EventStartTime = CommonService.convertUTCToUserTime(element.EventStartTime);
        element.EventEndTime = CommonService.convertUTCToUserTime(element.EventEndTime);
      });
      this.upcomingSchedules = result;
    })
  }

  rescheduleBooking(bookingId: number) {
    this.loaderService.processloader = true;
    this.schedulingService.getStudentScheduledLessonData(bookingId).subscribe((result: any) => {
      this.loaderService.processloader = false;
      this.schedulingService.isReschedule = true;
      this.schedulingService.studentScheduleObject = result;
      if (this.schedulingService.studentScheduleObject.BookingType == 'Recurring') {
        this.route.navigateByUrl('/student/schedule/selectdates');
      }
      else {
        this.route.navigateByUrl('/student/schedule/singleandmultiple');
      }
    })
  }

  completeStudentProfile() {
    if (!this.profileStatusData.QuestionnaireFlag) {
      this.router.navigateByUrl('/student/questionnaire');
    }
    else if (!this.profileStatusData.VideoFlag) {
      this.router.navigateByUrl('/student/guidedvideofeedback/add-video');
    }
    else if (!this.profileStatusData.ProfileFlag) {
      this.router.navigateByUrl('/student/profile/edit');
    }
    else if (!this.profileStatusData.SettingsFlag) {
      this.router.navigateByUrl('/student/personal-info');
    }
  }

  completeStudentOnBoardingFlow() {
    if (!this.profileStatusData.QuestionnaireFlag) {
      this.router.navigateByUrl('/student/questionnaire');
    }
    else if (!this.profileStatusData.VideoFlag) {
      this.router.navigateByUrl('/student/guidedvideofeedback/add-video');
    }
  }

  startLobbyLesson() {
    localStorage.setItem('lobbyStudentDisplayName', this.lessonStartStudentName);
    localStorage.setItem('lobbyStudentId', this.userId);
    LivePlayer.livePlayerHasInit = false;
    this.router.navigate(['/teacher/lobby'])
  }
}
