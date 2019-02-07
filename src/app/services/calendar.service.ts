import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../common/common.service'
import { CrudService } from './crud.service';
import { EventModel } from '../models/event.model';
import { CalendarSyncModel } from '../models/calendarSync.model';
import { RegularAvailabilitiesModel } from '../models/regularAvailabilities.model';
import { AvailabilitiesModel } from '../models/availabilities.model';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

@Injectable()
export class CalendarService extends CrudService {

  public teacherProfile = null;
  public teacherProfileData = null;
  public broadCast = null;
  public personalizedURL = '';
  public teacherRegualrAvailData = null;
  public isAvailabilitySetting = false;
  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService, private toastr: ToastrService) {
    super(http, commonService);

  }
  getTeacherCalendar(): Observable<any> {
    let userData = JSON.parse(localStorage.getItem('userData'));
    let teacherId = userData.Teacher[0].TeacherId;
    return this.crudService.get<EventModel>('/calendar/GetTeacherCalendarSyncData?teacherId=' + teacherId, new HttpParams());
  }

  getTeacherRegularAvailableHours(): Observable<any> {
    let userData = JSON.parse(localStorage.getItem('userData'));
    let teacherId = userData.Teacher[0].TeacherId;
    return this.crudService.get<EventModel>('/availability/GetTeacherRegularAvailabilityCalendarData?teacherId=' + teacherId, new HttpParams());
  }

  getTeacherCalendarSettings(): Observable<Array<CalendarSyncModel>> {
    let userData = JSON.parse(localStorage.getItem('userData'));
    let teacherId = userData.Teacher[0].TeacherId;
    return this.crudService.get<Array<CalendarSyncModel>>("/calendar/GetTeacherCalendarSettingsData", new HttpParams().set('teacherId', teacherId.toString()));
  }
  getTeacherRegAvailibility(): Observable<RegularAvailabilitiesModel> {
    let userData = JSON.parse(localStorage.getItem('userData'));
    let teacherId = userData.Teacher[0].TeacherId;
    return this.crudService.get<RegularAvailabilitiesModel>("/availability/GetTeacherRegularAvailabilityData", new HttpParams().set('teacherId', teacherId.toString()));
  }

  getDefaultTeacherRegularAvailableData() {
    let userData = JSON.parse(localStorage.getItem('userData'));
    let teacherId = userData.Teacher[0].TeacherId;
    this.teacherRegualrAvailData = {
      RegularAvailabilityId: 0,
      TeacherUserId: teacherId,
      Monday: '',
      Tuesday: '',
      Wednesday: '',
      Thursday: '',
      Friday: '',
      Saturday: '',
      Sunday: ''
    }
    return this.teacherRegualrAvailData;
  }

  getTeacherAvailAndBlockOffTime(): Observable<any> {
    let userData = JSON.parse(localStorage.getItem('userData'));
    let teacherId = userData.Teacher[0].TeacherId;
    return this.crudService.get<AvailabilitiesModel>("/availability/GetTeacherSpecificAvailabilityData", new HttpParams().set('teacherId', teacherId.toString()));
  }

  getTeacherBookings(): Observable<any> {
    let userData = JSON.parse(localStorage.getItem('userData'));
    let teacherId = userData.Teacher[0].TeacherId;
    return this.crudService.get<AvailabilitiesModel>("/booking/GetTeacherBookingData", new HttpParams().set('teacherId', teacherId.toString()));
  }

  dateTimeValidation(startDate, timefrom, endDate, timeTo) {
    if (moment(moment.utc(moment.utc(startDate).format('YYYY-MM-DD') + " " + timefrom).format()).
      isAfter(moment.utc(moment.utc(endDate).format('YYYY-MM-DD') + " " + timeTo).format())) {
      this.toastr.error('This time range does not seem right!');
      return false;
    }
    else {
      return true;
    }
  }

  blockOffDateTimeValidation(startDate, timefrom, endDate, timeTo) {
    if (moment(moment.utc(startDate + " " + timefrom).format()).
      isAfter(moment.utc(endDate + " " + timeTo).format())) {
      this.toastr.error('This time range does not seem right!');
      return false;
    }
    else {
      return true;
    }
  }

  timeValidation(timeFrom, timeTo) {
    if (moment(moment.utc(moment.utc(new Date()).format('YYYY-MM-DD') + " " + timeFrom).format()).
      isAfter(moment.utc(moment.utc(new Date()).format('YYYY-MM-DD') + " " + timeTo).format())) {
      this.toastr.error('This time range does not seem right!');
      return false;
    }
    else {
      return true;
    }
  }

  bookingTimeValidation(date, timeFrom) {
    if (moment(moment.utc(new Date()).format()).isAfter(moment.utc(new Date(date)).format())) {
      return false;
    }
    else {
      let utcDateTime = CommonService.convertToUTC(date, timeFrom);
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