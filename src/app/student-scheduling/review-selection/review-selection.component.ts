import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { SchedulingService } from '../../services/Scheduling.Service';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonService } from '../../common/common.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-review-selection',
  templateUrl: './review-selection.component.html',
  styleUrls: []
})
export class ReviewSelectionComponent implements OnInit {
  teacherLessonRates: any;
  lessonAmount: number;
  hasCoupon: boolean = false;
  scheduleList: Array<string> = [];
  constructor(private _location: Location, public schedulingService: SchedulingService, private route: Router,
    private loaderService: LoaderService) {
    this.teacherLessonRates = this.schedulingService.ratesArray.
      find(i => i.RateId === this.schedulingService.rateId);
    this.schedulingService.studentScheduleObject.EventsCount = this.schedulingService.studentScheduleObject.CalendarEvents.length;
    this.schedulingService.lessonPayableAmount = this.lessonAmount = this.schedulingService.studentScheduleObject.EventsCount * this.teacherLessonRates.Price;
  }

  ngOnInit() {
    if (this.schedulingService.studentScheduleObject.BookingType != "Recurring") {
      this.schedulingService.studentScheduleObject.CalendarEvents.forEach(schedule => {
        this.scheduleList.push(CommonService.convertToUserDate(schedule.EventStartDate) + ' ' +
          CommonService.convertToUserScheduleTime(schedule.EventStartDate) + ' - ' +
          CommonService.convertToUserScheduleTime(schedule.EventEndDate));
      });
    }
  }

  onBack() {
    if (this.schedulingService.studentScheduleObject.BookingType == 'Recurring') {
      this.route.navigateByUrl('/student/schedule/selectdates');
    }
    else {
      this.route.navigateByUrl('/student/schedule/singleandmultiple');
    }
  }

  onSingleMultipleBack(){
    this.route.navigateByUrl('/student/schedule/singleandmultiple');
  }

  onRecurringBack(){
    this.route.navigateByUrl('/student/schedule/selectdates');
  }
  
  setCouponFields() {
    this.hasCoupon = true;
    this.schedulingService.lessonPayableAmount = this.lessonAmount - 20;
  }

  removeCouponFields() {
    this.hasCoupon = false;
    this.schedulingService.lessonPayableAmount = this.lessonAmount;
  }

  onSaveDataAndNext() {
    this.loaderService.processloader = true;
    this.schedulingService.post("/booking/UpsertStudentBookingData",
      this.schedulingService.studentScheduleObject, new HttpParams()).subscribe((response: any) => {
        this.schedulingService.studentScheduleObject = response;
        this.loaderService.processloader = false;
        this.schedulingService.initialisePayments();
        this.route.navigate(['/student/schedule/payment']);
      });
  }
}
