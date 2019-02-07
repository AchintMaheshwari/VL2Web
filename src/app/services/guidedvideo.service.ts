import { Injectable, Input } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';
import { Observable } from 'rxjs/Observable';
import { LessonModel } from '../models/lesson.model';
import { Node } from '../teacher/tree-view/node';
import { UploadFile } from 'ngx-uploader';

@Injectable()
export class GuidedvideoService extends CrudService {
  guidedVideoList: any;
  isLibrary: Boolean = false;
  isSong: Boolean = false;
  isExercise: Boolean = false;
  isVideo: Boolean = false;
  isRecordVideo: Boolean = true;
  LessonModel: LessonModel;
  @Input() libraryNodes: Array<Node>;
  location: string = null;
  userData: any;
  teacherId: number;
  event: any;
  libraryHistoryNodes: Array<Node>;
  isGVLesson: boolean = false;
  redirectfromExercise: boolean = false;
  redirectfromSong: boolean = false;
  isStep2: any;
  isStep3: any;
  guidedVideoURL: String = "";
  file?: UploadFile;
  isOpenVideoURL: boolean = false;
  isOpenUploadVideo: boolean = false;
  isOpenRecordVideo: boolean = false;
  isOpenOtherVideoUrl: boolean = false;
  VideoURL: string = "";
  otherVideoUrl: string = "";
  assignLessonId: number;
  teacherVideoClaimsMapId: number;
  guidedLessonId: number;
  guidedLessonGuid: string;
  videoSubmissionData: any;
  videoSubmissionId: number;
  IsPaid: boolean = false;
  PaymentTime: string = '';
  Price: any = 0;
  userId: any = 0;

  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService) {
    super(http, commonService);
    try {
      this.userData = CommonService.getUser();
      if (this.userData.IsTeacher === 1)
        this.teacherId = this.userData.Teacher[0].TeacherId;
      else
        this.teacherId = parseInt(localStorage.getItem('lobbyTeacherId'));

      if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "" && localStorage.getItem('EditLesson') != undefined) {
        this.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      }
      else {
        this.initialiseLessonModel();
      }
    } catch{ }
  }

  getGuidedVideoList(): Observable<Array<any>> {
    var user = CommonService.getUser();
    if (user == null) return null;
    let userId = user.Teacher[0].TeacherId;
    return this.crudService.get<Array<any>>("/guidedVideo/GetGuidedVideoList", new HttpParams().set('teacherId', userId));
  }

  getGuidedVideoFeedbackList(): Observable<Array<any>> {
    var user = CommonService.getUser();
    if (user == null) return null;
    let userId = user.UserId;
    return this.crudService.get<Array<any>>("/guidedVideo/GetGuidedVideoFeedbackList", new HttpParams().set('userId', userId));
  }

  getGuidedVideoCostDetailsbySource(Source: string, VideoSubmissionId: number): Observable<Array<any>> {
    var user = CommonService.getUser();
    if (user == null) return null;
    let userId = user.UserId;
    return this.crudService.get<Array<any>>("/guidedVideo/GetGuidedVideoCostDetailsbySource", new HttpParams().set('source', Source).set('userId', userId).set('videoSubmissionId', VideoSubmissionId.toString()));
  }


  getVideoSubmissionData(videoSubmissionId: string): Observable<any> {
    return this.crudService.get("/guidedVideo/GetVideoSubmissionData", new HttpParams().set('videoSubmissionId', videoSubmissionId));
  }

  getLessonsByUserId(): Observable<any> {
    let user = CommonService.getUser();
    if (user == null) return null;
    let userId = user.UserId;
    return this.crudService.get<any>("/lesson/GetLessonLibrary", new HttpParams().set('userId', userId));
  }

  getPaymentBeforeSubmissionDetailsbyUserSourceCode(): Observable<any> {
    let user = CommonService.getUser();
    if (user == null) return null;
    let userId = user.UserId;
    return this.crudService.get<any>("/guidedVideo/GetPaymentBeforeSubmissionDetailsbyUserSourceCode", new HttpParams().set('userId', userId));
  }

  initialiseLessonModel() {
    this.LessonModel = {
      "LessonId": 0,
      "TeacherId": this.teacherId,
      "StudentId": 3,
      "LessonGuid": "994c10bb-bc59-46e5-b721-cd934bdfc486",
      "ModuleName": "",
      "LessonName": "",
      "CourseModuleId": null,
      "LessonType": 0,
      "LessonPdf": '',
      "LessonMp3": '',
      "CreatedOn": new Date(),
      "ModifiedOn": null,
      "CreatedByUserId": this.userData != null ? this.userData.UserId : "",
      "ModifiedByUserId": null,
      "TransactionId": null,
      "IsPaid": false,
      "Started": null,
      "Updated": null,
      "Ended": null,
      "LessonQueue": '',
      "LessonHistory": '',
      "IsLessonPlanned": false,
      "IsLessonQueueChange": false,
      "ExerciseSets": [],
      "LessonsUserProgressMaps": [],
      "Rooms": [],
      "SequencerExercises": [],
      "Description": "",
      "Logo": "default",
      "Price": 0,
      "Tags": "",
      "Student": [],
      "Users": "",
      "IsDeleted": false,
      "VocalType": "",
      "skillLevel": 0,
      "isGuidedVideoLessonCompleted": false,
      "LessonAccessType": "Private",
      "IsPlaylist": false
    }
  }
}
