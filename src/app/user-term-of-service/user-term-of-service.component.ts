import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonService } from '../common/common.service';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpParams, HttpClient } from '@angular/common/http';
import { LoaderService } from '../services/loader.service';
import * as moment from 'moment';

@Component({
  selector: 'app-user-term-of-service',
  templateUrl: './user-term-of-service.component.html',
  styleUrls: ['./user-term-of-service.component.scss']
})

export class UserTermOfServiceComponent implements OnInit {
  userData: any;
  window: any;
  constructor(private userService: UserService, private mScrollbarService: MalihuScrollbarService,
    private commonService: CommonService, private router: Router, private loaderService: LoaderService,
    public http: HttpClient,private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.window = window;
    this.userData = CommonService.getUser()
  }

  ngAfterViewInit() {
    this.mScrollbarService.initScrollbar('#terms_content', { axis: 'y', theme: 'dark-thick', scrollButtons: { enable: true } });
  }

  proceedToDashboard() {
    this.loaderService.processloader = true;
    this.http.get<{ ip: string }>('https://jsonip.com')
      .subscribe(data => {
        let ipData: any = {
          UserId: this.userData.UserId,
          UserIP: data.ip
        };
        this.userService.post('/user/UpdateUserTermOfUse', ipData, new HttpParams()).subscribe(result => {
          //Check device is mobile or not
          if (this.activatedRoute.snapshot.params["mobile"] == "mobile") {
            let androidCalled = this.activatedRoute.snapshot.queryParams["androidCalled"] == 'true' ? true : false;
            this.window.mobileTermService(androidCalled,true);
          }
          this.loaderService.processloader = false;
          this.userData.TermsOfUse = true;
          this.userData.TermsOfUseIPAddress = data.ip;
          this.userData.TermsOfUseDateSigned = moment.utc(new Date()).format();
          localStorage.setItem('userData', JSON.stringify(this.userData));
          if (this.userData.IsTeacher === 1 && this.userData.IsStudent === 1) {
            this.router.navigate(['/select-type']);
          }
          else {
            this.setMenu()
          }
        })
      })
  }

  setMenu() {
    if (this.userService.userRole === "Teacher") {
      this.commonService.MenuList = this.commonService.TeacherMenuList;
      if (localStorage.getItem('LessonRoomKey') != null) {
        this.router.navigate(["/teacher/lobby"]);
      }
      else {
        this.router.navigate(['/teacher/dashboard']);
      }
    }
    else if (this.userService.userRole === "Student") {
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
            this.getStudentProfileCompletionData();
          }
        });
    }
  }

  getStudentProfileCompletionData() {
    this.loaderService.processloader = true;
    this.userService.get('/sProfile/GetStudentProfileCompletionStatus', new HttpParams().
      set('profileStatusId', this.userData.StudentProfileStatusId)).subscribe((result: any) => {
        this.loaderService.processloader = false;
        if (!(result.QuestionnaireFlag) && this.userData.IsQuizRequired) {
          this.router.navigateByUrl('/student/questionnaire');
        }
        else if (!(result.VideoFlag) && this.userData.IsVideoEvalRequired) {
          this.router.navigateByUrl('/student/guidedvideofeedback/add-video');
        }
        else {
          this.router.navigateByUrl('/student/dashboard');
        }
      });
  }
}
