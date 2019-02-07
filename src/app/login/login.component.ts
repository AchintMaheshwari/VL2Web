import { Component, OnInit, ViewChild, NgZone, AfterViewChecked } from '@angular/core';
import { UserService } from '../services/user.service';
import { HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '../common/common.service';
import { AuthService } from 'angular5-social-login';
import { SocialUser } from 'angular5-social-login';
import { GoogleLoginProvider, FacebookLoginProvider, LinkedinLoginProvider } from 'angular5-social-login';
import { ToastrService } from 'ngx-toastr';
import { LoginModel } from '../models/login.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LoaderService } from '../services/loader.service';
import { CookieService } from 'ngx-cookie-service';
import { TwitterService } from '../services/twitter.service';

declare var IN: any
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewChecked {
  @ViewChild('signupForm') signupform: any;
  @ViewChild('loginForm') loginForm: any;
  pwdType: string = "password";
  rptPwdType: string = "password";
  repeatPassword: string = "";
  username: string = "";
  Password: string = "";
  isLoginSubmitFlag: boolean = false;
  isLoginProcessing: boolean = false;
  isSignUpSubmitFlag: boolean = false;
  isSignUpProcessing: boolean = false;
  isPwdMismatch: boolean = false;
  loggedInFlag: boolean = false;
  isUserExists: boolean = false;
  socialMediaUser: SocialUser;
  isSignUpFlag: boolean = false;
  isLinkedInSignup: boolean = false;
  window: any;
  isSignUp: boolean = false;
  isMobileInstagramVisible: boolean = false;
  isLoginState: boolean = true;

  constructor(public userService: UserService, private router: Router, public commonService: CommonService,
    private authService: AuthService, private ngZone: NgZone, private toastr: ToastrService, private twitterService: TwitterService,
    private loaderService: LoaderService, private activatedRoute: ActivatedRoute, private cookieService: CookieService) {
    if (cookieService.get('signUpData') != null && cookieService.get('signUpData') != undefined && cookieService.get('signUpData') != "") {
      let infoData = JSON.parse(cookieService.get('signUpData'));
      if (infoData.role.toLowerCase() === "teacher") {
        this.userService.userRole = "Teacher";
      }
      else if (infoData.role.toLowerCase() === "student") {
        this.userService.userRole = "Student";
      }
      else {
        this.userService.userRole = "Role";
      }
      if (infoData.signup === "1")
        this.isSignUp = true;
      this.commonService.isTeacherInviteLink = true;
    }
    else {
      if (localStorage.getItem("userName") != null && localStorage.getItem("password") != null) {
        this.loggedInFlag = true;
        this.username = localStorage.getItem("userName");
        this.Password = localStorage.getItem("password");
      }
      this.userService.user.Email = '';
      this.userService.user.Password = '';
      this.userService.initialiseUser();
      this.userService.userRole = localStorage.getItem("UserType");
    }

    if (this.commonService.isFBMCNewUser) {
      this.toastr.info("User does not exist. Kindly signup using same email/social to view the video feedback. User type is set to Student and control is disabled.");
      this.userService.user.Email = this.commonService.fbUserName;
    }
    if (this.commonService.fbUserName != "") {
      this.username = this.commonService.fbUserName;
    }
  }

  public instagramUrl;
  ngOnInit() {
    this.window = window;
    CommonService.isUserLoggedIn = false;
    this.authService.authState.subscribe((user) => {
      this.socialMediaUser = user;
    });
    this.instagramUrl = 'https://www.instagram.com/oauth/authorize/?client_id=' + CommonService.IsnstagramClient_Id + '&redirect_uri=' + CommonService.Instagramredirect_uri + '&response_type=token';
    this.initLinkdin();

    this.isMobileInstagramVisible = this.activatedRoute.snapshot.params["mobile"] == "mobile" ? true : false;
  }

  ngAfterViewChecked() {
    if (this.commonService.isTeacherInviteLink || this.commonService.isFBMCNewUser || this.commonService.isSocialShare) {
      this.setActiveTab();
    }
  }

  getLoginState() {
    this.isLoginState = true;
  }

  getSignupState() {
    this.isLoginState = false;
  }

  showPassword(type) {
    if (this.userService.user.Password != "") {
      if (type === "password") {
        this.pwdType = "text";
      }
      else {
        this.pwdType = "password";
      }
    }
  }

  verifyPassword() {
    if (this.userService.user.Password === "") {
      this.pwdType = "password";
    }
    if (this.repeatPassword === "") {
      this.rptPwdType = "password";
    }
    if (this.userService.user.Password != "" && this.repeatPassword != "" && this.userService.user.Password != this.repeatPassword) {
      this.isPwdMismatch = true;
    }
    else {
      this.isPwdMismatch = false;
    }
  }

  showRptPassword(type) {
    if (this.repeatPassword != "") {
      if (type === "password") {
        this.rptPwdType = "text";
      }
      else {
        this.rptPwdType = "password";
      }
    }
  }

  loginProcessing() {
    CommonService.isSignout = false;
    if (this.activatedRoute.snapshot.params["mobile"] == "mobile") {
      let androidCalled = this.activatedRoute.snapshot.queryParams["androidCalled"] == 'true' ? true : false;
      this.window.mobileStartLesson(androidCalled, null, this.username, this.Password);
    }
    else {
      this.isLoginSubmitFlag = true;
      if (this.loginForm.valid) {
        this.isLoginProcessing = true;
        this.userLogin();
      }
    }
  }

  userLogin() {
    var userLoginData: LoginModel = {
      UserName: this.username,
      Password: this.Password
    };
    this.loaderService.processloader = true;
    this.userService.anonymousPost('/user/UserLogin', userLoginData).subscribe((response: any) => {
      if (response != null) {
        if (response.EmailConfirmationFlag) {
          // set user global TimeZone
          CommonService.userZone = response.TimeZone;
          localStorage.setItem('userData', JSON.stringify(response));
          if (localStorage.getItem('ShareLessonGuid') != null) {
            let shareLessonId = localStorage.getItem('ShareLessonGuid');
            let userId = response.UserId;
            this.userService.post('/lesson/AssociateLessonsToUsers', null, new HttpParams().set("lessonGuid", shareLessonId)
              .set("userId", userId)).subscribe((resultData: any) => {
                localStorage.removeItem('ShareLessonGuid');
                if (!resultData) {
                  this.toastr.warning("Sorry, this lesson is created by the same user as a tecaher. So lesson assign to this user is not possible.");
                }
              });
          }
          else if (localStorage.getItem('ShareSongGuid') != null) {
            let shareSongId = localStorage.getItem('ShareSongGuid');
            let userId = response.UserId;
            this.userService.post('/song/AssociateSongToUser', null, new HttpParams().set("songGuid", shareSongId)
              .set("userId", userId)).subscribe((resultData: any) => {
                localStorage.removeItem('ShareSongGuid');
                if (!resultData) {
                  this.toastr.warning("Sorry, this song is created by the same user. So song assign to this user is not possible.");
                }
              });
          }
          else if (localStorage.getItem('ShareExerciseGuid') != null) {
            let shareExerciseId = localStorage.getItem('ShareExerciseGuid');
            let userId = response.UserId;
            this.userService.post('/planner/AssociateExercisesToUsers', null, new HttpParams().set("exerciseGuid", shareExerciseId)
              .set("userId", userId)).subscribe((resultData: any) => {
                localStorage.removeItem('ShareExerciseGuid');
                if (!resultData) {
                  this.toastr.warning("Sorry, this exercise is created by the same user as a tecaher. So exercise assign to this user is not possible.");
                }
              });
          }
          else if (localStorage.getItem('ShareVideoGuid') != null) {
            let shareVideoId = localStorage.getItem('ShareVideoGuid');
            let userId = response.UserId;
            this.userService.post('/video/AssociateVideoToUsers', null, new HttpParams().set("videoGuid", shareVideoId)
              .set("userId", userId)).subscribe((resultData: any) => {
                localStorage.removeItem('ShareVideoGuid');
                if (!resultData) {
                  this.toastr.warning("Sorry, this video is created by the same user as a tecaher. So video assign to this user is not possible.");
                }
              });
          }

          if (((response.IsTeacher === 1) && (response.IsStudent === 0)) ||
            ((response.IsTeacher === 0) && (response.IsStudent === 1))) {
            if (response.IsTeacher === 1) {
              localStorage.setItem('UserType', "Teacher");
              this.commonService.userProfilePic = response.Teacher[0].ImageURL;
              localStorage.setItem("userImageUrl", response.Teacher[0].ImageURL);
              this.userService.userRole = "Teacher";
            }
            else if (response.IsStudent === 1) {
              localStorage.setItem('UserType', "Student");
              let studentId = response.Student[0].StudentId;
              CommonService.isLogin = true;
              if (localStorage.getItem('LessonLink') != null && localStorage.getItem('UserType') === "Student") {
                let linkId = localStorage.getItem('LessonLink');
                this.userService.post('/user/CreateTeacherStudentRelationship', null, new HttpParams().set("linkId", linkId)
                  .set("studentId", studentId)).subscribe((resultData: any) => {
                    localStorage.setItem('associatedTeacher', resultData);
                  });
              }
              else if (localStorage.getItem('InviteGuid') != null) {
                let inviteId = localStorage.getItem('InviteGuid')
                this.userService.post('/user/CreateTeacherStudentAssociation', null, new HttpParams().set("userId", inviteId)
                  .set("studentId", studentId).set("studentEmail", this.username).set("isLogin", 'true')).subscribe((resultData: any) => {
                  });
              }
              this.userService.userRole = "Student";
              this.commonService.userProfilePic = response.Student[0].ImageURL;
              localStorage.setItem("userImageUrl", response.Student[0].ImageURL);
            }
            if (this.loggedInFlag) {
              localStorage.setItem('userName', response.Email);
              localStorage.setItem('password', response.Password);
            }
            else {
              localStorage.removeItem('userName');
              localStorage.removeItem('password');
            }
            var data = "username=" + this.username + "&password=" + this.Password + "&grant_type=password&client_id=" + CommonService.ClientId + "&client_secret=" + CommonService.ClientSecret;
            this.userService.getAuth2AccessToken(this.commonService.apiDevEndpoint + '/token', data).subscribe((result: any) => {
              this.setSession(result);
              this.userService.upsertUserActivity("ActiveStatus");
              this.loaderService.processloader = false;
              this.commonService.isTeacherInviteLink = false;
              this.commonService.isFBMCNewUser = false;
              if (response.TermsOfUse) {
                this.setMenu();
              }
              else {
                if (this.activatedRoute.snapshot.queryParams["RedirectUrl"] != null)
                  this.router.navigateByUrl(this.activatedRoute.snapshot.queryParams["RedirectUrl"]);
                else
                  this.router.navigate(['/term-of-service']);
              }
            });
          }
          else {
            var data = "username=" + this.username + "&password=" + this.Password + "&grant_type=password&client_id=" + CommonService.ClientId + "&client_secret=" + CommonService.ClientSecret;
            this.userService.getAuth2AccessToken(this.commonService.apiDevEndpoint + '/token', data).subscribe((result: any) => {
              this.setSession(result);
              this.userService.upsertUserActivity("ActiveStatus");
              this.loaderService.processloader = false;
              this.commonService.isTeacherInviteLink = false;
              this.commonService.isFBMCNewUser = false;
              if (response.TermsOfUse) {
                this.router.navigate(['/select-type']);
              }
              else {
                this.router.navigate(['/term-of-service']);
              }
            });
          }
        }
        else {
          this.loaderService.processloader = false;
          this.toastr.warning("Please confirm your email to login.");
        }
      }
      else {
        this.loaderService.processloader = false;
        this.toastr.error("User login failed. Please try again.");
      }
    });
  }

  setSession(result) {
    localStorage.setItem('access_token', result.access_token);
    localStorage.setItem('expires_at', result.expires_in);
  }

  setMenu() {
    this.commonService.userChatMessage = new BehaviorSubject<boolean>(true);
    if (this.userService.userRole === "Teacher") {
      this.commonService.MenuList = this.commonService.TeacherMenuList;
      if (localStorage.getItem('LessonRoomKey') != null) {
        if (this.activatedRoute.snapshot.queryParams["RedirectUrl"] != null)
          this.router.navigateByUrl(this.activatedRoute.snapshot.queryParams["RedirectUrl"]);
        else
          this.router.navigateByUrl("teacher/lobby");
      }
      else {
        if (this.activatedRoute.snapshot.queryParams["RedirectUrl"] != null)
          this.router.navigateByUrl(this.activatedRoute.snapshot.queryParams["RedirectUrl"]);
        else
          this.router.navigate(['/teacher/dashboard']);
      }
    }
    else if (this.userService.userRole === "Student") {
      this.commonService.MenuList = this.commonService.StudentMenuList;
      let studentId = CommonService.getUser().Student[0].StudentId;
      if (localStorage.getItem('LessonLink') != null) {
        this.userService.get('/lesson/GetAssociatedTeacher', new HttpParams().
          set("studentId", studentId)).subscribe((resultData: any) => {
            this.commonService.associatedTeacherId = resultData;
            this.router.navigate(['/student/schedule/personalsettings']);
          });
      }
      else if (localStorage.getItem('gvlGuid') != null) {
        if (this.activatedRoute.snapshot.queryParams["RedirectUrl"] != null)
          this.router.navigateByUrl(this.activatedRoute.snapshot.queryParams["RedirectUrl"]);
        else
          this.router.navigate(['/student/guidedvideofeedback/' + localStorage.getItem('gvlGuid')]);
      }
      else if (localStorage.getItem('LessonRoomKey') != null) {
        if (this.activatedRoute.snapshot.queryParams["RedirectUrl"] != null)
          this.router.navigateByUrl(this.activatedRoute.snapshot.queryParams["RedirectUrl"]);
        else
          this.router.navigateByUrl("student/lobby");
      }
      else {
        this.getStudentProfileCompletionData();
      }
    }
  }

  userSignUp() {
    if (this.userService.userRole != "Role") {
      this.isSignUpSubmitFlag = true;
      if (this.signupform.valid && !this.isUserExists && !this.isPwdMismatch) {
        this.isSignUpProcessing = true;
        this.saveUserProfileInfo();
      }
    }
    else {
      this.toastr.warning("Please select user type.");
      return;
    }

    if (this.userService.user.FirstName === '') {
      this.toastr.error("Please enter valid name.");
      return;
    }

    // if (this.activatedRoute.snapshot.params["mobile"] == "mobile") {
    //   let androidCalled = this.activatedRoute.snapshot.queryParams["androidCalled"] == 'true' ? true : false;
    //   this.window.mobileStartLesson(androidCalled, null, this.userService.user.Email, this.userService.user.Password, this.userService.userRole
    //     , this.userService.user.FirstName);
    // }

  }

  isUserExisting() {
    if (this.userService.user.Email != null && this.userService.user.Email != '') {
      this.userService.get('/user/IsUserDataExists', new HttpParams().set('email', this.userService.user.Email).
        set('selection', this.userService.userRole)).subscribe((response: any) => {
          if (response.status === 200) {
            this.isUserExists = response.result;
          }
          else if (response.status === 400) {
            this.toastr.error("User login failed. Please try again.");
          }
        });
    }
  }

  saveUserProfileInfo() {
    this.userService.user.UserGUID = "auth2|" + Guid.newGuid();
    this.userService.user.IsTeacher = this.userService.userRole === 'Teacher' ? 1 : 0;
    this.userService.user.IsStudent = this.userService.userRole === 'Student' ? 1 : 0;
    if (this.userService.user.IsTeacher === 1) {
      this.userService.user.Teacher = [{
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
      }];
      this.userService.user.Student = [];
    }

    if (this.userService.user.IsStudent === 1) {
      this.userService.user.Student = [{
        StudentId: 0,
        UserId: 0,
        ImageURL: null,
        CreatedOn: new Date(),
        ModifiedOn: null
      }];
      this.userService.user.Teacher = [];
    }

    this.userService.user.IsUserSignUp = true;
    this.loaderService.processloader = true;
    if (localStorage.getItem('InviteGuid') != null && localStorage.getItem('UserType') === "Student") {
      let inviteId = localStorage.getItem('InviteGuid');
      this.userService.get('/user/IsInviteExists', new HttpParams().set("userId", inviteId)
        .set("email", this.userService.user.Email)).subscribe((resultData: any) => {
          if (resultData)
            this.userService.user.EmailConfirmationFlag = true;
          this.insertUserSignUpData();
        });
    }
    else {
      this.insertUserSignUpData();
    }
  }

  insertUserSignUpData() {
    let isMobile = window.location.href.includes('#/login/mobile') ? "true" : "false";
    let androidCalled = this.activatedRoute.snapshot.queryParams["androidCalled"] == 'true' ? true : false;
    if (this.cookieService.get('analyticsData') != null && this.cookieService.get('analyticsData') != undefined &&
      this.cookieService.get('analyticsData') != "") {
      let utmData = JSON.parse(this.cookieService.get('analyticsData'));
      this.userService.user.utm_source = (utmData.utm_source != null && utmData.utm_source != undefined) ? utmData.utm_source : "";
      this.userService.user.utm_medium = (utmData.utm_medium != null && utmData.utm_medium != undefined) ? utmData.utm_medium : "";
      this.userService.user.utm_campaign = (utmData.utm_campaign != null && utmData.utm_campaign != undefined) ? utmData.utm_campaign : "";
      this.userService.user.SourceCode = (utmData.sourcecode != null && utmData.sourcecode != undefined) ? utmData.sourcecode : "";
    }
    if (this.commonService.isFBMCNewUser) {
      this.userService.user.LessonGuid = localStorage.getItem("gvlGuid");
    }
    this.userService.post('/user/InsertUserSignUpData', this.userService.user, new HttpParams().set('isMobile', isMobile).
      set('isFBMC', this.commonService.isFBMCNewUser.toString())).subscribe((response: any) => {
        if (response.status === 200) {
          this.cookieService.deleteAll();
          if (isMobile == "true")
            this.loaderService.processloader = false;
          response.result.IsUserSignUp = false;
          CommonService.userZone = response.result.TimeZone;
          this.username = this.userService.user.Email;
          this.Password = this.userService.user.Password;
          if (isMobile == "false")
            this.isSignUpFlag = true;
          localStorage.setItem('userData', JSON.stringify(response.result));
          let userData = response.result;
          if (localStorage.getItem('ShareLessonGuid') != null) {
            let shareLessonId = localStorage.getItem('ShareLessonGuid');
            let userId = userData.UserId;
            this.userService.post('/lesson/AssociateLessonsToUsers', null, new HttpParams().set("lessonGuid", shareLessonId)
              .set("userId", userId)).subscribe((resultData: any) => {
                localStorage.removeItem('ShareLessonGuid');
                if (!resultData) {
                  this.toastr.warning("Sorry, this lesson is created by the same user. So lesson assign to this user is not possible.");
                }
              });
          }
          else if (localStorage.getItem('ShareSongGuid') != null) {
            let shareSongId = localStorage.getItem('ShareSongGuid');
            let userId = userData.UserId;
            this.userService.post('/song/AssociateSongToUser', null, new HttpParams().set("songGuid", shareSongId)
              .set("userId", userId)).subscribe((resultData: any) => {
                localStorage.removeItem('ShareSongGuid');
                if (!resultData) {
                  this.toastr.warning("Sorry, this song is created by the same user. So song assign to this user is not possible.");
                }
              });
          }
          else if (localStorage.getItem('ShareExerciseGuid') != null) {
            let shareExerciseId = localStorage.getItem('ShareExerciseGuid');
            let userId = userData.UserId;
            this.userService.post('/planner/AssociateExercisesToUsers', null, new HttpParams().set("exerciseGuid", shareExerciseId)
              .set("userId", userId)).subscribe((resultData: any) => {
                localStorage.removeItem('ShareExerciseGuid');
                if (!resultData) {
                  this.toastr.warning("Sorry, this exercise is created by the same user as a tecaher. So exercise assign to this user is not possible.");
                }
              });
          }
          else if (localStorage.getItem('ShareVideoGuid') != null) {
            let shareVideoId = localStorage.getItem('ShareVideoGuid');
            let userId = userData.UserId;
            this.userService.post('/video/AssociateVideoToUsers', null, new HttpParams().set("videoGuid", shareVideoId)
              .set("userId", userId)).subscribe((resultData: any) => {
                localStorage.removeItem('ShareVideoGuid');
                if (!resultData) {
                  this.toastr.warning("Sorry, this video is created by the same user as a tecaher. So video assign to this user is not possible.");
                }
              });
          }
          if (((userData.IsTeacher === 1) && (userData.IsStudent === 0)) ||
            ((userData.IsTeacher === 0) && (userData.IsStudent === 1))) {
            if (!userData.EmailConfirmationFlag) {
              this.isSignUpFlag = true;
            }
            else {
              this.isSignUpFlag = false;
            }
            if (userData.IsTeacher === 1) {
              localStorage.setItem('UserType', "Teacher");
              this.commonService.userProfilePic = userData.Teacher[0].ImageURL;
              localStorage.setItem("userImageUrl", userData.Teacher[0].ImageURL);
            }
            else if (userData.IsStudent === 1) {
              localStorage.setItem('UserType', "Student");
              this.commonService.userProfilePic = userData.Student[0].ImageURL;
              localStorage.setItem("userImageUrl", userData.Student[0].ImageURL);
              let studentId = userData.Student[0].StudentId;
              if (localStorage.getItem('LessonLink') != null && localStorage.getItem('UserType') === "Student") {
                let linkId = localStorage.getItem('LessonLink');
                this.userService.post('/user/CreateTeacherStudentRelationship', null, new HttpParams().set("linkId", linkId)
                  .set("studentId", studentId)).subscribe((resultData: any) => {
                    localStorage.setItem('associatedTeacher', resultData);
                  });
              }
              else if (localStorage.getItem('InviteGuid') != null && localStorage.getItem('UserType') === "Student") {
                let inviteId = localStorage.getItem('InviteGuid');
                this.userService.post('/user/CreateTeacherStudentAssociation', null, new HttpParams().set("userId", inviteId)
                  .set("studentId", studentId).set("studentEmail", this.username)).subscribe((resultData: any) => {
                  });
              }
            }
            if (isMobile == "false") {
              var data = "username=" + userData.Email + "&password=" + userData.Password + "&grant_type=password&client_id=" +
                CommonService.ClientId + "&client_secret=" + CommonService.ClientSecret;
              this.userService.getAuth2AccessToken(this.commonService.apiDevEndpoint + '/token', data).subscribe((result: any) => {
                this.setSession(result);
                this.userService.upsertUserActivity("ActiveStatus");
                this.loaderService.processloader = false;
                this.commonService.isTeacherInviteLink = false;
                this.commonService.isFBMCNewUser = false;
                if (userData.EmailConfirmationFlag) {
                  if (userData.TermsOfUse) {
                    if (localStorage.getItem('LessonRoomKey') != null) {
                      this.router.navigate(["/student/lobby"]);
                    }
                    else {
                      this.getStudentProfileCompletionData();
                    }
                  }
                  else {
                    this.router.navigate(['/term-of-service']);
                  }
                }
              });
            }
          }
          else if ((userData.IsTeacher === 1) && (userData.IsStudent === 1)) {
            if (userData.EmailConfirmationFlag) {
              this.isSignUpFlag = false;
              var data = "username=" + userData.Email + "&password=" + userData.Password + "&grant_type=password&client_id=" + CommonService.ClientId + "&client_secret=" + CommonService.ClientSecret;
              this.userService.getAuth2AccessToken(this.commonService.apiDevEndpoint + '/token', data).subscribe((result: any) => {
                this.setSession(result);
                this.userService.upsertUserActivity("ActiveStatus");
                this.loaderService.processloader = false;
                this.commonService.isTeacherInviteLink = false;
                this.commonService.isFBMCNewUser = false;
                if (userData.TermsOfUse) {
                  this.router.navigate(['/select-type']);
                }
                else {
                  this.router.navigate(['/term-of-service']);
                }
              });
            }
            else {
              this.isSignUpFlag = true;
              this.loaderService.processloader = false;
            }
          }
          if (isMobile == "true")
            this.window.mobileStartLesson(androidCalled, 'signupsuccessfully', null, null);
        }
        else if (response.status === 400) {
          this.window.mobileStartLesson(androidCalled, 'signupfailed', null, null);
          this.loaderService.processloader = false;
          this.toastr.error("User login failed. Please try again.");
          this.isSignUpProcessing = false;
        }
      });
  }

  saveSocialLoginUserProfileInfo(userData, isSignUp = false, linkedin = false) {
    if (linkedin) {
      this.userService.user.UserGUID = userData.id;
      this.userService.user.Email = userData.emailAddress;
      this.userService.user.FirstName = userData.firstName;
      this.userService.user.LastName = userData.lastName;
    }
    else {
      this.userService.user.UserGUID = userData.id;
      this.userService.user.Email = userData.email;
      this.userService.user.FirstName = userData.name.split(' ')[0];
      this.userService.user.LastName = userData.name.split(' ')[1];
    }

    if (isSignUp) {
      this.userService.user.IsTeacher = this.userService.userRole === 'Teacher' ? 1 : 0;
      this.userService.user.IsStudent = this.userService.userRole === 'Student' ? 1 : 0;
    }

    if (!linkedin) {
      if (isSignUp) {
        if (this.userService.user.IsTeacher === 1) {
          this.userService.user.Teacher[0].ImageURL = userData.image;
          this.userService.user.Student = [];
        }
        else if (this.userService.user.IsStudent === 1) {
          this.userService.user.Student[0].ImageURL = userData.image;
          this.userService.user.Teacher = [];
        }
      }
      else {
        this.userService.user.ProfileImageUrl = userData.image;
      }
    }

    //set userId as password
    this.userService.user.Password = userData.id;
    this.userService.user.IsUserSignUp = isSignUp;
    this.loaderService.processloader = true;
    if (this.cookieService.get('analyticsData') != null && this.cookieService.get('analyticsData') != undefined &&
      this.cookieService.get('analyticsData') != "") {
      let utmData = JSON.parse(this.cookieService.get('analyticsData'));
      this.userService.user.utm_source = (utmData.utm_source != null && utmData.utm_source != undefined) ? utmData.utm_source : "";
      this.userService.user.utm_medium = (utmData.utm_medium != null && utmData.utm_medium != undefined) ? utmData.utm_medium : "";
      this.userService.user.utm_campaign = (utmData.utm_campaign != null && utmData.utm_campaign != undefined) ? utmData.utm_campaign : "";
    }
    if (this.commonService.isFBMCNewUser) {
      this.userService.user.LessonGuid = localStorage.getItem("gvlGuid");
    }
    this.userService.post('/user/InsertUserSignUpData', this.userService.user, new HttpParams().set('isSocialLogin', 'true').
      set('isFBMC', this.commonService.isFBMCNewUser.toString())).subscribe((result: any) => {
        if (result.result != null) {
          this.cookieService.deleteAll();
          this.isSignUpFlag = false;
          var response = result.result;
          response.IsUserSignUp = false;
          // set user global TimeZone
          CommonService.userZone = response.TimeZone;
          localStorage.setItem('userData', JSON.stringify(response));
          if (localStorage.getItem('ShareLessonGuid') != null) {
            let shareLessonId = localStorage.getItem('ShareLessonGuid');
            let userId = response.UserId;
            this.userService.post('/lesson/AssociateLessonsToUsers', null, new HttpParams().set("lessonGuid", shareLessonId)
              .set("userId", userId)).subscribe((resultData: any) => {
                localStorage.removeItem('ShareLessonGuid');
                if (!resultData) {
                  this.toastr.warning("Sorry, this lesson is created by the same user as a tecaher. So lesson assign to this user is not possible.");
                }
              });
          }
          else if (localStorage.getItem('ShareSongGuid') != null) {
            let shareSongId = localStorage.getItem('ShareSongGuid');
            let userId = response.UserId;
            this.userService.post('/song/AssociateSongToUser', null, new HttpParams().set("songGuid", shareSongId)
              .set("userId", userId)).subscribe((resultData: any) => {
                localStorage.removeItem('ShareSongGuid');
                if (!resultData) {
                  this.toastr.warning("Sorry, this song is created by the same user. So song assign to this user is not possible.");
                }
              });
          }
          else if (localStorage.getItem('ShareExerciseGuid') != null) {
            let shareExerciseId = localStorage.getItem('ShareExerciseGuid');
            let userId = response.UserId;
            this.userService.post('/planner/AssociateExercisesToUsers', null, new HttpParams().set("exerciseGuid", shareExerciseId)
              .set("userId", userId)).subscribe((resultData: any) => {
                localStorage.removeItem('ShareExerciseGuid');
                if (!resultData) {
                  this.toastr.warning("Sorry, this exercise is created by the same user as a tecaher. So exercise assign to this user is not possible.");
                }
              });
          }
          else if (localStorage.getItem('ShareVideoGuid') != null) {
            let shareVideoId = localStorage.getItem('ShareVideoGuid');
            let userId = userData.UserId;
            this.userService.post('/video/AssociateVideoToUsers', null, new HttpParams().set("videoGuid", shareVideoId)
              .set("userId", userId)).subscribe((resultData: any) => {
                localStorage.removeItem('ShareVideoGuid');
                if (!resultData) {
                  this.toastr.warning("Sorry, this video is created by the same user as a tecaher. So video assign to this user is not possible.");
                }
              });
          }
          if (((response.IsTeacher === 1) && (response.IsStudent === 0)) ||
            ((response.IsStudent === 1) && (response.IsTeacher === 0))) {
            if (response.IsTeacher === 1) {
              localStorage.setItem("UserType", "Teacher");
              this.commonService.userProfilePic = response.Teacher[0].ImageURL;
              localStorage.setItem("userImageUrl", response.Teacher[0].ImageURL);
            }
            else if (response.IsStudent === 1) {
              localStorage.setItem("UserType", "Student");
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
                  .set("studentId", studentId).set("studentEmail", userData.emailAddress).
                  set('isSocialLogin', 'true')).subscribe((resultData: any) => {
                  });
              }
              this.commonService.userProfilePic = response.Student[0].ImageURL;
              localStorage.setItem("userImageUrl", response.Student[0].ImageURL);
            }
            localStorage.removeItem('userName');
            localStorage.removeItem('password');
            var email = userData.email == undefined ? userData.emailAddress : userData.email;
            var data = "username=" + email + "&password=" + userData.id + "&grant_type=password&client_id=" + CommonService.ClientId + "&client_secret=" + CommonService.ClientSecret;
            this.userService.getAuth2AccessToken(this.commonService.apiDevEndpoint + '/token', data).subscribe((result: any) => {
              this.setSession(result);
              this.userService.upsertUserActivity("ActiveStatus");
              this.loaderService.processloader = false;
              this.commonService.isTeacherInviteLink = false;
              this.commonService.isFBMCNewUser = false;
              if (response.TermsOfUse) {
                this.setMenu();
              }
              else {
                this.router.navigate(['/term-of-service']);
              }
            });
          }
          else if ((response.IsTeacher === 1) && (response.IsStudent === 1)) {
            var email = userData.email == undefined ? userData.emailAddress : userData.email;
            var data = "username=" + email + "&password=" + userData.id + "&grant_type=password&client_id=" + CommonService.ClientId + "&client_secret=" + CommonService.ClientSecret;
            this.userService.getAuth2AccessToken(this.commonService.apiDevEndpoint + '/token', data).subscribe((result: any) => {
              this.setSession(result);
              this.userService.upsertUserActivity("ActiveStatus");
              this.loaderService.processloader = false;
              this.commonService.isTeacherInviteLink = false;
              this.commonService.isFBMCNewUser = false;
              if (response.TermsOfUse) {
                this.router.navigate(['/select-type']);
              }
              else {
                this.router.navigate(['/term-of-service']);
              }
            });
          }
        }
        else {
          this.loaderService.processloader = false;
          this.toastr.error("User login failed. Please try again.");
        }
      });
  }

  signInWithInstagram() {
    if (!this.isLoginState) {
      if (this.userService.userRole === 'Role') {
        this.toastr.error("Please select a user type.");
        return;
      }
    }
    if (this.activatedRoute.snapshot.params["mobile"] == "mobile") {
      let androidCalled = this.activatedRoute.snapshot.queryParams["androidCalled"] == 'true' ? true : false;
      if (!this.isLoginState)
        this.window.mobileStartLesson(androidCalled, 'instagram', null, null);
      else
        this.window.mobileStartLesson(androidCalled, 'instagram', this.userService.user.Email, this.userService.user.Password, this.userService.userRole
          , this.userService.user.FirstName);
    }
  }

  signInWithGoogle(isSignUp: boolean): void {
    if (!this.isLoginState) {
      if (this.userService.userRole === 'Role') {
        this.toastr.error("Please select a user type.");
        return;
      }
    }
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(
      (userData) => {
        if (isSignUp) {
          if (this.userService.userRole === 'Role') {
            this.toastr.error("Please select a user type.");
          }
          else {
            this.saveSocialLoginUserProfileInfo(userData, isSignUp);
          }
        }
        else {
          this.userService.get('/user/IsSocialUserExists', new HttpParams().set('email', userData.email).
            set('userGuid', userData.id)).subscribe((response: any) => {
              if (response.result)
                this.saveSocialLoginUserProfileInfo(userData, isSignUp);
              else {
                this.toastr.warning("User does not exist. Please signup to continue.");
                this.userService.userRole = "Role";
                this.userService.user.Email = "";
                this.userService.user.Password = "";
                this.setActiveTab();
              }
            });
        }
      });

    if (this.activatedRoute.snapshot.params["mobile"] == "mobile") {
      let androidCalled = this.activatedRoute.snapshot.queryParams["androidCalled"] == 'true' ? true : false;
      if (!this.isLoginState)
        this.window.mobileStartLesson(androidCalled, 'google', null, null);
      else
        this.window.mobileStartLesson(androidCalled, 'google', this.userService.user.Email, this.userService.user.Password, this.userService.userRole
          , this.userService.user.FirstName);
    }
  }


  signInWithFB(isSignUp: boolean): void {
    if (!this.isLoginState) {
      if (this.userService.userRole === 'Role') {
        this.toastr.error("Please select a user type.");
        return;
      }
    }
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then(
      (userData) => {
        if (isSignUp) {
          if (this.userService.userRole === 'Role') {
            this.toastr.error("Please select a user type.");
          }
          else {
            this.saveSocialLoginUserProfileInfo(userData, isSignUp);
          }
        }
        else {
          this.userService.get('/user/IsSocialUserExists', new HttpParams().set('email', userData.email).
            set('userGuid', userData.id)).subscribe((response: any) => {
              if (response.result)
                this.saveSocialLoginUserProfileInfo(userData, isSignUp);
              else {
                this.toastr.warning("User does not exist. Please signup to continue.");
                this.userService.userRole = "Role";
                this.userService.user.Email = "";
                this.userService.user.Password = "";
                this.setActiveTab();
              }
            });
        }
      });

    if (this.activatedRoute.snapshot.params["mobile"] == "mobile") {
      let androidCalled = this.activatedRoute.snapshot.queryParams["androidCalled"] == 'true' ? true : false;
      if (!this.isLoginState)
        this.window.mobileStartLesson(androidCalled, 'facebook', null, null);
      else
        this.window.mobileStartLesson(androidCalled, 'facebook', this.userService.user.Email, this.userService.user.Password, this.userService.userRole
          , this.userService.user.FirstName);
    }
  }

  signOut(): void {
    this.authService.signOut();
  }

  setUserType(): void {
    if (this.userService.userRole != "Role") {
      localStorage.setItem("UserType", this.userService.userRole);
    }
    else {
      this.toastr.warning('Please select user type.');
    }
  }

  // init linkDin
  initLinkdin() {
    window['onLinkedInLoad'] = () => this.ngZone.run(() => this.onLinkedInLoad());
    window['displayProfiles'] = (profiles) => this.ngZone.run(() => this.displayProfiles(profiles));
    window['displayProfilesErrors'] = (error) => this.ngZone.run(() => this.displayProfilesErrors(error));
    var linkedIn = document.createElement("script");
    linkedIn.type = "text/javascript";
    linkedIn.src = "https://platform.linkedin.com/in.js";
    linkedIn.innerHTML = "\n" +
      "api_key: 86glkk3tc3v48l\n" +
      "authorize: true\n" +
      "onLoad: onLinkedInLoad\n" +
      "scope: r_basicprofile r_emailaddress";
    document.head.appendChild(linkedIn);
  }

  public onLinkedInLoad() {
    IN.Event.on(IN, "auth", this.onLinkedInProfile);
  }

  public onLinkedInProfile() {
    IN.User.logout();
    IN.API.Raw("/people/~:(id,email-address,first-name,last-name,formatted-name)").result(this.displayProfiles).error(this.displayProfilesErrors);
  }

  public displayProfiles(profiles) {
    var userData = { id: '', emailAddress: '', firstName: '', lastName: '' };
    userData.id = profiles.id;
    userData.emailAddress = profiles.emailAddress;
    userData.firstName = profiles.firstName;
    userData.lastName = profiles.lastName;
    if (this.isLinkedInSignup) {
      if (this.userService.userRole === 'Role') {
        this.toastr.error("Please select a user type.");
      }
      else {
        this.saveSocialLoginUserProfileInfo(userData, true, true);
      }
    }
    else {
      this.userService.get('/user/IsSocialUserExists', new HttpParams().set('email', profiles.emailAddress).
        set('userGuid', profiles.id)).subscribe((response: any) => {
          if (response.result)
            this.saveSocialLoginUserProfileInfo(userData, this.isLinkedInSignup, true);
          else {
            this.toastr.warning("User does not exist. Please signup to continue.");
            this.userService.userRole = "Role";
            this.userService.user.Email = "";
            this.userService.user.Password = "";
            this.setActiveTab();
          }
        });
    }
  }

  public displayProfilesErrors(error) {
    console.debug(error);
  }

  //Invoke login window with button
  signInWithLinkedIn(isSignUp: boolean) {
    if (!this.isLoginState) {
      if (this.userService.userRole === 'Role') {
        this.toastr.error("Please select a user type.");
        return;
      }
    }
    if (this.activatedRoute.snapshot.params["mobile"] == "mobile") {
      let androidCalled = this.activatedRoute.snapshot.queryParams["androidCalled"] == 'true' ? true : false;
      if (!this.isLoginState)
        this.window.mobileStartLesson(androidCalled, 'linkedin', null, null);
      else
        this.window.mobileStartLesson(androidCalled, 'linkedin', this.userService.user.Email, this.userService.user.Password, this.userService.userRole
          , this.userService.user.FirstName);
    }

    this.isLinkedInSignup = isSignUp;
    if (this.userService.userRole === 'Role' && isSignUp) {
      this.toastr.error("Please select a user type.");
    }
    else {
      IN.User.authorize(function () {
        console.log('authorize callback');
      });
    }
  }
  //========== end linkDian ========= 


  signTwitter(isSignUp: boolean) {
    if (!this.isLoginState) {
      if (this.userService.userRole === 'Role') {
        this.toastr.error("Please select a user type.");
        return;
      }
    }
    if (this.activatedRoute.snapshot.params["mobile"] == "mobile") {
      let androidCalled = this.activatedRoute.snapshot.queryParams["androidCalled"] == 'true' ? true : false;
      if (!this.isLoginState)
        this.window.mobileStartLesson(androidCalled, 'twitter', null, null);
      else
        this.window.mobileStartLesson(androidCalled, 'twitter', this.userService.user.Email, this.userService.user.Password, this.userService.userRole
          , this.userService.user.FirstName);
    }

    let tempStr: string;
    this.twitterService.onSignIn().then(function (response) {
      console.log('twiter - Response');
      console.log(response);
      tempStr = response["_body"];
      let a = tempStr.indexOf("&");
      let token = tempStr.substr(0, a);
      window.location.href = "https://api.twitter.com/oauth/authenticate?" + token;
    });
  }

  setActiveTab() {
    let idLogin = '#tabLogin-link';
    let idSignup = '#tabSignup-link';
    let idLoginTab = '#tabLogin';
    let idSignupTab = '#tabSignup';
    $('.tab-container ul').find(idLogin).parent().removeClass('active');
    $(idLogin).removeClass('active');
    $('.tab-container ul').find(idSignup).parent().addClass('active');
    $(idSignup).addClass('active');
    $(idLoginTab).removeClass('active');
    $(idSignupTab).addClass('active');
  }

  getStudentProfileCompletionData() {
    this.loaderService.processloader = true;
    let userData = CommonService.getUser();
    this.userService.get('/sProfile/GetStudentProfileCompletionStatus', new HttpParams().
      set('profileStatusId', userData.StudentProfileStatusId)).subscribe((result: any) => {
        this.loaderService.processloader = false;
        if (!(result.QuestionnaireFlag) && userData.IsQuizRequired) {
          this.router.navigateByUrl('/student/questionnaire');
        }
        else if (!(result.VideoFlag) && userData.IsVideoEvalRequired) {
          this.router.navigateByUrl('/student/guidedvideofeedback/add-video');
        }
        else {
          this.router.navigateByUrl('/student/dashboard');
        }
      });
  }
}

class Guid {
  static newGuid() {
    return 'xadx4xcxyxxyxszxy'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 10 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(10);
    });
  }
}
