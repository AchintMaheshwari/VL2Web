import { Injectable } from '@angular/core';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { LessonLinksModel } from '../models/lessonLinks.model';

@Injectable()
export class TeacherSettingService extends CrudService {
  public durations = [15, 30, 60];
  public lessonTypes = ['Solo', 'Group'];
  public bookingTypes = ['Recurring', 'Multiple', 'Single'];
  public paymentBreakup;
  public showPaymentBreakup = false;
  paymentHistoryArr: any;
  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService) {
    super(http, commonService);
  }

  getTeacherLessonLinksData(): Observable<Array<LessonLinksModel>> {
    let userData = JSON.parse(localStorage.getItem('userData'));
    let teacherId = userData.Teacher[0].TeacherId;
    return this.crudService.get<Array<LessonLinksModel>>("/setting/GetTeacherLessonLinksData", new HttpParams()
      .set('teacherId', teacherId.toString()));
  }
  //===Get Payment History
  getPaymentHistory(): Observable<Array<any>> {
    let userData = JSON.parse(localStorage.getItem('userData'));
    let teacherId = userData.Teacher[0].TeacherId;
    return this.crudService.get<Array<any>>("/payment/GetPaymentHistory", new HttpParams()
      .set('teacherId', teacherId.toString()));
  }

  getCalendarEvents(bookingId): Observable<Array<any>> {
    return this.crudService.get<Array<any>>("/payment/GetCalendarEvents", new HttpParams()
      .set('bookingId', bookingId));
  }
}
