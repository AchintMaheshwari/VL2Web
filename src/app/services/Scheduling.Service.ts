import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';
import { BookingModel } from '../models/booking.model';
import { CalendarEventModel } from '../models/calendarEvent.model';
import { RatesModel } from '../models/rates.model';
import * as moment from 'moment';

@Injectable()
export class SchedulingService extends CrudService {
  selectDate: string = '';
  selectDay: string = '';
  isReschedule: boolean = false;
  public studentScheduleObject = null;
  public Payment = null;
  public isInitialDataLoaded = false;
  public ratesArray = null;
  public rateId = 0;
  public recurringWeekDayName = '';
  public recurringTimeSlot = '';
  public isRecurringDaySelected = false;
  public lessonPayableAmount: number;
  public linkData: any;
  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService, ) {
    super(http, commonService);
  }

  public allSelectedDateObject = [
    {
      monthNameWithDay: "",
      selectStartDate: "",
      selectedCell: null
    }
  ];

  initializeSchedule(userData: any, teacherId: any) {
    this.studentScheduleObject = {
      BookingId: 0,
      StudentUserId: userData.Student[0].StudentId,
      TeacherUserId: teacherId,
      BookingType: "",
      LessonType: "",
      LessonDuration: 0,
      LessonPrice: "0.00",
      EventsCount: 0,
      OriginalBookingId: 0,
      BookingAttempt: 0,
      IsRescheduled: false,
      BookingDate: new Date(),
      RescheduledDate: null,
      CalendarEvents: [
        {
          CalendarEventId: 0,
          BookingId: 0,
          EventName: "",
          EventStartDate: "",
          EventEndDate: ""
        }],
      Payments: []
    }
  }

  initialisePayments() {
    this.Payment = {
      PaymentId: 0,
      StudentUserId: this.studentScheduleObject.StudentUserId,
      TeacherUserId: this.studentScheduleObject.TeacherUserId,
      BookingId: this.studentScheduleObject.BookingId,
      CouponID: null,
      Amount: this.lessonPayableAmount,
      PaymentDate: new Date(),
      PaymentType: 1,
      Status: ''
    }
  }

  getAssociatedTeacher() {
    let studentId = CommonService.getUser().Student[0].StudentId;
    this.crudService.get('/lesson/GetAssociatedTeacher', new HttpParams().
      set("studentId", studentId)).subscribe((resultData: any) => {
        this.commonService.associatedTeacherId = resultData;
        this.studentScheduleObject.StudentUserId = resultData
      });
  }

  getTeacherLessonRatesData(): Observable<Array<RatesModel>> {
    let userData = JSON.parse(localStorage.getItem('userData'));
    var teacherId = this.commonService.associatedTeacherId;
    if (userData.IsTeacher === 1 && userData.Teacher != undefined) {
      teacherId = userData.Teacher[0].TeacherId;
    }
    return this.crudService.get<Array<RatesModel>>("/setting/GetTeacherLessonRatesData", new HttpParams().set('teacherId', teacherId));
  }

  getStudentScheduledLessonData(bookingId: any): Observable<BookingModel> {
    return this.crudService.get<BookingModel>("/booking/GetStudentBookingData", new HttpParams().set('bookingId', bookingId.toString()));
  }

  getTeacherAvailabilityTimeSlots(selectDate): Observable<string> {
    return this.crudService.get<any>("/availability/GetTeacherAvailabilityDataForLessons", new HttpParams().
      set('teacherId', this.commonService.associatedTeacherId).set('date', selectDate));
  }

  getTeacherAvailabilityTimeSlotForRecurring(selectDay): Observable<string> {
    return this.crudService.get<string>("/availability/GetTeacherAvailabilityDataForRecurringLessons", new HttpParams()
      .set('teacherId', this.commonService.associatedTeacherId).set('day', selectDay));
  }

  getTeacherRecurringAvailabileSchedulesData(selectDay, slot): Observable<Array<CalendarEventModel>> {
    return this.crudService.get<Array<CalendarEventModel>>("/availability/GetTeacherRecurringAvailabileSchedulesData", new HttpParams().set('day', selectDay).set('slot', slot));
  }

  bookingTimeValidation(date) {
    if (moment(moment.utc(new Date()).format()).isAfter(moment.utc(new Date(date)).format())) {
      return false;
    }
    else {
      let utcDateTime = CommonService.convertToUTCDate(date);
      let bookingDate = moment(utcDateTime, 'YYYY-MM-DD HH:mm');
      let todayDate = moment(moment.utc(new Date()).format(), 'YYYY-MM-DD HH:mm');
      if (moment.duration(bookingDate.diff(todayDate)).asMinutes() <= 1440) {
        return false;
      }
      else
        return true;
    }
  }
}