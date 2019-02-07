import { Component, OnInit } from '@angular/core';

import { StudentService } from '../../../services/student.service';
import { UserChatAdapter } from '../../../services/UserChat-adapter';
import { TeacherService } from '../../../services/teacher.service';
import { CommonService } from '../../../common/common.service';
import { HttpParams } from '@angular/common/http';
import { TeacherProfileStatusModel } from '../../../models/teacherProfileStatus.model';
import { Router } from '@angular/router';
import { MatDialog } from '../../../../../node_modules/@angular/material';
import { AddStudentModalDialogComponent } from '../../../add-student-modal-dialog/add-student-modal-dialog.component';
import { SharedlibraryService } from '../../../services/sharedlibrary.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { CalendarService } from '../../../services/calendar.service';
import { LoaderService } from '../../../services/loader.service';
import { CurrencyPipe } from '@angular/common';
import { ChatAdapter } from '../../../ng-chat/core/chat-adapter';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss']
})
export class TeacherDashboardComponent implements OnInit {

  isDropup: Boolean = true;
  upcomingSchedules: any;
  teacherProfileLink = "teacher/profile"
  public adapter: ChatAdapter
  todayDate: string;
  profileStatusData: TeacherProfileStatusModel;
  profileStatusId: string;
  percentage: any;
  isProfileComplete: boolean = false;
  selectedSpecificDate: any;
  selectedSpecificTime: any;
  selectedDate: any;
  eventId: number = 0;
  dateTimefrom: NgbTimeStruct = { hour: 15, minute: 30, second: 30 };
  dateTimeTo: NgbTimeStruct = { hour: 16, minute: 30, second: 30 };
  meridian = true;
  calendarEvent: any;
  associatedStudentsList: any;
  teacherPayments: any;
  showPaymentFlag: boolean = false;
  monthlyEarned: any = null;
  yearlyEarned: any = null;
  teacherReviews: any = null;
  constructor(private studentService: StudentService, private teacherService: TeacherService, private router: Router,
    public dialog: MatDialog, private sharedlibraryService: SharedlibraryService, private toastr: ToastrService,
    private calendarService: CalendarService, private loaderService: LoaderService) {
    this.isDropup = true;
    this.initializeProfileCompletionData();
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(AddStudentModalDialogComponent, {
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  ngOnInit(): void {
    this.todayDate = moment.utc(new Date()).format('MM.DD.YY');
    var userData = CommonService.getUser();
    this.profileStatusId = userData.TeacherProfileStatusId;
    this.adapter = new UserChatAdapter(this.studentService, this.teacherService);
    this.getTeacherProfileCompletionData();
    this.getTeacherUpcomingSchedules();
    this.getAssociatedStudents();
    this.getTeacherPayments();
    this.getTeacherPaymentsEarned();
    this.getTeacherReviews();
    CommonService.isEditLessonQueueLoaded = false;
  }

  getTeacherProfileCompletionData() {
    this.teacherService.get('/tProfile/GetTeacherProfileCompletionStatus', new HttpParams().
      set('profileStatusId', this.profileStatusId)).subscribe((result: any) => {
        this.profileStatusData = result;
        this.isProfileComplete = result.ProfileCompletionflag;
        this.percentage = result.PercentageCompletion + '%';
      });
  }

  getTeacherUpcomingSchedules() {
    this.loaderService.processloader = true;
    this.teacherService.getTeacherUpcomingSchedules().subscribe((result: any) => {
      this.loaderService.processloader = false;
      result.forEach(element => {
        let scheduleData = moment(element.EventDate).format();
        element.EventStartTime = CommonService.convertUTCToUserTime(element.EventStartTime);
        element.EventEndTime = CommonService.convertUTCToUserTime(element.EventEndTime);
        if (this.calendarService.bookingTimeValidation(scheduleData, element.EventStartTime)) {
          element["isActionAllowed"] = true;
        }
        else {
          element["isActionAllowed"] = false;
        }
      });
      this.upcomingSchedules = result;
    })
  }

  initializeProfileCompletionData() {
    this.profileStatusData = {
      TeacherProfileStatusId: 0,
      TeacherId: 0,
      TeacherProfileId: 0,
      SettingsFlag: false,
      RatesFlag: false,
      LinkFlag: false,
      AvailabilityFlag: false,
      ProfileFlag: false,
      StripeConnectFlag: false,
      ProfileCompletionflag: false,
      PercentageCompletion: 0
    }
  }

  completeTeacherProfile() {
    if (!this.profileStatusData.SettingsFlag) {
      this.router.navigateByUrl('/teacher/settings');
    }
    else if (!this.profileStatusData.RatesFlag) {
      this.router.navigateByUrl('/teacher/rate-settings');
    }
    else if (!this.profileStatusData.LinkFlag) {
      this.router.navigateByUrl('/teacher/link-setting');
    }
    else if (!this.profileStatusData.AvailabilityFlag) {
      this.router.navigateByUrl('/teacher/calendar');
    }
    else if (!this.profileStatusData.ProfileFlag) {
      this.router.navigateByUrl('/teacher/profile/edit');
    }
    else if (!this.profileStatusData.StripeConnectFlag) {
      this.router.navigateByUrl('/teacher/payment');
    }
  }

  redirectToPlanner() {
    this.sharedlibraryService.LessonModel = null;
    localStorage.setItem("EditLesson", "");
  }

  openFullSchedule() {
    this.router.navigateByUrl('/teacher/calendar');
  }

  openPayments() {
    this.router.navigateByUrl('/teacher/payment');
  }

  getAssociatedStudents() {
    this.teacherService.getStudentsAssociatedToTeacher().subscribe((response: any) => {
      this.associatedStudentsList = response;
    })
  }

  getTeacherPayments() {
    this.teacherService.getTeacherLatestPayments().subscribe((response: any) => {
      this.teacherPayments = response;
      if (this.teacherPayments.length > 0)
        this.showPaymentFlag = true;
    })
  }

  getTeacherPaymentsEarned() {
    this.teacherService.getTeacherPaymentsEarned().subscribe((response: any) => {
      this.monthlyEarned = response.MonthlyEarned != null ? response.MonthlyEarned : 0;
      this.yearlyEarned = response.YearlyEarned != null ? response.YearlyEarned : 0;
    })
  }

  getTeacherReviews() {
    this.teacherService.getTeacherReviews().subscribe((response: any) => {
      this.teacherReviews = response;
    })
  }

  rescheduleSlot(schedule: any) {
    this.eventId = schedule.CalendarEventID;
    this.selectedDate = moment(schedule.EventDate).format("YYYY-MM-DD");
    this.selectedSpecificTime = schedule.EventStartTime;
    this.selectedSpecificDate = moment.utc(schedule.EventDate).format('ddd MMM DD YYYY');
    this.dateTimefrom = {
      hour: parseInt(moment(schedule.EventDate + ' ' + schedule.EventStartTime).format('HH')),
      minute: parseInt(moment(schedule.EventDate + ' ' + schedule.EventStartTime).format('mm')),
      second: 30
    };
    this.dateTimeTo = {
      hour: parseInt(moment(schedule.EventDate + ' ' + schedule.EventEndTime).format('HH')),
      minute: parseInt(moment(schedule.EventDate + ' ' + schedule.EventEndTime).format('mm')),
      second: 30
    };
  }

  cancelSlot(schedule: any) {
    this.eventId = schedule.CalendarEventID;
    this.selectedSpecificDate = moment.utc(schedule.EventDate).format('ddd MMM DD YYYY');
    this.selectedDate = moment(schedule.EventDate).format("YYYY-MM-DD");
    this.selectedSpecificTime = schedule.EventStartTime;
  }

  setBookingData(id: number) {
    let availablehousfrom = this.dateTimefrom.hour + ":" + this.dateTimefrom.minute;
    let availablehousTo = this.dateTimeTo.hour + ":" + this.dateTimeTo.minute;
    this.calendarEvent = {
      CalendarEventId: id,
      BookingId: 0,
      EventName: "Teacher is booked",
      EventStartDate: CommonService.convertBlockDateTimeToUTC(moment(this.selectedDate).format('YYYY-MM-DD'), availablehousfrom),
      EventEndDate: CommonService.convertBlockDateTimeToUTC(moment(this.selectedDate).format('YYYY-MM-DD'), availablehousTo),
    }
    if (this.calendarService.bookingTimeValidation(moment(this.selectedSpecificDate).format("YYYY-MM-DD"), this.selectedSpecificTime)) {
      if (this.calendarService.timeValidation(availablehousfrom, availablehousTo)) {
        this.saveEditedBookingData();
      }
    }
    else {
      this.toastr.error("Sorry, you can not reschedule your booking slot within 24 hours of booking.");
    }
  }

  saveEditedBookingData() {
    if (this.calendarService.bookingTimeValidation(this.selectedDate, this.selectedSpecificTime)) {
      this.calendarService.post("/booking/UpsertBookingEvents", this.calendarEvent, new HttpParams()).subscribe((response: any) => {
        let index = this.upcomingSchedules.findIndex(i => i.CalendarEventID === response.id);
        if (index > -1) {
          this.upcomingSchedules[index].EventDate = moment(this.selectedDate).format('MM/DD/YYYY');
          this.upcomingSchedules[index].EventStartTime = CommonService.convertToUserTime(response.start);
          this.upcomingSchedules[index].EventEndTime = CommonService.convertToUserTime(response.end);
        }
        this.upcomingSchedules = this.upcomingSchedules.sort((a, b) => {
          if (a.EventDate > b.EventDate) {
            return 1;
          } else if (a.EventDate < b.EventDate) {
            return -1;
          } else {
            return 0;
          }
        });
        this.toastr.success('Booking slot successfully rescheduled');
      });
    }
    else {
      this.toastr.error("Sorry, you can not reschedule your booked slot within 24 hours of booking.");
    }
  }

  cancelEvent(id: number) {
    if (this.calendarService.bookingTimeValidation(this.selectedDate, this.selectedSpecificTime)) {
      this.loaderService.processloader = true;
      this.calendarService.post("/booking/CancelTeacherBooking", null, new HttpParams().set('eventId', id.toString())).subscribe((response: any) => {
        this.loaderService.processloader = false;
        if (response) {
          this.getTeacherUpcomingSchedules();
          this.toastr.success('Booking slot successfully canceled.');
        }
        else {
          this.toastr.error('Booking slot cancellation failed. Please try again.');
        }
      });
    }
    else {
      this.toastr.error("Sorry, you can not cancel your booked slot within 24 hours of booking.");
    }
  }
}
