import { Component, OnInit, AfterViewInit, ViewChild, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from './services/user.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonService } from './common/common.service';
import { LoaderService } from './services/loader.service';
//import { ChatAdapter, User } from '../ng-chat/core/ChatAdapter';
import { StudentService } from './services/student.service';
import { TeacherService } from './services/teacher.service';
import { UserChatAdapter } from './services/UserChat-adapter';
import { CookieService } from 'ngx-cookie-service';
import { IChatController } from './ng-chat/core/chat-controller';
import { ChatAdapter } from './ng-chat/core/chat-adapter';
//import { IChatController } from '../ng-chat/ng-chat/core/chat-controller';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('ngChatInstance')
  protected ngChatInstance: IChatController;
  isHeader: boolean = false;
  ngAfterViewInit(): void {
    this.appComponentCallbackEvents();
  }
  userRole: string;
  Password: string;
  username: string;
  loggedInFlag: boolean;
  userId: any;
  public adapter: ChatAdapter;
  isChatWindow: boolean;
  isLogin: boolean = false;
  public friendUserType: string = "";

  constructor(private http: HttpClient, public userService: UserService, private _ngZone: NgZone,
    public commonService: CommonService, private router: Router, public loaderService: LoaderService,
    private studentService: StudentService, private teacherService: TeacherService, private activatedRoute: ActivatedRoute,
    private cookieService: CookieService) {
    //localStorage.setItem('UserType', 'Role');
  }

  appComponentCallbackEvents() {
    window['appComponentRefrence'] = {
      zone: this._ngZone,
      openUserChatWindow: (value) => this.openUserChatWindow(value),
      component: this,
    };
  }

  ngOnInit() {
    if (window.location.search.includes('utm') || window.location.search.includes('source')) {
      let search = window.location.search.substr(1, window.location.search.length - 2);
      let analyticsdata = '{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}';
      this.cookieService.set('analyticsData', analyticsdata);
      if (window.location.hash.includes('signup') || window.location.hash.includes('role')) {
        localStorage.removeItem('userData');
        let hash = window.location.hash.substr(2);
        let hashData = '{"' + decodeURI(hash).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}';
        this.cookieService.set('signUpData', hashData);
      }
      this.router.navigate['/signup'];
    }
    else {
      var userData = JSON.parse(localStorage.getItem('userData'));
      if (userData != null) {
        if (localStorage.getItem('UserType') == 'Teacher') {
          if (userData.Teacher != undefined && userData.Teacher != null) {
            this.userId = userData.Teacher[0].TeacherId;
          }
          this.friendUserType = "Students";
        }
        else {
          if (userData.Student != undefined && userData.Student != null) {
            this.userId = userData.Student[0].StudentId;
          }
          this.friendUserType = "Teachers";
        }
        CommonService.isUserLoggedIn = true;
      }
      this.loggedInFlag = true;
      this.userRole = localStorage.getItem("UserType");
      if (window.location.hash.indexOf('#access_token') > -1) {
        var access_token = window.location.hash.replace('#access_token=', '');
        if (access_token != '') {
          this.http.get('https://api.instagram.com/v1/users/self/?access_token=' + access_token).subscribe(result => {
            this.saveSocialLoginUserProfileInfo(result);
          });
        }
      }
    }
  }

  saveSocialLoginUserProfileInfo(userData) {
    this.userService.user.UserGUID = userData.data.id;
    this.userService.user.Email = userData.data.username;
    this.userService.user.FirstName = userData.data.full_name
    this.userService.user.LastName = "";
    this.userService.user.IsTeacher = this.userRole === 'Teacher' ? 1 : 0;
    this.userService.user.IsStudent = this.userRole === 'Student' ? 1 : 0;
    if (this.userService.user.IsTeacher === 1) {
      this.userService.user.Teacher[0].ImageURL = userData.data.profile_picture;
      this.userService.user.Student = [];
    }
    if (this.userService.user.IsStudent === 1) {
      this.userService.user.Student[0].ImageURL = userData.data.profile_picture;
      this.userService.user.Teacher = [];
    }
    //set userId as password
    this.userService.user.Password = userData.data.id;
    if (this.commonService.isFBMCNewUser) {
      this.userService.user.LessonGuid = localStorage.getItem("gvlGuid") != null && localStorage.getItem("gvlGuid") != undefined ?
        localStorage.getItem("gvlGuid") : "";
    }
    this.userService.post('/user/InsertUserSignUpData', this.userService.user, new HttpParams().set('isSocialLogin', 'true').
      set('isFBMC', this.commonService.isFBMCNewUser.toString())).subscribe((result: any) => {
        if (result.result != null) {
          var response = result.result;
          localStorage.setItem('UserType', this.userRole);
          if ((response.IsTeacher === 1) || (response.IsStudent === 1)) {
            // set user global TimeZone
            CommonService.userZone = response.TimeZone;
            localStorage.setItem('userData', JSON.stringify(response));
            if (this.userService.userRole === "Teacher") {
              this.commonService.userProfilePic = response.Teacher[0].ImageURL;
              localStorage.setItem("userImageUrl", response.Teacher[0].ImageURL);
            }
            else if (this.userService.userRole === "Student") {
              if (localStorage.getItem('LessonLink') != null) {
                let linkId = localStorage.getItem('LessonLink');
                let id = response.Student[0].StudentId;
                this.userService.post('/user/CreateTeacherStudentRelationship', null, new HttpParams().set("linkId", linkId).set("studentId", id))
                  .subscribe((resultData: any) => {
                    localStorage.setItem('associatedTeacher', resultData);
                  });
              }
              else if (localStorage.getItem('InviteGuid') != null) {
                let inviteId = localStorage.getItem('InviteGuid');
                let studentId = response.Student[0].StudentId;
                this.userService.post('/user/CreateTeacherStudentAssociation', null, new HttpParams().set("userId", inviteId)
                  .set("studentId", studentId).set("studentEmail", userData.data.username).
                  set('isSocialLogin', 'true')).subscribe((resultData: any) => {
                  });
              }
              this.commonService.userProfilePic = response.Student[0].ImageURL;
              localStorage.setItem("userImageUrl", response.Student[0].ImageURL);
            }
            localStorage.removeItem('userName');
            localStorage.removeItem('password');
            var data = "username=" + userData.data.username + "&password=" + userData.data.id + "&grant_type=password";
            this.userService.getAuth2AccessToken(this.commonService.apiDevEndpoint + '/token', data).subscribe((result: any) => {
              this.setMenu();
              this.setSession(result);
              this.userService.upsertUserActivity("ActiveStatus");
            });
          }
        }
        else {
          alert("User login failed. Please try again.");
          this.router.navigate['/login'];
        }
      });
  }

  setSession(result) {
    localStorage.setItem('access_token', result.access_token);
    localStorage.setItem('expires_at', result.expires_in);
  }

  setMenu() {
    if (this.userRole == "Teacher") {
      this.commonService.MenuList = this.commonService.TeacherMenuList;
      this.router.navigate(['/teacher/dashboard']);
    }
    else if (this.userRole == "Student") {
      this.commonService.MenuList = this.commonService.StudentMenuList;
      if (localStorage.getItem('LessonLink') != null) {
        this.router.navigate(['/student/schedule/personalsettings']);
      }
      else {
        this.router.navigate(['/student/dashboard']);
      }
    }
  }

  changeOfRoutes() {
    var userData = JSON.parse(localStorage.getItem('userData'));
    
    this.isChatWindow = (window.location.href.includes('#/login') || window.location.href.includes('videoConnected')
      || window.location.href.includes('lesson-planner') || window.location.href.includes('guidedvideo-lessonplanner') ||
      window.location.href.includes('#/mobile/history-accordion') || window.location.href.includes('#/mobile-lesson-player')
      || window.location.href.includes("#/Main/LessonLobbyMobile") || window.location.href.includes("#/mobile/favorites")
      || window.location.href.includes("#/term-of-service") || window.location.href.includes("#/select-type")
      || window.location.href.includes("#/mobile/student/guidedvideofeedback") || window.location.href.includes('#/signup')
      || window.location.href.includes('/mobile-lobby') || window.location.href.includes('playlist')) ? true : false;

    this.isHeader = (window.location.href.includes("#/term-of-service") || window.location.href.includes("#/select-type")
      || window.location.href.includes("#/forgot-password") || window.location.href.includes("#/resetpassword")
      || window.location.href.includes("#/mobile/student/guidedvideofeedback") || window.location.href.includes("#/Main/LessonLobbyMobile") ||
      window.location.href.includes('/mobile/history-accordion') || window.location.href.includes('/#/mobile-lesson-player') || window.location.href.includes('#/mobile/favorites') ||
      window.location.href.includes('/mobile-lobby') ) ? false : true;


    // var userData = JSON.parse(localStorage.getItem('userData'));        
    // //!CommonService.isUserLoggedIn && window.location.hash != "#/login" && window.location.hash != "#/login/mobile" && window.location.hash.split('?')[0] != "#/mobile/history-accordion"
    // //  && window.location.hash.split('?')[0] != "#/mobile-lesson-player" && window.location.hash.split('?')[0] != "#/Main/LessonLobbyMobile" && userData != null
    // if (!window.location.href.includes('#/login') && window.location.href.includes('lesson-planner')  && window.location.href.includes('guidedvideo-lessonplanner') &&
    // window.location.href.includes('#/mobile/history-accordion') && window.location.href.includes('#/mobile-lesson-player') 
    // && window.location.href.includes("#/Main/LessonLobbyMobile") && window.location.href.includes("#/mobile/favorites") ) {
    //   if (localStorage.getItem('UserType') == 'Teacher')
    //     this.userId = userData.Teacher[0].TeacherId;            
    //   else
    //     this.userId = userData.Student[0].StudentId;              
    //   this.adapter = new UserChatAdapter(this.studentService, this.teacherService);
    //   CommonService.isUserLoggedIn = true;
    // }


    //this.isLogginPage =( window.location.href.includes('#/login') || window.location.href.includes('videoConnected') 
    //|| window.location.href.includes('lesson-planner')  || window.location.href.includes('guidedvideo-lessonplanner') )  ? true : false;
    //var userData = JSON.parse(localStorage.getItem('userData'));

    //!CommonService.isUserLoggedIn && window.location.hash != "#/login" && window.location.hash != "#/login/mobile" && window.location.hash.split('?')[0] != "#/mobile/history-accordion"
    //  && window.location.hash.split('?')[0] != "#/mobile-lesson-player" && window.location.hash.split('?')[0] != "#/Main/LessonLobbyMobile" && userData != null

    //this.adapter = new UserChatAdapter(this.studentService, this.teacherService);
    if (!window.location.href.includes('#/login')) {
      if (userData != null && userData != undefined) {
        if (localStorage.getItem('UserType') == 'Teacher') {
          this.userId = userData.Teacher[0].TeacherId;
          this.friendUserType = "Students";
        }
        else {
          if (userData.Student[0] != undefined) {
            this.userId = userData.Student[0].StudentId;
            this.friendUserType = "Teachers";
          }
        }
        if (this.userId > 0) {
          this.isLogin = true;
          this.adapter = new UserChatAdapter(this.studentService, this.teacherService);
          CommonService.isUserLoggedIn = true;
        }
      }
    }
  }

  openUserChatWindow(userId) {
    let user = UserChatAdapter.mockedUsers.find(x => x.id == userId)
    this.ngChatInstance.triggerOpenChatWindow(user);
  }
}
