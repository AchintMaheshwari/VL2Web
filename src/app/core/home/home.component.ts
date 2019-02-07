import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CrudService } from '../../services/crud.service';
import { UserService } from '../../services/user.service';
import { HttpParams } from '../../../../node_modules/@angular/common/http';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { BehaviorSubject } from '../../../../node_modules/rxjs';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute, private commonService: CommonService,
    private router: Router, private curdService: CrudService, private userService: UserService,
    private toaster: ToastrService, private loaderService: LoaderService) {
    localStorage.setItem('UserType', 'Role');
  }

  ngOnInit() {
    if (localStorage.getItem('userData') === null || localStorage.getItem('userData') === undefined) {
      localStorage.setItem('userImageUrl', '../assets/images/phonda-pic.jpg');
    }
    this.commonService.isUserTypeDisabled = false;
    if (this.router.url.indexOf('studentscheduling') > -1) {
      localStorage.setItem('LessonLink', this.activatedRoute.snapshot.params["linkId"]);
      localStorage.setItem('UserType', 'Student');
      this.commonService.isUserTypeDisabled = true;
      if (localStorage.getItem('userData') === null || localStorage.getItem('userData') === undefined) {
        this.redirectToLogin();
      }
      else {
        this.commonService.MenuList = this.commonService.StudentMenuList;
        this.router.navigate(['student/schedule/personalsettings']);
      }
    }
    else if (this.router.url.indexOf('teacher-invite') > -1) {
      localStorage.setItem('InviteGuid', this.activatedRoute.snapshot.params["userId"]);
      localStorage.setItem('UserType', 'Student');
      this.commonService.isUserTypeDisabled = true;
      this.commonService.isTeacherInviteLink = true;
      this.redirectToLogin();
    }
    else if (this.router.url.indexOf('lesson-share') > -1) {
      if (localStorage.getItem('userData') === null || localStorage.getItem('userData') === undefined) {
        localStorage.setItem('ShareLessonGuid', this.activatedRoute.snapshot.params["lessonId"]);
        localStorage.setItem('UserType', 'Role');
        this.redirectToLogin();
      }
      else {
        let user = CommonService.getUser();
        this.userService.post('/lesson/AssociateLessonsToUsers', null, new HttpParams().
          set("lessonGuid", this.activatedRoute.snapshot.params["lessonId"]).set("userId", user.UserId)).subscribe((resultData: any) => {
            if (!resultData) {
              this.toaster.warning("Sorry, this lesson is created by the same user. So lesson assign to this user is not possible.");
            }
            if (user.IsStudent === 1) {
              localStorage.setItem('UserType', 'Student');
              this.commonService.MenuList = this.commonService.StudentMenuList;
              this.router.navigate(['/student/lesson-library']);
            }
            else if (user.IsTeacher === 1) {
              localStorage.setItem('UserType', 'Teacher');
              this.commonService.MenuList = this.commonService.TeacherMenuList;
              this.router.navigate(['/teacher/lesson-library']);
            }
          });
      }
    }
    else if (this.router.url.indexOf('song-share') > -1) {
      if (localStorage.getItem('userData') === null || localStorage.getItem('userData') === undefined) {
        localStorage.setItem('ShareSongGuid', this.activatedRoute.snapshot.params["songId"]);
        localStorage.setItem('UserType', 'Role');
        this.redirectToLogin();
      }
      else {
        let user = CommonService.getUser();
        this.userService.post('/song/AssociateSongToUser', null, new HttpParams().
          set("songGuid", this.activatedRoute.snapshot.params["songId"]).set("userId", user.UserId)).subscribe((resultData: any) => {
            if (!resultData) {
              this.toaster.warning("Sorry, this song is created by the same user. So song assign to this user is not possible.");
            }
            if (user.IsStudent === 1) {
              localStorage.setItem('UserType', 'Student');
              this.commonService.MenuList = this.commonService.StudentMenuList;
              this.router.navigate(['/student/song-library']);
            }
            else if (user.IsTeacher === 1) {
              localStorage.setItem('UserType', 'Teacher');
              this.commonService.MenuList = this.commonService.TeacherMenuList;
              this.router.navigate(['/teacher/song-library']);
            }
          });
      }
    }
    else if (this.router.url.indexOf('exercise-share') > -1) {
      if (localStorage.getItem('userData') === null || localStorage.getItem('userData') === undefined) {
        localStorage.setItem('ShareExerciseGuid', this.activatedRoute.snapshot.params["exerciseGuid"]);
        localStorage.setItem('UserType', 'Role');
        this.redirectToLogin();
      }
      else {
        let user = CommonService.getUser();
        this.userService.post('/planner/AssociateExercisesToUsers', null, new HttpParams().
          set("exerciseGuid", this.activatedRoute.snapshot.params["exerciseGuid"]).set("userId", user.UserId)).subscribe((resultData: any) => {
            if (!resultData) {
              this.toaster.warning("Sorry, this exercise is created by the same user. So exercise assign to this user is not possible.");
            }
            if (user.IsStudent === 1) {
              localStorage.setItem('UserType', 'Student');
              this.commonService.MenuList = this.commonService.StudentMenuList;
              this.router.navigate(['/student/exercise-library']);
            }
            else if (user.IsTeacher === 1) {
              localStorage.setItem('UserType', 'Teacher');
              this.commonService.MenuList = this.commonService.TeacherMenuList;
              this.router.navigate(['/teacher/exercise-library']);
            }
          });
      }
    }
    else if (this.router.url.indexOf('video-share') > -1) {
      if (localStorage.getItem('userData') === null || localStorage.getItem('userData') === undefined) {
        localStorage.setItem('ShareVideoGuid', this.activatedRoute.snapshot.params["videoId"]);
        localStorage.setItem('UserType', 'Role');
        this.redirectToLogin();
      }
      else {
        let user = CommonService.getUser();
        this.userService.post('/video/AssociateVideoToUsers', null, new HttpParams().
          set("videoGuid", this.activatedRoute.snapshot.params["videoId"]).set("userId", user.UserId)).subscribe((resultData: any) => {
            if (!resultData) {
              this.toaster.warning("Sorry, this video is created by the same user. So video assign to this user is not possible.");
            }
            if (user.IsStudent === 1) {
              localStorage.setItem('UserType', 'Student');
              this.commonService.MenuList = this.commonService.StudentMenuList;
              this.router.navigate(['/student/video-library']);
            }
            else if (user.IsTeacher === 1) {
              localStorage.setItem('UserType', 'Teacher');
              this.commonService.MenuList = this.commonService.TeacherMenuList;
              this.router.navigate(['/teacher/video-library']);
            }
          });
      }
    }
    else if (this.router.url.indexOf('gvFeedback') > -1) {
      localStorage.setItem('gvlGuid', this.activatedRoute.snapshot.params["lessonGuid"]);
      localStorage.setItem('UserType', 'Student');
      this.loaderService.processloader = true;
      this.curdService.get('/user/IsExistingUser', new HttpParams().set('lessonGuid',
        this.activatedRoute.snapshot.params["lessonGuid"])).subscribe((response: any) => {
          this.loaderService.processloader = false;
          if (response != null) {
            this.commonService.fbUserName = response.Email;
            if (response.IsExists) {
              if (localStorage.getItem('userData') === null || localStorage.getItem('userData') === undefined) {
                this.redirectToLogin();
              }
              else {
                let user = CommonService.getUser();
                if (user.IsStudent === 1) {
                  this.commonService.MenuList = this.commonService.StudentMenuList;
                  this.router.navigate(['/student/guidedvideofeedback/' + localStorage.getItem('gvlGuid')]);
                }
                else if (user.IsTeacher === 1) {
                  this.commonService.MenuList = this.commonService.TeacherMenuList;
                  this.router.navigate(['/teacher/dashboard']);
                }
              }
            }
            else {
              this.commonService.isUserTypeDisabled = true;
              this.commonService.isFBMCNewUser = true;
              this.redirectToLogin();
            }
          }
          else {
            this.toaster.error("The lesson you are looking for do not exist. Please check the url again.")
            this.router.navigate(['/login']);
          }
        })
    }
    else if (this.router.url.indexOf('room') > -1) {
      localStorage.setItem('LessonRoomKey', this.activatedRoute.snapshot.params["roomKey"]);
      if (localStorage.getItem('userData') === null || localStorage.getItem('userData') === undefined) {
        this.redirectToLogin();
      }
      else {
        let user = CommonService.getUser();
        if (user.IsTeacher === 1) {
          localStorage.setItem('UserType', 'Teacher');
        }
        else if (user.IsStudent === 1) {
          localStorage.setItem('UserType', 'Student');
        }
        let role = localStorage.getItem('UserType');
        if (role === "Teacher") {
          this.commonService.MenuList = this.commonService.TeacherMenuList;
          this.router.navigateByUrl("teacher/lobby");
        }
        else if (role === "Student"){
          this.commonService.MenuList = this.commonService.StudentMenuList;
          this.router.navigateByUrl("student/lobby");
        }
      }
    }
    else if (this.router.url.indexOf('confirm-account') > -1) {
      this.loaderService.processloader = true;
      this.curdService.post('/user/ConfirmUserAccount', null,
        new HttpParams().set('userGuid', this.activatedRoute.snapshot.params["userId"])).subscribe((response: any) => {
          this.loaderService.processloader = false;
          if (response != null) {
            if (response.IsAlreadyConfirmed) {
              this.toaster.warning('Your email is already verified. Please login to continue!');
              this.router.navigate(['/login']);
            }
            else {
              this.toaster.success('You successfully verified your email !');
              if (localStorage.getItem('userData') === null || localStorage.getItem('userData') === undefined) {
                if (response.IsTeacher === 1) {
                  localStorage.setItem('UserType', 'Teacher');
                }
                else if (response.IsStudent === 1) {
                  localStorage.setItem('UserType', 'Student');
                }
                this.userService.userRole = localStorage.getItem('UserType');
                this.userLogin(response);
              }
              else {
                if (response.IsTeacher === 1) {
                  localStorage.setItem('UserType', 'Teacher');
                }
                else if (response.IsStudent === 1) {
                  localStorage.setItem('UserType', 'Student');
                }
                this.userService.userRole = localStorage.getItem('UserType');
                if (response.TermsOfUse) {
                  this.setMenu(response);
                }
                else {
                  this.router.navigate(['/term-of-service']);
                }
              }
            }
          }
          else {
            this.toaster.error('You email could not be verified. Please try again.');
          }
        })
    }
    else if (this.router.url.indexOf('socialshare') > -1) {
      localStorage.setItem('UserType', 'Student');
      this.commonService.isUserTypeDisabled = false;
      this.commonService.isSocialShare = true;
      this.redirectToLogin();
    }
    else {
      this.redirectToLogin();
    }
  }

  redirectToLogin() {
    var fragment = this.activatedRoute.snapshot.fragment;
    if (fragment == null) {
      if (this.commonService.isFBMCNewUser) {
        this.router.navigate(['/signup']);
      }
      else
        this.router.navigate(['/login']);
    }
  }

  userLogin(response: any) {
    CommonService.userZone = response.TimeZone;
    localStorage.setItem('userData', JSON.stringify(response));
    if (((response.IsTeacher === 1) && (response.IsStudent === 0)) ||
      ((response.IsTeacher === 0) && (response.IsStudent === 1))) {
      if (response.IsTeacher === 1) {
        localStorage.setItem('UserType', "Teacher");
        this.commonService.userProfilePic = response.Teacher[0].ImageURL;
        localStorage.setItem("userImageUrl", response.Teacher[0].ImageURL);
      }
      else if (response.IsStudent === 1) {
        localStorage.setItem('UserType', "Student");
        this.commonService.userProfilePic = response.Student[0].ImageURL;
        localStorage.setItem("userImageUrl", response.Student[0].ImageURL);
      }
      var data = "username=" + response.Email + "&password=" + response.Password + "&grant_type=password&client_id=" + CommonService.ClientId + "&client_secret=" + CommonService.ClientSecret;
      this.userService.getAuth2AccessToken(this.commonService.apiDevEndpoint + '/token', data).subscribe((result: any) => {
        this.setSession(result);
        this.userService.upsertUserActivity("ActiveStatus");
        if (response.TermsOfUse) {
          this.setMenu(response);
        }
        else {
          this.router.navigate(['/term-of-service']);
        }
      });
    }
    else {
      var data = "username=" + response.Email + "&password=" + response.Password + "&grant_type=password&client_id=" + CommonService.ClientId + "&client_secret=" + CommonService.ClientSecret;
      this.userService.getAuth2AccessToken(this.commonService.apiDevEndpoint + '/token', data).subscribe((result: any) => {
        this.setSession(result);
        this.userService.upsertUserActivity("ActiveStatus");
        if (response.TermsOfUse) {
          this.router.navigate(['/select-type']);
        }
        else {
          this.router.navigate(['/term-of-service']);
        }
      });
    }
  }

  setSession(result) {
    localStorage.setItem('access_token', result.access_token);
    localStorage.setItem('expires_at', result.expires_in);
  }

  setMenu(data: any) {
    this.commonService.userChatMessage = new BehaviorSubject<boolean>(true);
    if (data.IsTeacher === 1) {
      localStorage.setItem('UserType', "Teacher");
      this.commonService.MenuList = this.commonService.TeacherMenuList;
      if (localStorage.getItem('LessonRoomKey') != null) {
        this.router.navigateByUrl("teacher/lobby");
      }
      else {
        this.router.navigate(['/teacher/dashboard']);
      }
    }
    else if (data.IsStudent === 1) {
      localStorage.setItem('UserType', "Student");
      this.commonService.MenuList = this.commonService.StudentMenuList;
      let studentId = CommonService.getUser().Student[0].StudentId;
      this.userService.get('/lesson/GetAssociatedTeacher', new HttpParams().
        set("studentId", studentId)).subscribe((resultData: any) => {
          this.commonService.associatedTeacherId = resultData;
          if (localStorage.getItem('LessonLink') != null) {
            this.router.navigate(['/student/schedule/personalsettings']);
          }
          else if (localStorage.getItem('gvlGuid') != null) {
            this.router.navigate(['/student/guidedvideofeedback/' + localStorage.getItem('gvlGuid')]);
          }
          else if (localStorage.getItem('LessonRoomKey') != null) {
            this.router.navigateByUrl("student/lobby");
          }
          else {
            this.router.navigate(['/student/dashboard']);
          }
        });
    }
  }
}
