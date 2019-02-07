import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { StudentProfileModel } from '../models/studentProfile.model';
import { BookingModel } from '../models/booking.model';

export enum studyGoals {
  None = 0,
  ToneQuality = 1 << 0,
  VocalRange = 1 << 1,
  NewSkill = 1 << 2,
  FriendsFamily = 1 << 3
}

@Injectable()
export class StudentService extends CrudService {
  public profileData = null;
  public studentProfileData: any;
  public broadCast: BehaviorSubject<StudentProfileModel>;
  public toneQualityFlag: boolean = false;
  public vocalRangeFlag: boolean = false;
  public newSkillFlag: boolean = false;
  public friendFamilyFlag: boolean = false;
  public otherGoalFlag: boolean = false;
  public studentProfileId: number;
  public imageUrl: string = "";
  public studentList: any;

  vocalStyles: any = [{ "name": "vocalStylePop", "style": "Pop" },
  { "name": "vocalStyleOpera", "style": "Opera" },
  { "name": "vocalStyleClasical", "style": "Classical" },
  { "name": "vocalStyleMusicalTheatre", "style": "Musical Theatre" },
  { "name": "vocalStyleJazz", "style": "Jazz" },
  { "name": "vocalStyleFolk", "style": "Folk" },
  { "name": "vocalStyleGospel", "style": "Gospel" },
  { "name": "vocalStyleRock", "style": "Rock" },
  { "name": "vocalStyleWorld", "style": "World" },
  { "name": "vocalStyleHipHop", "style": "Hip Hop" },
  { "name": "vocalStyleR&B", "style": "R&B" },
  { "name": "vocalStyleHeavyMetal", "style": "Heavy Metal" },
  { "name": "vocalStyleHardRock", "style": "Hard Rock" },]

  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService, ) {
    super(http, commonService);
    this.initialiseStudentProfile();
  }

  async getStudentProfile(): Promise<StudentProfileModel> {
    if (this.profileData == null) {
      let userData = JSON.parse(localStorage.getItem('userData'));
      var studentProfileId = userData.StudentProfileId;
      var data = await this.crudService.get<StudentProfileModel>("/sProfile/GetStudentProfileData", new HttpParams().set('studentProfileId', studentProfileId)).toPromise();
      this.profileData = data;
      this.broadCast = new BehaviorSubject<StudentProfileModel>(data);
    }
    return this.profileData;
  }

  async getAssociatedStudentProfile(): Promise<StudentProfileModel> {
    var data = await this.crudService.get<StudentProfileModel>("/sProfile/GetStudentProfileData", new HttpParams().set('studentProfileId',
      this.studentProfileId.toString())).toPromise();
    this.profileData = data;
    this.broadCast = new BehaviorSubject<StudentProfileModel>(data);
    return this.profileData;
  }

  private initialiseStudentProfile() {
    this.studentProfileData = {
      StudentProfileId: 0,
      UserId: 0,
      Introduction: "",
      DisplayName: "",
      VocalType: "",
      WhereCurrentlySing: "",
      ZipCode: "",
      GoalsForStudy: 0,
      OtherGoalForStudy: "",
      VocalStyles: "",
      OtherStyle: "",
      StudentStyles: [],
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
      LowVocalRange: "",
      HighVocalRange: "",
      CreatedOn: "",
      ModifiedOn: "",
      CurrentSchoolLevel: "",
      SchoolName: "",
      GraduationYear: 2018,
      User: null
    };
  }

  getStudentProfileData(studentProfileId): Observable<any> {
    return this.crudService.get<any>("/sProfile/GetStudentProfileData", new HttpParams().set('studentProfileId', studentProfileId));
  }

  getTeacherMatchingData(studentId): Observable<Array<any>> {
    return this.crudService.get<Array<any>>("/tProfile/GetTeacherMatchesForStudent", new HttpParams()
      .set('studentId', studentId));
  }

  getStudentListingData(): Observable<Array<any>> {
    let teacherId = CommonService.getUser().Teacher[0].TeacherId;
    return this.crudService.get<Array<any>>("/sProfile/GetStudentsList", new HttpParams()
      .set('teacherId', teacherId));
  }

  getStudentAssociatedTeachers(): Observable<Array<any>> {
    let studentId = CommonService.getUser().Student[0].StudentId;
    return this.crudService.get<Array<any>>("/student/GetAssociatedteachersToStudent", new HttpParams()
      .set('studentId', studentId));
  }

  getStudentUpcomingSchedules(): Observable<Array<any>> {
    let studentId = CommonService.getUser().Student[0].StudentId;
    return this.crudService.get<Array<any>>("/student/GetStudentUpcomingScheduleLessons", new HttpParams()
      .set('studentId', studentId));
  }

  resendTeacherInvite(inviteData): Observable<any> {
    let teacherId = CommonService.getUser().Teacher[0].TeacherId;
    let invitationData = {
      TeacherInviteId: 0,
      TeacherId: teacherId,
      UserFirstName: inviteData.FirstName,
      UserLastName: inviteData.LastName,
      UserEamil: inviteData.StudentEmail,
      InviteStatus: '',
      CreatedDate: Date.now,
      ModifiedDate: Date.now
    }
    return this.crudService.post("/teacher/InviteStudent", invitationData, new HttpParams());
  }

  getQuizResult(userId: string, videoSubmissionId: string): Observable<any> {
    if (userId == "") {
      userId = '0';
    }
    return this.crudService.get("/student/GetStudentQuestionnaireData", new HttpParams()
      .set('questionnaireId', "0")
      .set('userId', userId)
      .set('videoSubmissionId', videoSubmissionId));
  }
}
