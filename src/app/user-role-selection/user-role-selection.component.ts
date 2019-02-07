import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { HttpParams } from '../../../node_modules/@angular/common/http';
import { CommonService } from '../common/common.service';
import { BehaviorSubject } from '../../../node_modules/rxjs';
import { Router } from '../../../node_modules/@angular/router';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-user-role-selection',
  templateUrl: './user-role-selection.component.html',
  styleUrls: ['./user-role-selection.component.scss']
})
export class UserRoleSelectionComponent implements OnInit {
  constructor(private userService: UserService, private loader: LoaderService, private commonService: CommonService,
    private router: Router) { }

  ngOnInit() {
    this.userService.user = CommonService.getUser()
    if (this.userService.user === null) {
    }
  }

  userTypeTeacher() {
    this.userService.userRole = 'Teacher';
    this.userService.user.IsTeacher = 1;
    this.userService.user.IsStudent = 0;
    this.userService.user.Student = [];
    localStorage.setItem('UserType', "Teacher");
    if (this.userService.user.Teacher.length === 0) {
      this.userService.get('/teacher/GetTeacherByUserId', new HttpParams().set('userId', this.userService.user.UserId)).subscribe(result => {
        this.userService.user.Teacher[0] = result;
        this.commonService.userProfilePic = this.userService.user.Teacher[0].ImageURL;
        localStorage.setItem("userImageUrl", this.userService.user.Teacher[0].ImageURL);
        this.setMenu();
      });
    }
    else {
      this.commonService.userProfilePic = this.userService.user.Teacher[0].ImageURL;
      localStorage.setItem("userImageUrl", this.userService.user.Teacher[0].ImageURL);
      this.setMenu();
    }
  }

  userTypeStudent() {
    this.userService.userRole = 'Student';
    this.userService.user.IsTeacher = 0;
    this.userService.user.IsStudent = 1;
    this.userService.user.Teacher = [];
    localStorage.setItem('UserType', "Student");
    if (this.userService.user.Student.length === 0) {
      this.userService.get('/student/GetStudentByUserId', new HttpParams().set('userId', this.userService.user.UserId)).subscribe(result => {
        this.userService.user.Student[0] = result;
        this.commonService.userProfilePic = this.userService.user.Student[0].ImageURL;
        localStorage.setItem("userImageUrl", this.userService.user.Student[0].ImageURL);
        this.setMenu();
      });
    }
    else {
      this.commonService.userProfilePic = this.userService.user.Student[0].ImageURL;
      localStorage.setItem("userImageUrl", this.userService.user.Student[0].ImageURL);
      this.setMenu();
    }
  }

  setMenu() {
    localStorage.setItem('userData', JSON.stringify(this.userService.user));
    CommonService.userZone = this.userService.user.TimeZone;
    this.commonService.userChatMessage = new BehaviorSubject<boolean>(true);
    if (this.userService.userRole == "Teacher") {
      this.commonService.MenuList = this.commonService.TeacherMenuList;
      if (localStorage.getItem('LessonRoomKey') != null) {
        this.router.navigate(["/teacher/lobby"]);
      }
      else {
        this.router.navigate(['/teacher/dashboard']);
      }
    }
    else if (this.userService.userRole == "Student") {
      this.commonService.MenuList = this.commonService.StudentMenuList;
      if (localStorage.getItem('LessonLink') != null) {
        this.router.navigate(['/student/schedule/personalsettings']);
      }
      else if (localStorage.getItem('gvlGuid') != null) {
        this.router.navigate(['/student/guidedvideofeedback/' + localStorage.getItem('gvlGuid')]);
      }
      else if (localStorage.getItem('LessonRoomKey') != null) {
        this.router.navigate(["/student/lobby"]);
      }
      else {
        this.getStudentProfileCompletionData();
      }
    }
  }

  getStudentProfileCompletionData() {
    this.loader.processloader = true;
    this.userService.get('/sProfile/GetStudentProfileCompletionStatus', new HttpParams().
      set('profileStatusId', this.userService.user.StudentProfileStatusId)).subscribe((result: any) => {
        this.loader.processloader = false;
        if (!(result.QuestionnaireFlag) && this.userService.user.IsQuizRequired) {
          this.router.navigateByUrl('/student/questionnaire');
        }
        else if (!(result.VideoFlag) && this.userService.user.IsVideoEvalRequired) {
          this.router.navigateByUrl('/student/guidedvideofeedback/add-video');
        }
        else {
          this.router.navigateByUrl('/student/dashboard');
        }
      });
  }
}
