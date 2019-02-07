import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TeacherReviewModel } from '../models/teacherReview.model';

@Injectable()
export class RateTeacherService extends CrudService {

  TeacherReviewModel: TeacherReviewModel;
  isReviewModalOpen:boolean=false;

  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService, ) {
    super(http, commonService);
    this.initialiseTeacherReviewModel();
  }

  getTeacherProfileImageAndName(teacherId): Observable<any> {
    return this.crudService.get<Array<any>>("/teacher/GetTeacherProfileImageAndName", new HttpParams().set('teacherId', teacherId));
  }

  getPendingReviewLesson(studentId): Observable<any> {
    return this.crudService.get<Array<any>>("/tProfile/GetPendingReviewLesson", new HttpParams().set('studentId', studentId));
  }

  getPendingGuidedLessonReview(studentId,studentUserId): Observable<any> {
    return this.crudService.get<Array<any>>("/student/GetPendingGuidedLessonReview", new HttpParams().set('studentId', studentId).set('studentUserId',studentUserId));
  }

  initialiseTeacherReviewModel() {
    this.TeacherReviewModel = {
      "ReviewId": 0,
      "StudentUserId": 0,
      "TeacherUserId": 0,
      "LessonId": 0,
      "Rating": 0.0,
      "Comment": "",
      "DateApproved": new Date(),
      "IsApproved": 0,
      "ApprovedByUserId": 0,
      "DateReviewed":null
    }
  }
}
