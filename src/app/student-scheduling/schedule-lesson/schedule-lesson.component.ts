import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { SchedulingService } from '../../services/Scheduling.Service';
import { CommonService } from '../../common/common.service';

@Component({
  selector: 'app-schedule-lesson',
  templateUrl: './schedule-lesson.component.html',
  styleUrls: ['./schedule-lesson.component.scss']
})

export class ScheduleLessonComponent implements OnInit {
  buttonDisabled: boolean;
  constructor(private route: Router, public schedulingService: SchedulingService, private commonService: CommonService) {
    this.buttonDisabled = true;
  }

  ngOnInit() {
    this.initialiseStudentSchedule();
  }

  getScheduleRelatedData() {
    if (!this.schedulingService.isInitialDataLoaded) {
      this.schedulingService.getTeacherLessonRatesData().subscribe(result => {
        this.schedulingService.ratesArray = result;
        this.schedulingService.isInitialDataLoaded = true;
        if (this.schedulingService.linkData != null) {
          this.schedulingService.rateId = this.schedulingService.ratesArray.
            find(i => i.Duration === this.schedulingService.linkData.LessonLength).RateId;
          if (this.schedulingService.rateId > 0 && this.schedulingService.studentScheduleObject != null) {
            this.schedulingService.studentScheduleObject.LessonDuration = this.schedulingService.linkData.LessonLength;
            this.schedulingService.studentScheduleObject.LessonPrice = this.schedulingService.linkData.LessonPrice;
          }
          this.disableNextButton();
        }
      });

      this.schedulingService.getStudentScheduledLessonData(0).subscribe(result => {
        let schedulingData = this.schedulingService.studentScheduleObject;
        this.schedulingService.studentScheduleObject = result;
        if (result.BookingId === 0) {
          this.schedulingService.studentScheduleObject.CalendarEvents = [];
          this.schedulingService.allSelectedDateObject = [];
        }
        this.schedulingService.studentScheduleObject.BookingDate = new Date(result.BookingDate);
        this.schedulingService.isInitialDataLoaded = true;
        if (this.schedulingService.linkData != null) {
          this.schedulingService.studentScheduleObject.LessonType = this.schedulingService.linkData.LessonType;
          this.schedulingService.studentScheduleObject.BookingType = this.schedulingService.linkData.BookingType;
          this.schedulingService.studentScheduleObject.LessonDuration = this.schedulingService.linkData.LessonLength;
          this.schedulingService.studentScheduleObject.LessonPrice = this.schedulingService.linkData.LessonPrice;
        }
        this.schedulingService.studentScheduleObject.StudentUserId = schedulingData.StudentUserId;
        this.schedulingService.studentScheduleObject.TeacherUserId = schedulingData.TeacherUserId;
        this.disableNextButton();
      });
    }
  }

  initialiseStudentSchedule() {
    let userData = JSON.parse(localStorage.getItem('userData'));
    var teacherId = this.commonService.associatedTeacherId;
    if(this.schedulingService.linkData != null){
      teacherId = this.schedulingService.linkData.TeacherUserId;
    }
    if (teacherId === undefined) {
      let studentId = userData.Student[0].StudentId;
      this.schedulingService.get('/lesson/GetAssociatedTeacher', new HttpParams().
        set("studentId", studentId)).subscribe((resultData: any) => {
          this.commonService.associatedTeacherId = resultData;
          this.schedulingService.initializeSchedule(userData, resultData);
          this.disableNextButton();
          this.getScheduleRelatedData();
        });
    }
    else {
      this.schedulingService.initializeSchedule(userData, teacherId);
      this.disableNextButton();
      this.getScheduleRelatedData();
    }
  }

  onLessonTypeSelection(type) {
    this.schedulingService.studentScheduleObject.LessonType = type;
    this.disableNextButton();
  }

  onBookingTypeSelection(bookingType) {
    if (this.schedulingService.studentScheduleObject.BookingType != null &&
      this.schedulingService.studentScheduleObject.CalendarEvents.length > 0) {
      if (confirm("Changing the booking type will clear out all your selected slots. Do you wish to continue?")) {
        if (this.schedulingService.studentScheduleObject.BookingType == 'Recurring') {
          this.schedulingService.recurringWeekDayName = '';
          this.schedulingService.recurringTimeSlot = '';
        }
        this.schedulingService.studentScheduleObject.CalendarEvents = [];
        this.schedulingService.allSelectedDateObject = [];
        this.schedulingService.studentScheduleObject.BookingType = bookingType;
        this.disableNextButton();
      }
    }
    else {
      this.schedulingService.studentScheduleObject.BookingType = bookingType;
      this.disableNextButton();
    }
  }

  onLessonRateSelection(rateDetails) {
    this.schedulingService.rateId = rateDetails.RateId;
    this.schedulingService.studentScheduleObject.LessonDuration = rateDetails.Duration;
    this.schedulingService.studentScheduleObject.LessonPrice = rateDetails.Price;
    this.disableNextButton();
  }

  disableNextButton() {
    if (this.schedulingService.studentScheduleObject != undefined) {
      if ((this.schedulingService.studentScheduleObject.LessonType != '' || this.schedulingService.studentScheduleObject.LessonType != null) &&
        (this.schedulingService.studentScheduleObject.BookingType != '' || this.schedulingService.studentScheduleObject.BookingType != null) &&
        this.schedulingService.rateId > 0) {
        this.buttonDisabled = false;
      }
      else {
        this.buttonDisabled = true;
      }
    }
  }

  onNextClick() {
    if (this.schedulingService.studentScheduleObject.BookingType == 'Recurring') {
      this.route.navigateByUrl('/student/schedule/selectdates');
    }
    else {
      this.route.navigateByUrl('/student/schedule/singleandmultiple');
    }
  }

  onBack(){
    this.route.navigate(['/student/schedule/personalsettings']);
  }
}
