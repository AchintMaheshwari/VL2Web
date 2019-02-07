import { MenuModel } from '../models/menu.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as moment from 'moment';
import * as momenttimezone from 'moment-timezone';
import { Router } from '@angular/router';
import { User } from '../ng-chat/core/user';
import { Message } from '../ng-chat/core/message';

export class CommonService {

  private router: any;
  public MenuList;
  public associatedTeacherId: any;
  public associatedTeacherName: string;
  public static nodeObject: any;
  public imageUploadType: string = "";
  public isUserTypeDisabled: boolean;
  public fbUserName: string = "";
  constructor() {
    this.router = Router;
  }

  public readonly apiDevEndpoint = "http://localhost:5834";
  //public readonly apiDevEndpoint = "https://vlapiapp2.azurewebsites.net";
  public readonly appEndpoint = "https://vlapp2.azurewebsites.net";
  stripeRedirect_uri: string = "https://vlapp2.azurewebsites.net/payments/stripconnect"
  public static Instagramredirect_uri = 'https://vlapp2.azurewebsites.net/oauth2callback.html';
  public access_token;
  public static ClientId = "ngAuthApp";
  public static ClientSecret = "5YV7M1r981yoGhELyB84aC5KiYksxZf1OY3g2C1CtRM=";
  public auth0Access_token = "F_75coSAvF50cmhMw-l9oz7aKwN0mmue";
  public userProfilePic = localStorage.getItem("userImageUrl");
  public isDefaultImageFlag = true;
  public userData = null;
  bookLessonUrl = 'student/index';
  stripeclient_id = "ca_A5qwCyKxWDin77MA6A859H6Px4ufiSkJ";
  isStudentUser: boolean = false;
  isTeacherInviteLink: boolean = false;
  isFBMCNewUser: boolean = false;
  isSocialShare: boolean = false;
  public static autoPlay = false;
  public userChatMessage: BehaviorSubject<boolean>
  public static IsnstagramClient_Id = '956822732cdc47d59c124f31326c12c9';//'2d07b71037c74efe9d6a9946e8650f1c';
  public static xsocketconn = null;
  public static parentNodeList: any;
  public static currentParentNodeList: any;
  public static isPlayerStarted: any;
  public static isEditLessonQueueLoaded: boolean = false;
  public static isGVLessonQueueLoaded: boolean = false;
  public static isPlayListLoaded: boolean = false;
  public static isUserLoggedIn: boolean = false;
  public static guidedVideoLsit: any;
  public static lessonQueuePlayMode: string = 'PS';
  public static lessonQueuePlayedItem: null;
  public static guidedVideoGridList: any;
  public static directChatMessage: any;
  public static messageReceivedHandler: (user: User, message: Message) => void = (user: User, message: Message) => { };
  public static friendsListChangedHandler: (users: User[]) => void = (users: User[]) => { };
  public static isSignout: boolean = false;
  public static systemUserId: number = 899;
  public static isLogin: boolean = false;
  public static guidedLessonInstructionGuid = 'B5D2CFD0-F630-40E7-AD10-5356ECE4498B';

  public TeacherMenuList: MenuModel[] = [
    { Url: 'teacher/dashboard', Name: 'DASHBOARD' },
    { Url: 'teacher/calendar', Name: 'SCHEDULE' },
    { Url: 'teacher/guidedvideo', Name: 'NEW STUDENTS' },
    { Url: 'teacher/student-list', Name: 'STUDENTS' },
    { Url: '', Name: 'LESSONS', collapseNav: 'collapseLesson', isCollapsedLesson: true, subMenuItem: [{ Url: 'teacher/dashboard', Name: 'Join Lesson' }, { Url: 'teacher/lesson-history', Name: 'View History' }] },
    { Url: '', Name: 'COURSES', collapseNav: 'collapseCourses', isCollapsedLesson: true, subMenuItem: [{ Url: 'teacher/dashboard', Name: 'View My Courses' }, { Url: 'teacher/dashboard', Name: 'View All Courses' }] },
    { Url: 'teacher/dashboard', Name: 'MASTER TEACHER ' },
    { Url: 'teacher/dashboard', Name: 'GROUP' },
    { Url: 'teacher/dashboard', Name: 'STORE' },
    { Url: 'teacher/lesson-history', Name: 'HISTORY' },
    { Url: 'teacher/lesson-library', Name: 'LIBRARY' }
  ];

  public StudentMenuList: MenuModel[] = [
    { Url: 'student/dashboard', Name: 'Dashboard' },
    { Url: 'student/videofeedback', Name: 'VIDEO FEEDBACK' },
    { Url: '', Name: 'LESSONS', collapseNav: 'collapseLesson', isCollapsedLesson: true, subMenuItem: [{ Url: 'student/teacher-list', Name: 'Join Lesson', collapseNav: 'collapseLesson' }, { Url: this.bookLessonUrl, Name: 'Book Lesson', collapseNav: 'collapseLesson' }, { Url: 'student/lesson-history', Name: 'View History', collapseNav: 'collapseLesson' }] },
    { Url: '', Name: 'COURSES', collapseNav: 'collapseCourses', isCollapsedLesson: true, subMenuItem: [{ Url: 'student/dashboard', Name: 'View My Courses', collapseNav: 'collapseCourses' }, { Url: 'student/dashboard', Name: 'View All Courses', collapseNav: 'collapseCourses' }] },
    { Url: 'student/dashboard', Name: 'STORE' },
    { Url: 'student/lesson-history', Name: 'PRACTICE' },
    { Url: 'student/lesson-library', Name: 'LIBRARY' }
  ];

  public convertDateToString(date: Date): string {
    return moment(date).format('MM') + "/" + moment(date).format('DD') + "/" + moment(date).format('YYYY');
  };
  public stripeConnectionUrl: string = "https://connect.stripe.com/oauth/authorize?response_type=code&client_id=" + this.stripeclient_id + "&scope=read_write";
  //public stripeConnectionUrl : string = "https://connect.stripe.com/oauth/authorize?response_type=code&client_id="+ this.stripeclient_id +"&scope=read_write&redirect_uri="+this.stripeRedirect_uri;

  public static getUser(): any {
    return JSON.parse(localStorage.getItem('userData'));
  }

  public static getGuid(): any {
    return 'xadx4xcxyxxyxszxy'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 10 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(10);
    });
  }

  //its should be change according to UserAppData  
  public static userZone;

  //Sync Calendar Time zone method
  public static convertToUserTimeZone(date: string, zone: string): string {
    var dt = '';
    var userData = this.getUser();
    this.userZone = userData.TimeZone != "" ? userData.TimeZone : "UTC";
    // for all day events    
    if (date.substr(20, 5) == '00:00') {
      var unixDate = parseInt(moment(date).format('x'));
      var dt = moment.tz(unixDate, this.userZone).format();
      dt = momenttimezone.tz(date.substr(0, 19) + this.timeZoneList.filter(x => x.value == this.userZone)[0].time, zone).tz(this.userZone).format();
    }
    else
      dt = momenttimezone.tz(date, zone).tz(this.userZone).format();
    return dt;
  }

  public static convertToUTCDate(strDate: string): string {
    var userData = this.getUser();
    var dt = moment.utc(strDate).format('YYYY/MM/DD hh:mm A');
    return dt;
  }

  public static convertToUserDate(strDate: string): string {
    var userData = this.getUser();
    this.userZone = userData.TimeZone != "" ? userData.TimeZone : "UTC";
    var dt = moment.tz(strDate, this.userZone).format('MM/DD/YYYY');
    return dt;
  }

  //convert time according to user slected timezone // block and available dates
  public static convertToTimeZone(strDate: string): string {
    var userData = this.getUser();
    this.userZone = userData.TimeZone != "" ? userData.TimeZone : "UTC";
    var dt = moment.tz(strDate, this.userZone).format('YYYY/MM/DD hh:mm A');
    return dt;
  }

  public static convertChatMessageToUserTimeZone(strDate: string): string {
    var userData = this.getUser();
    if (userData == null)
      this.userZone = "UTC";
    else
      this.userZone = userData.TimeZone != "" ? userData.TimeZone : "UTC";

    var dt = moment.tz(strDate, this.userZone).format('MM/DD/YYYY hh:mm A');
    return dt;
  }

  public static convertToUTC(strDate: string, strTime: string): string {
    var userData = this.getUser();
    if (userData == null)
      this.userZone = "UTC";
    else
      this.userZone = userData.TimeZone != "" ? userData.TimeZone : "UTC";

    var userTimeZone = this.timeZoneList.filter(x => x.value == this.userZone)[0].time;
    var userZoneDateTime = moment.utc(moment(strDate).format('YYYY-MM-DD') + " " + strTime).format().replace('Z', userTimeZone);
    var dt = moment.utc(userZoneDateTime).format();
    return dt;
  }

  public static convertBlockDateTimeToUTC(strDate: string, strTime: string): string {
    var userData = this.getUser();
    if (userData == null)
      this.userZone = "UTC";
    else
      this.userZone = userData.TimeZone != "" ? userData.TimeZone : "UTC";

    var userTimeZone = this.timeZoneList.filter(x => x.value == this.userZone)[0].time
    var userZoneDateTime = moment.utc(strDate + " " + strTime).format().replace('Z', userTimeZone);
    var dt = moment.utc(userZoneDateTime).format();
    return dt;
  }

  public static convertToUTCTime(strTime: string): string {
    var userData = this.getUser();
    if (userData == null)
      this.userZone = "UTC";
    else
      this.userZone = userData.TimeZone != "" ? userData.TimeZone : "UTC";

    var userTimeZone = this.timeZoneList.filter(x => x.value == this.userZone)[0].time
    var userZoneDateTime = moment.utc('2014/04/01 ' + strTime).format().replace('Z', userTimeZone);
    var dt = moment.utc(userZoneDateTime).format('HH:mm');
    return dt;
  }

  public static convertToUserTime(strDateTime: string): string {
    var userData = this.getUser();
    if (userData != null)
      this.userZone = userData.TimeZone != "" ? userData.TimeZone : "UTC";
    else
      this.userZone = 'UTC';
    var dt = moment.tz(strDateTime, this.userZone).format('hh:mm A');
    return dt;
  }

  public static convertToUserScheduleTime(strDateTime: string): string {
    var userData = this.getUser();
    if (userData != null)
      this.userZone = userData.TimeZone != "" ? userData.TimeZone : "UTC";
    else
      this.userZone = 'UTC';
    var dt = moment.tz(strDateTime, this.userZone).format('HH:mm:ss');
    return dt;
  }

  public static convertUTCToUserTime(strTime: string): string {
    var userData = this.getUser();
    this.userZone = userData.TimeZone != "" ? userData.TimeZone : "UTC";
    var dt = moment.tz('2014/04/01 ' + strTime, this.userZone).format('hh:mm A');
    return dt;
  }

  public static getImageURL(): any {
    return localStorage.getItem('userImageURL');
  }

  public static getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
        objects = objects.concat(this.getObjects(obj[i], key, val));
      } else if (i == key && obj[key] == val) {
        objects.push(obj);
      }
    }
    return objects;
  }

  public static treeViewObject: any;
  public static timeZoneList: any[] = [
    { name: '(UTC-11:00) Pacific/Pago_Pago', value: 'Pacific/Pago_Pago', time: '-11:00' },
    { name: '(UTC-11:00) Pacific/Niue', value: 'Pacific/Niue', time: '-11:00' },
    { name: '(UTC-11:00) Pacific/Midway', value: 'Pacific/Midway', time: '-11:00' },
    { name: '(UTC-10:00) Pacific/Tahiti', value: 'Pacific/Tahiti', time: '-10:00' },
    { name: '(UTC-10:00) Pacific/Rarotonga', value: 'Pacific/Rarotonga', time: '-10:00' },
    { name: '(UTC-10:00) Pacific/Honolulu', value: 'Pacific/Honolulu', time: '-10:00' },
    { name: '(UTC-09:00) Pacific/Gambier', value: 'Pacific/Gambier', time: '-09:00' },
    { name: '(UTC-09:00) America/Adak', value: 'America/Adak', time: '-09:00' },
    { name: '(UTC-08:00) America/Yakutat', value: 'America/Yakutat', time: '-08:00' },
    { name: '(UTC-08:00) America/Sitka', value: 'America/Sitka', time: '-08:00' },
    { name: '(UTC-08:00) Pacific/Pitcairn', value: 'Pacific/Pitcairn', time: '-08:00' },
    { name: '(UTC-08:00) America/Nome', value: 'America/Nome', time: '-08:00' },
    { name: '(UTC-08:00) America/Metlakatla', value: 'America/Metlakatla', time: '-08:00' },
    { name: '(UTC-08:00) America/Juneau', value: 'America/Juneau', time: '-08:00' },
    { name: '(UTC-08:00) America/Anchorage', value: 'America/Anchorage', time: '-08:00' },
    { name: '(UTC-07:00) America/Whitehorse', value: 'America/Whitehorse', time: '-07:00' },
    { name: '(UTC-07:00) America/Vancouver', value: 'America/Vancouver', time: '-07:00' },
    { name: '(UTC-07:00) America/Tijuana', value: 'America/Tijuana', time: '-07:00' },
    { name: '(UTC-07:00) America/Phoenix', value: 'America/Phoenix', time: '-07:00' },
    { name: '(UTC-07:00) America/Los_Angeles', value: 'America/Los_Angeles', time: '-07:00' },
    { name: '(UTC-07:00) America/Hermosillo', value: 'America/Hermosillo', time: '-07:00' },
    { name: '(UTC-07:00) America/Fort_Nelson', value: 'America/Fort_Nelson', time: '-07:00' },
    { name: '(UTC-07:00) America/Dawson', value: 'America/Dawson', time: '-07:00' },
    { name: '(UTC-07:00) America/Dawson_Creek', value: 'America/Dawson_Creek', time: '-07:00' },
    { name: '(UTC-07:00) America/Creston', value: 'America/Creston', time: '-07:00' },
    { name: '(UTC-06:00) America/Yellowknife', value: 'America/Yellowknife', time: '-06:00' },
    { name: '(UTC-06:00) America/Tegucigalpa', value: 'America/Tegucigalpa', time: '-06:00' },
    { name: '(UTC-06:00) America/Swift_Current', value: 'America/Swift_Current', time: '-06:00' },
    { name: '(UTC-06:00) America/Regina', value: 'America/Regina', time: '-06:00' },
    { name: '(UTC-06:00) America/Ojinaga', value: 'America/Ojinaga', time: '-06:00' },
    { name: '(UTC-06:00) America/Mazatlan', value: 'America/Mazatlan', time: '-06:00' },
    { name: '(UTC-06:00) America/Inuvik', value: 'America/Inuvik', time: '-06:00' },
    { name: '(UTC-06:00) America/Guatemala', value: 'America/Guatemala', time: '-06:00' },
    { name: '(UTC-06:00) Pacific/Galapagos', value: 'Pacific/Galapagos', time: '-06:00' },
    { name: '(UTC-06:00) America/El_Salvador', value: 'America/El_Salvador', time: '-06:00' },
    { name: '(UTC-06:00) America/Edmonton', value: 'America/Edmonton', time: '-06:00' },
    { name: '(UTC-06:00) America/Denver', value: 'America/Denver', time: '-06:00' },
    { name: '(UTC-06:00) America/Costa_Rica', value: 'America/Costa_Rica', time: '-06:00' },
    { name: '(UTC-06:00) America/Chihuahua', value: 'America/Chihuahua', time: '-06:00' },
    { name: '(UTC-06:00) America/Cambridge_Bay', value: 'America/Cambridge_Bay', time: '-06:00' },
    { name: '(UTC-06:00) America/Boise', value: 'America/Boise', time: '-06:00' },
    { name: '(UTC-06:00) America/Belize', value: 'America/Belize', time: '-06:00' },
    { name: '(UTC-05:00) America/Winnipeg', value: 'America/Winnipeg', time: '-05:00' },
    { name: '(UTC-05:00) Indiana/Tell_City', value: 'America/Indiana/Tell_City', time: '-05:00' },
    { name: '(UTC-05:00) America/Rio_Branco', value: 'America/Rio_Branco', time: '-05:00' },
    { name: '(UTC-05:00) America/Resolute', value: 'America/Resolute', time: '-05:00' },
    { name: '(UTC-05:00) America/Rankin_Inlet', value: 'America/Rankin_Inlet', time: '-05:00' },
    { name: '(UTC-05:00) America/Rainy_River', value: 'America/Rainy_River', time: '-05:00' },
    { name: '(UTC-05:00) America/Panama', value: 'America/Panama', time: '-05:00' },
    { name: '(UTC-05:00) North_Dakota/New_Salem', value: 'America/North_Dakota/New_Salem', time: '-05:00' },
    { name: '(UTC-05:00) America/Monterrey', value: 'America/Monterrey', time: '-05:00' },
    { name: '(UTC-05:00) America/Mexico_City', value: 'America/Mexico_City', time: '-05:00' },
    { name: '(UTC-05:00) America/Merida', value: 'America/Merida', time: '-05:00' },
    { name: '(UTC-05:00) America/Menominee', value: 'America/Menominee', time: '-05:00' },
    { name: '(UTC-05:00) America/Matamoros', value: 'America/Matamoros', time: '-05:00' },
    { name: '(UTC-05:00) America/Lima', value: 'America/Lima', time: '-05:00' },
    { name: '(UTC-05:00) Indiana/Knox', value: 'America/Indiana/Knox', time: '-05:00' },
    { name: '(UTC-05:00) America/Jamaica', value: 'America/Jamaica', time: '-05:00' },
    { name: '(UTC-05:00) America/Guayaquil', value: 'America/Guayaquil', time: '-05:00' },
    { name: '(UTC-05:00) America/Eirunepe', value: 'America/Eirunepe', time: '-05:00' },
    { name: '(UTC-05:00) Pacific/Easter', value: 'Pacific/Easter', time: '-05:00' },
    { name: '(UTC-05:00) America/Chicago', value: 'America/Chicago', time: '-05:00' },
    { name: '(UTC-05:00) North_Dakota/Center', value: 'America/North_Dakota/Center', time: '-05:00' },
    { name: '(UTC-05:00) America/Cayman', value: 'America/Cayman', time: '-05:00' },
    { name: '(UTC-05:00) America/Cancun', value: 'America/Cancun', time: '-05:00' },
    { name: '(UTC-05:00) America/Bogota', value: 'America/Bogota', time: '-05:00' },
    { name: '(UTC-05:00) North_Dakota/Beulah', value: 'America/North_Dakota/Beulah', time: '-05:00' },
    { name: '(UTC-05:00) America/Bahia_Banderas', value: 'America/Bahia_Banderas', time: '-05:00' },
    { name: '(UTC-05:00) America/Atikokan', value: 'America/Atikokan', time: '-05:00' },
    { name: '(UTC-04:00) Indiana/Winamac', value: 'America/Indiana/Winamac', time: '-04:00' },
    { name: '(UTC-04:00) Indiana/Vincennes', value: 'America/Indiana/Vincennes', time: '-04:00' },
    { name: '(UTC-04:00) Indiana/Vevay', value: 'America/Indiana/Vevay', time: '-04:00' },
    { name: '(UTC-04:00) America/Tortola', value: 'America/Tortola', time: '-04:00' },
    { name: '(UTC-04:00) America/Toronto', value: 'America/Toronto', time: '-04:00' },
    { name: '(UTC-04:00) America/Thunder_Bay', value: 'America/Thunder_Bay', time: '-04:00' },
    { name: '(UTC-04:00) America/St_Vincent', value: 'America/St_Vincent', time: '-04:00' },
    { name: '(UTC-04:00) America/St_Thomas', value: 'America/St_Thomas', time: '-04:00' },
    { name: '(UTC-04:00) America/St_Lucia', value: 'America/St_Lucia', time: '-04:00' },
    { name: '(UTC-04:00) America/St_Kitts', value: 'America/St_Kitts', time: '-04:00' },
    { name: '(UTC-04:00) America/St_Barthelemy', value: 'America/St_Barthelemy', time: '-04:00' },
    { name: '(UTC-04:00) America/Santo_Domingo', value: 'America/Santo_Domingo', time: '-04:00' },
    { name: '(UTC-04:00) America/Puerto_Rico', value: 'America/Puerto_Rico', time: '-04:00' },
    { name: '(UTC-04:00) America/Porto_Velho', value: 'America/Porto_Velho', time: '-04:00' },
    { name: '(UTC-04:00) America/Port_of_Spain', value: 'America/Port_of_Spain', time: '-04:00' },
    { name: '(UTC-04:00) America/Port-au-Prince', value: 'America/Port-au-Prince', time: '-04:00' },
    { name: '(UTC-04:00) Indiana/Petersburg', value: 'America/Indiana/Petersburg', time: '-04:00' },
    { name: '(UTC-04:00) America/Pangnirtung', value: 'America/Pangnirtung', time: '-04:00' },
    { name: '(UTC-04:00) America/Nipigon', value: 'America/Nipigon', time: '-04:00' },
    { name: '(UTC-04:00) America/New_York', value: 'America/New_York', time: '-04:00' },
    { name: '(UTC-04:00) America/Nassau', value: 'America/Nassau', time: '-04:00' },
    { name: '(UTC-04:00) America/Montserrat', value: 'America/Montserrat', time: '-04:00' },
    { name: '(UTC-04:00) Kentucky/Monticello', value: 'America/Kentucky/Monticello', time: '-04:00' },
    { name: '(UTC-04:00) America/Martinique', value: 'America/Martinique', time: '-04:00' },
    { name: '(UTC-04:00) America/Marigot', value: 'America/Marigot', time: '-04:00' },
    { name: '(UTC-04:00) Indiana/Marengo', value: 'America/Indiana/Marengo', time: '-04:00' },
    { name: '(UTC-04:00) America/Manaus', value: 'America/Manaus', time: '-04:00' },
    { name: '(UTC-04:00) America/Lower_Princes', value: 'America/Lower_Princes', time: '-04:00' },
    { name: '(UTC-04:00) Kentucky/Louisville', value: 'America/Kentucky/Louisville', time: '-04:00' },
    { name: '(UTC-04:00) America/La_Paz', value: 'America/La_Paz', time: '-04:00' },
    { name: '(UTC-04:00) America/Kralendijk', value: 'America/Kralendijk', time: '-04:00' },
    { name: '(UTC-04:00) America/Iqaluit', value: 'America/Iqaluit', time: '-04:00' },
    { name: '(UTC-04:00) Indiana/Indianapolis', value: 'America/Indiana/Indianapolis', time: '-04:00' },
    { name: '(UTC-04:00) America/Havana', value: 'America/Havana', time: '-04:00' },
    { name: '(UTC-04:00) America/Guyana', value: 'America/Guyana', time: '-04:00' },
    { name: '(UTC-04:00) America/Guadeloupe', value: 'America/Guadeloupe', time: '-04:00' },
    { name: '(UTC-04:00) America/Grenada', value: 'America/Grenada', time: '-04:00' },
    { name: '(UTC-04:00) America/Grand_Turk', value: 'America/Grand_Turk', time: '-04:00' },
    { name: '(UTC-04:00) America/Dominica', value: 'America/Dominica', time: '-04:00' },
    { name: '(UTC-04:00) America/Detroit', value: 'America/Detroit', time: '-04:00' },
    { name: '(UTC-04:00) America/Curacao', value: 'America/Curacao', time: '-04:00' },
    { name: '(UTC-04:00) America/Cuiaba', value: 'America/Cuiaba', time: '-04:00' },
    { name: '(UTC-04:00) America/Caracas', value: 'America/Caracas', time: '-04:00' },
    { name: '(UTC-04:00) America/Campo_Grande', value: 'America/Campo_Grande', time: '-04:00' },
    { name: '(UTC-04:00) America/Boa_Vista', value: 'America/Boa_Vista', time: '-04:00' },
    { name: '(UTC-04:00) America/Blanc-Sablon', value: 'America/Blanc-Sablon', time: '-04:00' },
    { name: '(UTC-04:00) America/Barbados', value: 'America/Barbados', time: '-04:00' },
    { name: '(UTC-04:00) America/Asuncion', value: 'America/Asuncion', time: '-04:00' },
    { name: '(UTC-04:00) America/Aruba', value: 'America/Aruba', time: '-04:00' },
    { name: '(UTC-04:00) America/Antigua', value: 'America/Antigua', time: '-04:00' },
    { name: '(UTC-04:00) America/Anguilla', value: 'America/Anguilla', time: '-04:00' },
    { name: '(UTC-03:00) Argentina/Ushuaia', value: 'America/Argentina/Ushuaia', time: '-03:00' },
    { name: '(UTC-03:00) Argentina/Tucuman', value: 'America/Argentina/Tucuman', time: '-03:00' },
    { name: '(UTC-03:00) America/Thule', value: 'America/Thule', time: '-03:00' },
    { name: '(UTC-03:00) Atlantic/Stanley', value: 'Atlantic/Stanley', time: '-03:00' },
    { name: '(UTC-03:00) America/Sao_Paulo', value: 'America/Sao_Paulo', time: '-03:00' },
    { name: '(UTC-03:00) America/Santiago', value: 'America/Santiago', time: '-03:00' },
    { name: '(UTC-03:00) America/Santarem', value: 'America/Santarem', time: '-03:00' },
    { name: '(UTC-03:00) Argentina/San_Luis', value: 'America/Argentina/San_Luis', time: '-03:00' },
    { name: '(UTC-03:00) Argentina/San_Juan', value: 'America/Argentina/San_Juan', time: '-03:00' },
    { name: '(UTC-03:00) Argentina/Salta', value: 'America/Argentina/Salta', time: '-03:00' },
    { name: '(UTC-03:00) Antarctica/Rothera', value: 'Antarctica/Rothera', time: '-03:00' },
    { name: '(UTC-03:00) Argentina/Rio_Gallegos', value: 'America/Argentina/Rio_Gallegos', time: '-03:00' },
    { name: '(UTC-03:00) America/Recife', value: 'America/Recife', time: '-03:00' },
    { name: '(UTC-03:00) America/Punta_Arenas', value: 'America/Punta_Arenas', time: '-03:00' },
    { name: '(UTC-03:00) America/Paramaribo', value: 'America/Paramaribo', time: '-03:00' },
    { name: '(UTC-03:00) Antarctica/Palmer', value: 'Antarctica/Palmer', time: '-03:00' },
    { name: '(UTC-03:00) America/Montevideo', value: 'America/Montevideo', time: '-03:00' },
    { name: '(UTC-03:00) America/Moncton', value: 'America/Moncton', time: '-03:00' },
    { name: '(UTC-03:00) Argentina/Mendoza', value: 'America/Argentina/Mendoza', time: '-03:00' },
    { name: '(UTC-03:00) America/Maceio', value: 'America/Maceio', time: '-03:00' },
    { name: '(UTC-03:00) Argentina/La_Rioja', value: 'America/Argentina/La_Rioja', time: '-03:00' },
    { name: '(UTC-03:00) Argentina/Jujuy', value: 'America/Argentina/Jujuy', time: '-03:00' },
    { name: '(UTC-03:00) America/Halifax', value: 'America/Halifax', time: '-03:00' },
    { name: '(UTC-03:00) America/Goose_Bay', value: 'America/Goose_Bay', time: '-03:00' },
    { name: '(UTC-03:00) America/Glace_Bay', value: 'America/Glace_Bay', time: '-03:00' },
    { name: '(UTC-03:00) America/Fortaleza', value: 'America/Fortaleza', time: '-03:00' },
    { name: '(UTC-03:00) Argentina/Cordoba', value: 'America/Argentina/Cordoba', time: '-03:00' },
    { name: '(UTC-03:00) America/Cayenne', value: 'America/Cayenne', time: '-03:00' },
    { name: '(UTC-03:00) Argentina/Catamarca', value: 'America/Argentina/Catamarca', time: '-03:00' },
    { name: '(UTC-03:00) Argentina/Buenos_Aires', value: 'America/Argentina/Buenos_Aires', time: '-03:00' },
    { name: '(UTC-03:00) Atlantic/Bermuda', value: 'Atlantic/Bermuda', time: '-03:00' },
    { name: '(UTC-03:00) America/Belem', value: 'America/Belem', time: '-03:00' },
    { name: '(UTC-03:00) America/Bahia', value: 'America/Bahia', time: '-03:00' },
    { name: '(UTC-03:00) America/Araguaina', value: 'America/Araguaina', time: '-03:00' },
    { name: '(UTC-02:00) Atlantic/South_Georgia', value: 'Atlantic/South_Georgia', time: '-02:00' },
    { name: '(UTC-02:00) America/Noronha', value: 'America/Noronha', time: '-02:00' },
    { name: '(UTC-02:00) America/Miquelon', value: 'America/Miquelon', time: '-02:00' },
    { name: '(UTC-02:00) America/Godthab', value: 'America/Godthab', time: '-02:00' },
    { name: '(UTC-01:00) America/Scoresbysund', value: 'America/Scoresbysund', time: '-01:00' },
    { name: '(UTC-01:00) Atlantic/Cape_Verde', value: 'Atlantic/Cape_Verde', time: '-01:00' },
    { name: '(UTC)', value: 'UTC', time: '+00:00' },
    { name: '(UTC+00:00) Africa/Abidjan', value: 'Africa/Abidjan', time: '+00:00' },
    { name: '(UTC+00:00) Africa/Accra', value: 'Africa/Accra', time: '+00:00' },
    { name: '(UTC+00:00) Atlantic/Azores', value: 'Atlantic/Azores', time: '+00:00' },
    { name: '(UTC+00:00) Africa/Bamako', value: 'Africa/Bamako', time: '+00:00' },
    { name: '(UTC+00:00) Africa/Banjul', value: 'Africa/Banjul', time: '+00:00' },
    { name: '(UTC+00:00) Africa/Bissau', value: 'Africa/Bissau', time: '+00:00' },
    { name: '(UTC+00:00) Africa/Conakry', value: 'Africa/Conakry', time: '+00:00' },
    { name: '(UTC+00:00) Africa/Dakar', value: 'Africa/Dakar', time: '+00:00' },
    { name: '(UTC+00:00) America/Danmarkshavn', value: 'America/Danmarkshavn', time: '+00:00' },
    { name: '(UTC+00:00) Africa/Freetown', value: 'Africa/Freetown', time: '+00:00' },
    { name: '(UTc+00:00) Africa/Lome', value: 'Africa/Lome', time: '+00:00' },
    { name: '(UTC+00:00) Africa/Monrovia', value: 'Africa/Monrovia', time: '+00:00' },
    { name: '(UTC+00:00) Africa/Nouakchott', value: 'Africa/Nouakchott', time: '+00:00' },
    { name: '(UTC+00:00) Africa/Ouagadougou', value: 'Africa/Ouagadougou', time: '+00:00' },
    { name: '(UTC+00:00) Atlantic/Reykjavik', value: 'Atlantic/Reykjavik', time: '+00:00' },
    { name: '(UTC+00:00) Atlantic/St_Helena', value: 'Atlantic/St_Helena', time: '+00:00' },
    { name: '(UTC+01:00) Africa/Algiers', value: 'Africa/Algiers', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Bangui', value: 'Africa/Bangui', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Brazzaville', value: 'Africa/Brazzaville', time: '+01:00' },
    { name: '(UTC+01:00) Atlantic/Canary', value: 'Atlantic/Canary', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Casablanca', value: 'Africa/Casablanca', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Douala', value: 'Africa/Douala', time: '+01:00' },
    { name: '(UTC+01:00) Europe/Dublin', value: 'Europe/Dublin', time: '+01:00' },
    { name: '(UTC+01:00) Africa/El_Aaiun', value: 'Africa/El_Aaiun', time: '+01:00' },
    { name: '(UTC+01:00) Atlantic/Faroe', value: 'Atlantic/Faroe', time: '+01:00' },
    { name: '(UTC+01:00) Europe/Guernsey', value: 'Europe/Guernsey', time: '+01:00' },
    { name: '(UTC+01:00) Europe/Isle_of_Man', value: 'Europe/Isle_of_Man', time: '+01:00' },
    { name: '(UTC+01:00) Europe/Jersey', value: 'Europe/Jersey', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Kinshasa', value: 'Africa/Kinshasa', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Lagos', value: 'Africa/Lagos', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Libreville', value: 'Africa/Libreville', time: '+01:00' },
    { name: '(UTC+01:00) Europe/Lisbon', value: 'Europe/Lisbon', time: '+01:00' },
    { name: '(UTC+01:00) Europe/London', value: 'Europe/London', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Luanda', value: 'Africa/Luanda', time: '+01:00' },
    { name: '(UTC+01:00) Atlantic/Madeira', value: 'Atlantic/Madeira', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Malabo', value: 'Africa/Malabo', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Ndjamena', value: 'Africa/Ndjamena', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Niamey', value: 'Africa/Niamey', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Porto-Novo', value: 'Africa/Porto-Novo', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Sao_Tome', value: 'Africa/Sao_Tome', time: '+01:00' },
    { name: '(UTC+01:00) Africa/Tunis', value: 'Africa/Tunis', time: '+01:00' },
    { name: '(UTC+02:00) Europe/Amsterdam', value: 'Europe/Amsterdam', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Andorra', value: 'Europe/Andorra', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Belgrade', value: 'Europe/Belgrade', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Berlin', value: 'Europe/Berlin', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Blantyre', value: 'Africa/Blantyre', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Bratislava', value: 'Europe/Bratislava', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Brussels', value: 'Europe/Brussels', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Budapest', value: 'Europe/Budapest', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Bujumbura', value: 'Africa/Bujumbura', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Busingen', value: 'Europe/Busingen', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Cairo', value: 'Africa/Cairo', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Ceuta', value: 'Africa/Ceuta', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Copenhagen', value: 'Europe/Copenhagen', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Gaborone', value: 'Africa/Gaborone', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Gibraltar', value: 'Europe/Gibraltar', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Harare', value: 'Africa/Harare', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Johannesburg', value: 'Africa/Johannesburg', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Kaliningrad', value: 'Europe/Kaliningrad', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Khartoum', value: 'Africa/Khartoum', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Kigali', value: 'Africa/Kigali', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Ljubljana', value: 'Europe/Ljubljana', time: '+02:00' },
    { name: '(UTC+02:00) Arctic/Longyearbyen', value: 'Arctic/Longyearbyen', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Lubumbashi', value: 'Africa/Lubumbashi', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Lusaka', value: 'Africa/Lusaka', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Luxembourg', value: 'Europe/Luxembourg', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Madrid', value: 'Europe/Madrid', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Malta', value: 'Europe/Malta', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Maputo', value: 'Africa/Maputo', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Maseru', value: 'Africa/Maseru', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Mbabane', value: 'Africa/Mbabane', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Monaco', value: 'Europe/Monaco', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Oslo', value: 'Europe/Oslo', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Paris', value: 'Europe/Paris', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Podgorica', value: 'Europe/Podgorica', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Prague', value: 'Europe/Prague', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Rome', value: 'Europe/Rome', time: '+02:00' },
    { name: '(UTC+02:00) Europe/San_Marino', value: 'Europe/San_Marino', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Sarajevo', value: 'Europe/Sarajevo', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Skopje', value: 'Europe/Skopje', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Stockholm', value: 'Europe/Stockholm', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Tirane', value: 'Europe/Tirane', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Tripoli', value: 'Africa/Tripoli', time: '+02:00' },
    { name: '(UTC+02:00) Antarctica/Troll', value: 'Antarctica/Troll', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Vaduz', value: 'Europe/Vaduz', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Vatican', value: 'Europe/Vatican', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Vienna', value: 'Europe/Vienna', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Warsaw', value: 'Europe/Warsaw', time: '+02:00' },
    { name: '(UTC+02:00) Africa/Windhoek', value: 'Africa/Windhoek', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Zagreb', value: 'Europe/Zagreb', time: '+02:00' },
    { name: '(UTC+02:00) Europe/Zurich', value: 'Europe/Zurich', time: '+02:00' },
    { name: '(UTC+03:00) Africa/Addis_Ababa', value: 'Africa/Addis_Ababa', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Aden', value: 'Asia/Aden', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Amman', value: 'Asia/Amman', time: '+03:00' },
    { name: '(UTC+03:00) Indian/Antananarivo', value: 'Indian/Antananarivo', time: '+03:00' },
    { name: '(UTC+03:00) Africa/Asmara', value: 'Africa/Asmara', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Athens', value: 'Europe/Athens', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Baghdad', value: 'Asia/Baghdad', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Bahrain', value: 'Asia/Bahrain', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Beirut', value: 'Asia/Beirut', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Bucharest', value: 'Europe/Bucharest', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Chisinau', value: 'Europe/Chisinau', time: '+03:00' },
    { name: '(UTC+03:00) Indian/Comoro', value: 'Indian/Comoro', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Damascus', value: 'Asia/Damascus', time: '+03:00' },
    { name: '(UTC+03:00) Africa/Dar_es_Salaam', value: 'Africa/Dar_es_Salaam', time: '+03:00' },
    { name: '(UTC+03:00) Africa/Djibouti', value: 'Africa/Djibouti', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Famagusta', value: 'Asia/Famagusta', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Gaza', value: 'Asia/Gaza', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Hebron', value: 'Asia/Hebron', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Helsinki', value: 'Europe/Helsinki', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Istanbul', value: 'Europe/Istanbul', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Jerusalem', value: 'Asia/Jerusalem', time: '+03:00' },
    { name: '(UTC+03:00) Africa/Juba', value: 'Africa/Juba', time: '+03:00' },
    { name: '(UTC+03:00) Africa/Kampala', value: 'Africa/Kampala', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Kiev', value: 'Europe/Kiev', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Kirov', value: 'Europe/Kirov', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Kuwait', value: 'Asia/Kuwait', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Mariehamn', value: 'Europe/Mariehamn', time: '+03:00' },
    { name: '(UTC+03:00) Indian/Mayotte', value: 'Indian/Mayotte', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Minsk', value: 'Europe/Minsk', time: '+03:00' },
    { name: '(UTC+03:00) Africa/Mogadishu', value: 'Africa/Mogadishu', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Moscow', value: 'Europe/Moscow', time: '+03:00' },
    { name: '(UTC+03:00) Africa/Nairobi', value: 'Africa/Nairobi', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Nicosia', value: 'Asia/Nicosia', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Qatar', value: 'Asia/Qatar', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Riga', value: 'Europe/Riga', time: '+03:00' },
    { name: '(UTC+03:00) Asia/Riyadh', value: 'Asia/Riyadh', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Simferopol', value: 'Europe/Simferopol', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Sofia', value: 'Europe/Sofia', time: '+03:00' },
    { name: '(UTC+03:00) Antarctica/Syowa', value: 'Antarctica/Syowa', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Tallinn', value: 'Europe/Tallinn', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Uzhgorod', value: 'Europe/Uzhgorod', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Vilnius', value: 'Europe/Vilnius', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Volgograd', value: 'Europe/Volgograd', time: '+03:00' },
    { name: '(UTC+03:00) Europe/Zaporozhye', value: 'Europe/Zaporozhye', time: '+03:00' },
    { name: '(UTC+04:00) Europe/Astrakhan', value: 'Europe/Astrakhan', time: '+04:00' },
    { name: '(UTC+04:00) Asia/Baku', value: 'Asia/Baku', time: '+04:00' },
    { name: '(UTC+04:00) Asia/Dubai', value: 'Asia/Dubai', time: '+04:00' },
    { name: '(UTC+04:00) Indian/Mahe', value: 'Indian/Mahe', time: '+04:00' },
    { name: '(UTC+04:00) Indian/Mauritius', value: 'Indian/Mauritius', time: '+04:00' },
    { name: '(UTC+04:00) Asia/Muscat', value: 'Asia/Muscat', time: '+04:00' },
    { name: '(UTC+04:00) Indian/Reunion', value: 'Indian/Reunion', time: '+04:00' },
    { name: '(UTC+04:00) Europe/Samara', value: 'Europe/Samara', time: '+04:00' },
    { name: '(UTC+04:00) Europe/Saratov', value: 'Europe/Saratov', time: '+04:00' },
    { name: '(UTC+04:00) Asia/Tbilisi', value: 'Asia/Tbilisi', time: '+04:00' },
    { name: '(UTC+04:00) Europe/Ulyanovsk', value: 'Europe/Ulyanovsk', time: '+04:00' },
    { name: '(UTC+04:00) Asia/Yerevan', value: 'Asia/Yerevan', time: '+04:00' },
    { name: '(UTC+04:30) Asia/Kabul', value: 'Asia/Kabul', time: '+04:30' },
    { name: '(UTC+04:30) Asia/Tehran', value: 'Asia/Tehran', time: '+04:30' },
    { name: '(UTC+05:00) Asia/Aqtau', value: 'Asia/Aqtau', time: '+05:00' },
    { name: '(UTC+05:00) Asia/Aqtobe', value: 'Asia/Aqtobe', time: '+05:00' },
    { name: '(UTC+05:00) Asia/Ashgabat', value: 'Asia/Ashgabat', time: '+05:00' },
    { name: '(UTC+05:00) Asia/Atyrau', value: 'Asia/Atyrau', time: '+05:00' },
    { name: '(UTC+05:00) Asia/Karachi', value: 'Asia/Karachi', time: '+05:00' },
    { name: '(UTC+05:00) Indian/Kerguelen', value: 'Indian/Kerguelen', time: '+05:00' },
    { name: '(UTC+05:00) Indian/Maldives', value: 'Indian/Maldives', time: '+05:00' },
    { name: '(UTC+05:00) Antarctica/Mawson', value: 'Antarctica/Mawson', time: '+05:00' },
    { name: '(UTC+05:00) Asia/Oral', value: 'Asia/Oral', time: '+05:00' },
    { name: '(UTC+05:00) Asia/Samarkand', value: 'Asia/Samarkand', time: '+05:00' },
    { name: '(UTC+05:00) Asia/Tashkent', value: 'Asia/Tashkent', time: '+05:00' },
    { name: '(UTC+05:00) Asia/Yekaterinburg', value: 'Asia/Yekaterinburg', time: '+05:00' },
    { name: '(UTC+05:30) Asia/Colombo', value: 'Asia/Colombo', time: '+05:30' },
    { name: '(UTC+05:30) Asia/Kolkata', value: 'Asia/Kolkata', time: '+05:30' },
    { name: '(UTC+05:45) Asia/Kathmandu', value: 'Asia/Kathmandu', time: '+05:45' },
    { name: '(UTC+06:00) Asia/Almaty', value: 'Asia/Almaty', time: '+06:00' },
    { name: '(UTC+06:00) Asia/Bishkek', value: 'Asia/Bishkek', time: '+06:00' },
    { name: '(UTC+06:00) Indian/Chagos', value: 'Indian/Chagos', time: '+06:00' },
    { name: '(UTC+06:00) Asia/Dhaka', value: 'Asia/Dhaka', time: '+06:00' },
    { name: '(UTC+06:00) Asia/Omsk', value: 'Asia/Omsk', time: '+06:00' },
    { name: '(UTC+06:00) Asia/Qyzylorda', value: 'Asia/Qyzylorda', time: '+06:00' },
    { name: '(UTC+06:00) Asia/Thimphu', value: 'Asia/Thimphu', time: '+06:00' },
    { name: '(UTC+06:00) Asia/Urumqi', value: 'Asia/Urumqi', time: '+06:00' },
    { name: '(UTC+06:00) Antarctica/Vostok', value: 'Antarctica/Vostok', time: '+06:00' },
    { name: '(UTC+06:30) Indian/Cocos', value: 'Indian/Cocos', time: '+06:30' },
    { name: '(UTC+06:30) Asia/Yangon', value: 'Asia/Yangon', time: '+06:30' },
    { name: '(UTC+07:00) Asia/Bangkok', value: 'Asia/Bangkok', time: '+07:00' },
    { name: '(UTC+07:00) Asia/Barnaul', value: 'Asia/Barnaul', time: '+07:00' },
    { name: '(UTC+07:00) Indian/Christmas', value: 'Indian/Christmas', time: '+07:00' },
    { name: '(UTC+07:00) Antarctica/Davis', value: 'Antarctica/Davis', time: '+07:00' },
    { name: '(UTC+07:00) Asia/Ho_Chi_Minh', value: 'Asia/Ho_Chi_Minh', time: '+07:00' },
    { name: '(UTC+07:00) Asia/Hovd', value: 'Asia/Hovd', time: '+07:00' },
    { name: '(UTC+07:00) Asia/Jakarta', value: 'Asia/Jakarta', time: '+07:00' },
    { name: '(UTC+07:00) Asia/Krasnoyarsk', value: 'Asia/Krasnoyarsk', time: '+07:00' },
    { name: '(UTC+07:00) Asia/Novokuznetsk', value: 'Asia/Novokuznetsk', time: '+07:00' },
    { name: '(UTC+07:00) Asia/Novosibirsk', value: 'Asia/Novosibirsk', time: '+07:00' },
    { name: '(UTC+07:00) Asia/Phnom_Penh', value: 'Asia/Phnom_Penh', time: '+07:00' },
    { name: '(UTC+07:00) Asia/Pontianak', value: 'Asia/Pontianak', time: '+07:00' },
    { name: '(UTC+07:00) Asia/Tomsk', value: 'Asia/Tomsk', time: '+07:00' },
    { name: '(UTC+07:00) Asia/Vientiane', value: 'Asia/Vientiane', time: '+07:00' },
    { name: '(UTC+08:00) Asia/Brunei', value: 'Asia/Brunei', time: '+08:00' },
    { name: '(UTC+08:00) Antarctica/Casey', value: 'Antarctica/Casey', time: '+08:00' },
    { name: '(UTC+08:00) Asia/Choibalsan', value: 'Asia/Choibalsan', time: '+08:00' },
    { name: '(UTC+08:00) Asia/Dushanbe', value: 'Asia/Dushanbe', time: '+05:00' },
    { name: '(UTC+08:00) Asia/Hong_Kong', value: 'Asia/Hong_Kong', time: '+08:00' },
    { name: '(UTC+08:00) Asia/Irkutsk', value: 'Asia/Irkutsk', time: '+08:00' },
    { name: '(UTC+08:00) Asia/Kuala_Lumpur', value: 'Asia/Kuala_Lumpur', time: '+08:00' },
    { name: '(UTC+08:00) Asia/Kuching', value: 'Asia/Kuching', time: '+08:00' },
    { name: '(UTC+08:00) Asia/Macau', value: 'Asia/Macau', time: '+08:00' },
    { name: '(UTC+08:00) Asia/Makassar', value: 'Asia/Makassar', time: '+08:00' },
    { name: '(UTC+08:00) Asia/Manila', value: 'Asia/Manila', time: '+08:00' },
    { name: '(UTC+08:00) Australia/Perth', value: 'Australia/Perth', time: '+08:00' },
    { name: '(UTC+08:00) Asia/Shanghai', value: 'Asia/Shanghai', time: '+08:00' },
    { name: '(UTC+08:00) Asia/Singapore', value: 'Asia/Singapore', time: '+08:00' },
    { name: '(UTC+08:00) Asia/Taipei', value: 'Asia/Taipei', time: '+08:00' },
    { name: '(UTC+08:00) Asia/Ulaanbaatar', value: 'Asia/Ulaanbaatar', time: '+08:00' },
    { name: '(UTC+08:30) Asia/Pyongyang', value: 'Asia/Pyongyang', time: '+08:30' },
    { name: '(UTC+08:45) Australia/Eucla', value: 'Australia/Eucla', time: '+08:45' },
    { name: '(UTC+09:00) Asia/Chita', value: 'Asia/Chita', time: '+09:00' },
    { name: '(UTC+09:00) Asia/Dili', value: 'Asia/Dili', time: '+09:00' },
    { name: '(UTC+09:00) Asia/Jayapura', value: 'Asia/Jayapura', time: '+09:00' },
    { name: '(UTC+09:00) Asia/Khandyga', value: 'Asia/Khandyga', time: '+09:00' },
    { name: '(UTC+09:00) Pacific/Palau', value: 'Pacific/Palau', time: '+09:00' },
    { name: '(UTC+09:00) Asia/Seoul', value: 'Asia/Seoul', time: '+09:00' },
    { name: '(UTC+09:00) Asia/Tokyo', value: 'Asia/Tokyo', time: '+09:00' },
    { name: '(UTC+09:00) Asia/Yakutsk', value: 'Asia/Yakutsk', time: '+09:00' },
    { name: '(UTC+09:30) Australia/Adelaide', value: 'Australia/Adelaide', time: '+09:30' },
    { name: '(UTC+09:30) Australia/Broken_Hill', value: 'Australia/Broken_Hill', time: '+09:30' },
    { name: '(UTC+09:30) Australia/Darwin', value: 'Australia/Darwin', time: '+09:30' },
    { name: '(UTC+10:00) Australia/Brisbane', value: 'Australia/Brisbane', time: '+10:00' },
    { name: '(UTC+10:00) Pacific/Chuuk', value: 'Pacific/Chuuk', time: '+10:00' },
    { name: '(UTC+10:00) Australia/Currie', value: 'Australia/Currie', time: '+10:00' },
    { name: '(UTC+10:00) Antarctica/DumontDUrville', value: 'Antarctica/DumontDUrville', time: '+10:00' },
    { name: '(UTC+10:00) Pacific/Guam', value: 'Pacific/Guam', time: '+10:00' },
    { name: '(UTC+10:00) Australia/Hobart', value: 'Australia/Hobart', time: '+10:00' },
    { name: '(UTC+10:00) Australia/Lindeman', value: 'Australia/Lindeman', time: '+10:00' },
    { name: '(UTC+10:00) Australia/Melbourne', value: 'Australia/Melbourne', time: '+10:00' },
    { name: '(UTC+10:00) Pacific/Port_Moresby', value: 'Pacific/Port_Moresby', time: '+10:00' },
    { name: '(UTC+10:00) Pacific/Saipan', value: 'Pacific/Saipan', time: '+10:00' },
    { name: '(UTC+10:00) Australia/Sydney', value: 'Australia/Sydney', time: '+10:00' },
    { name: '(UTC+10:00) Asia/Ust-Nera', value: 'Asia/Ust-Nera', time: '+10:00' },
    { name: '(UTC+10:00) Asia/Vladivostok', value: 'Asia/Vladivostok', time: '+10:00' },
    { name: '(UTC+10:30) Australia/Lord_Howe', value: 'Australia/Lord_Howe', time: '+10:30' },
    { name: '(UTC+11:00) Pacific/Bougainville', value: 'Pacific/Bougainville', time: '+11:00' },
    { name: '(UTC+11:00) Pacific/Efate', value: 'Pacific/Efate', time: '+11:00' },
    { name: '(UTC+11:00) Pacific/Guadalcanal', value: 'Pacific/Guadalcanal', time: '+11:00' },
    { name: '(UTC+11:00) Pacific/Kosrae', value: 'Pacific/Kosrae', time: '+11:00' },
    { name: '(UTC+11:00) Antarctica/Macquarie', value: 'Antarctica/Macquarie', time: '+11:00' },
    { name: '(UTC+11:00) Asia/Magadan', value: 'Asia/Magadan', time: '+11:00' },
    { name: '(UTC+11:00) Pacific/Norfolk', value: 'Pacific/Norfolk', time: '+11:00' },
    { name: '(UTC+11:00) Pacific/Noumea', value: 'Pacific/Noumea', time: '+11:00' },
    { name: '(UTC+11:00) Pacific/Pohnpei', value: 'Pacific/Pohnpei', time: '+11:00' },
    { name: '(UTC+11:00) Asia/Sakhalin', value: 'Asia/Sakhalin', time: '+11:00' },
    { name: '(UTC+11:00) Asia/Srednekolymsk', value: 'Asia/Srednekolymsk', time: '+11:00' },
    { name: '(UTC+12:00) Asia/Anadyr', value: 'Asia/Anadyr', time: '+12:00' },
    { name: '(UTC+12:00) Pacific/Auckland', value: 'Pacific/Auckland', time: '+12:00' },
    { name: '(UTC+12:00) Pacific/Fiji', value: 'Pacific/Fiji', time: '+12:00' },
    { name: '(UTC+12:00) Pacific/Funafuti', value: 'Pacific/Funafuti', time: '+12:00' },
    { name: '(UTC+12:00) Asia/Kamchatka', value: 'Asia/Kamchatka', time: '+12:00' },
    { name: '(UTC+12:00) Pacific/Kwajalein', value: 'Pacific/Kwajalein', time: '+12:00' },
    { name: '(UTC+12:00) Pacific/Majuro', value: 'Pacific/Majuro', time: '+12:00' },
    { name: '(UTC+12:00) Antarctica/McMurdo', value: 'Antarctica/McMurdo', time: '+12:00' },
    { name: '(UTC+12:00) Pacific/Nauru', value: 'Pacific/Nauru', time: '+12:00' },
    { name: '(UTC+12:00) Pacific/Tarawa', value: 'Pacific/Tarawa', time: '+12:00' },
    { name: '(UTC+12:00) Pacific/Wake', value: 'Pacific/Wake', time: '+12:00' },
    { name: '(UTC+12:00) Pacific/Wallis', value: 'Pacific/Wallis', time: '+12:00' },
    { name: '(UTC+12:45) Pacific/Chatham', value: 'Pacific/Chatham', time: '+12:45' },
    { name: '(UTC+13:00) Pacific/Apia', value: 'Pacific/Apia', time: '+13:00' },
    { name: '(UTC+13:00) Pacific/Enderbury', value: 'Pacific/Enderbury', time: '+13:00' },
    { name: '(UTC+13:00) Pacific/Fakaofo', value: 'Pacific/Fakaofo', time: '+13:00' },
    { name: '(UTC+13:00) Pacific/Tongatapu', value: 'Pacific/Tongatapu', time: '+13:00' },
    { name: '(UTC+14:00) Pacific/Kiritimati', value: 'Pacific/Kiritimati', time: '+14:00' }
  ];
}

interface userTimeZone {
  name: string,
  value: string,
  time: string
}