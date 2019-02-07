import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';
import { UserActivityModel } from '../models/userActivity.model';

@Injectable()
export class UserService extends CrudService {

  public user = null;
  public broadCast = null;
  public userRole = localStorage.getItem('UserType');
  public userActivity: UserActivityModel;
  public userStatus: any;
  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService) {
    super(http, commonService);
    this.initialiseUser();
    this.initialiseUserActivity();
  }

  upsertUserActivity(activity) {
    let userData = CommonService.getUser();
    this.userActivity.UserId = userData.UserId;
    this.userActivity.DateCreated = new Date();
    this.userActivity.Activity = activity;
    this.crudService.post("/user/UpsertUserActivity", this.userActivity, new HttpParams()).subscribe(result => { });
  }

  getUserActivity(profileIdList) {
    this.crudService.post("/user/GetUserActivityStatus", profileIdList, new HttpParams().set("role", this.userRole)).map(result => {
      this.userStatus = result;
    });
  }

  public initialiseUser() {
    this.user = {
      UserId: 0,
      UserGUID: "testGuid",
      FirstName: "",
      LastName: "",
      Email: "",
      Password: "",
      Mobile: "",
      IsTeacher: 0,
      IsStudent: 0,
      Gender: "",
      DOB: "",
      ZipCode: "",
      TimeZone: "",
      ProfileImageUrl: "",
      CreatedOn: new Date(),
      ModifiedOn: null,
      TeacherProfileId: 0,
      TeacherProfileStatusId: 0,
      StudentProfileId: 0,
      StudentProfileStatusId: 0,
      KeyboardId: "",
      EmailConfirmationFlag: false,
      IsEmailSent: false,
      IsUserSignUp: false,
      IsAlreadyConfirmed: false,
      SourceCode: "",
      TermsOfUse: false,
      TermsOfUseDateSigned: null,
      TermsOfUseIPAddress: "",
      IsVideoEvalRequired: false,
      IsQuizRequired: false,
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      LessonGuid: "",
      CalendarSyncs: [],
      ChatMessages: [],
      CourseUserAccessMaps: [],
      CoursesUserProgressMaps: [],
      DirectMessagesFromUser: [],
      DirectMessagesToUser: [],
      ExerciseUserProgressMaps: [],
      LessonPackagesStudentsUser: [],
      LessonPackagesTeachersUser: [],
      LessonsUserProgressMaps: [],
      RoomUserMaps: [],
      Teacher: [{
        TeacherId: 0,
        UserId: 0,
        ImageURL: null,
        StripePublishableKey: null,
        StripeLivemode: null,
        StripeUserId: null,
        StripeRefreshToken: null,
        StripeAccessToken: null,
        StripePaymentsOwed: 0,
        CreatedOn: new Date(),
        ModifiedOn: null
      }],
      Student: [{
        StudentId: 0,
        UserId: 0,
        ImageURL: null,
        CreatedOn: new Date(),
        ModifiedOn: null
      }],
      TeacherProfiles: [],
      StudentProfiles: [],
      UserGroupMaps: [],
      UserGroups: []
    }
  };

  public initialiseUserActivity() {
    this.userActivity = {
      UserActivityId: 0,
      UserId: 0,
      DateCreated: new Date(),
      Activity: 'ActiveStatus',
      TeacherProfileId: 0,
      StudentProfileId: 0
    }
  };
}