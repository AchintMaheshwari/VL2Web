import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TeacherProfileModel } from '../models/teacherProfile.model';

@Injectable()
export class TeacherService extends CrudService {

  public teacherProfile = null;
  public teacherProfileData = null;
  public profileId: number;
  public broadCast: BehaviorSubject<TeacherProfileModel>
  public personalizedURL = '';
  public imageUrl: string;
  public teacherImageUrl: string;
  public teacherProfileId: number;
  public teacherList: any;
  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService, ) {
    super(http, commonService);
    this.initialiseTeacherProfile();
  }

  async getTeacherProfile(): Promise<TeacherProfileModel> {
    let userData = JSON.parse(localStorage.getItem('userData'));
    var userRole = localStorage.getItem('UserType');
    if (userRole === "Teacher") {
      this.teacherProfileId = userData.TeacherProfileId;
      this.imageUrl = localStorage.getItem("userImageUrl");
    }
    else if (userRole === "Student") {
      this.imageUrl = this.teacherImageUrl;
    }
    if (this.teacherProfileId > 0) {
      var data = await this.crudService.get<TeacherProfileModel>("/tProfile/GetTeacherProfileData",
        new HttpParams().set('teacherProfileId', this.teacherProfileId.toString())).toPromise();
      this.broadCast = new BehaviorSubject<TeacherProfileModel>(data);
      this.teacherProfile = data;
      this.personalizedURL = this.teacherProfile.PersonalizedUrl;
    }
    else {
      if (this.teacherProfileId === 0) {
        this.initialiseTeacherProfile();
        this.commonService.isDefaultImageFlag = true;
      }
      this.broadCast = new BehaviorSubject<TeacherProfileModel>(this.teacherProfileData);
    }

    return this.teacherProfile;
  }

  private initialiseTeacherProfile() {
    this.teacherProfileData = {
      TeacherProfileId: 0,
      UserId: 0,
      CreatedOn: "",
      ModifiedOn: "",
      PersonalizedUrl: "",
      VideoIntroUrl: "",
      Introduction: "",
      Repertoir: "",
      City: "",
      ZipCode: "",
      TimeZone: "",
      DisplayName: "",
      StudioName: "",
      ShortIntroduction: "",
      AvailabilityAcceptingNew: false,
      AvailabilityAutoAccept: false,
      AvailabilityOfferSolo: false,
      AvailabilityOfferGroup: false,
      AcceptingAgeLow: null,
      AcceptingAgeHigh: null,
      VocalStylePop: false,
      VocalStyleClassical: false,
      VocalStyleMusicalTheater: false,
      VocalStyleGospel: false,
      VocalStyleHipHop: false,
      VocalStyleOpera: false,
      VocalStyleJazz: false,
      VocalStyleFolk: false,
      VocalStyleRock: false,
      VocalStyleWorld: false,
      VocalType: "",
      MusicalWorshipBaptist: false,
      MusicalWorshipCatholic: false,
      MusicalWorshipHindi: false,
      MusicalWorshipLutheran: false,
      MusicalWorshipNonDenom: false,
      MusicalWorshipPresbyterian: false,
      MusicalWorshipBuddhist: false,
      MusicalWorshipEpiscopal: false,
      MusicalWorshipJewish: false,
      MusicalWorshipMethodist: false,
      MusicalWorshipMuslim: false,
      MusicalWorshipUnitarian: false,
      MusicalWorshipOther: "",
      SocialMediaFacebook: "",
      SocialMediaTwitter: "",
      SocialMediaInstagram: "",
      SocialMediaLinkedIn: "",
      SocialMediaYouTube: "",
      SocialMediaPinterest: "",
      WebsiteUrl: "",
      User: null,
      TeacherQualifications: [{
        TeacherQualificationId: 0,
        TeacherProfileId: 1,
        Date: null,
        Description: null,
        UserId: 1,
        Created: new Date(),
        Modified: new Date()
      }]
    };

  }

  getTeacherListingData(): Observable<Array<any>> {
    let user = CommonService.getUser();
    if(user == null) return;
    return this.crudService.get<Array<any>>("/tProfile/GetTeachersList", new HttpParams()
      .set('studentId', user.Student[0].StudentId));
  }

  getTeachertListData(): Observable<Array<any>> {
    let studentId = CommonService.getUser().Student[0].StudentId;
    return this.crudService.get<Array<any>>("/teacher/GetStudentTeachersList", new HttpParams()
      .set('studentId', studentId));
  }

  getStudentsAssociatedToTeacher(): Observable<Array<any>> {
    let teacherId = CommonService.getUser().Teacher[0].TeacherId;
    return this.crudService.get<Array<any>>("/teacher/GetAssociatedStudentsToTeacher", new HttpParams()
      .set('teacherId', teacherId));
  }

  getTeacherLatestPayments(): Observable<Array<any>> {
    let teacherId = CommonService.getUser().Teacher[0].TeacherId;
    return this.crudService.get<Array<any>>("/teacher/GetTeacherLatestPayments", new HttpParams()
      .set('teacherId', teacherId));
  }

  getTeacherPaymentsEarned(): Observable<any> {
    let teacherId = CommonService.getUser().Teacher[0].TeacherId;
    return this.crudService.get<any>("/teacher/GetTeacherPaymentsEarned", new HttpParams()
      .set('teacherId', teacherId));
  }

  getTeacherReviews(): Observable<Array<any>> {
    let teacherId = CommonService.getUser().Teacher[0].TeacherId;
    return this.crudService.get<Array<any>>("/teacher/GetTeacherReviews", new HttpParams()
      .set('teacherId', teacherId));
  }
  

  getTeacherUpcomingSchedules(): Observable<Array<any>> {
    let teacherId = CommonService.getUser().Teacher[0].TeacherId;
    return this.crudService.get<Array<any>>("/teacher/GetTeacherUpcomingSchedules", new HttpParams()
      .set('teacherId', teacherId));
  }
}