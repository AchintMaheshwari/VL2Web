import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../../common/common.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { StudentService } from '../../services/student.service';
import { HttpParams } from '@angular/common/http';
import { TeacherService } from '../../services/teacher.service';
import { IChatController } from '../../ng-chat/core/chat-controller';
import { User } from '../../ng-chat/core/user';
import { ToastrService } from 'ngx-toastr';

declare var LivePlayer: any;
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @ViewChild('ngChatInstance')
  protected ngChatInstance: IChatController;
  isUserChat: boolean;
  id: any;
  userId: any;
  userGuid: any;
  lessonStartTimeLeft: number;
  lessonStartTeacherName: string;
  TeacherIntervalId: any;
  isStudent: number;
  lessonStartTimeLeftforTeacher: number;
  lessonStartStudentName: string;
  studentId: any;
  title = 'Welcome word';
  content = 'Vivamus sagittis lacus vel augue laoreet rutrum faucibus.';

  constructor(public commonService: CommonService, public userService: UserService, private router: Router,
    public studentService: StudentService, private teacherService: TeacherService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    let userData = CommonService.getUser();
    if (userData == null) return;
    this.isStudent = userData.IsStudent;
    if (this.isStudent == 1) {
      this.userId = userData.Student[0].StudentId;
    } else {
      this.userGuid = userData.UserGUID;
      this.userId = userData.Teacher[0].TeacherId;
    }
    this.getUpcomingLessonTime();
    this.id = setInterval(() => {
      this.getUpcomingLessonTime();
    }, 60000);
    if (userData == null) {
      this.getUpcomingLessonTimebyTeacher();
      this.TeacherIntervalId = setInterval(() => {
        this.getUpcomingLessonTimebyTeacher();
      }, 60000);
    }

  }

  ngOnDestroy() {
    if (this.id) {
      clearInterval(this.id);
    }
    if (this.TeacherIntervalId) {
      clearInterval(this.TeacherIntervalId);
    }
  }

  getUpcomingLessonTime() {
    if (this.isStudent == 1) {
      this.studentService.get('/student/GetUpcomingLessonTime', new HttpParams().
        set('studentId', this.userId)).subscribe((result: any) => {
          var data = result.split(',');
          this.lessonStartTimeLeft = data[0];
          this.lessonStartTeacherName = data[1];
          this.lessonStartStudentName = data[2];
        });
    }
  }

  getUpcomingLessonTimebyTeacher() {
    if (this.isStudent == 0) {
      this.studentService.get('/teacher/GetUpcomingLessonTimebyTeacher', new HttpParams().
        set('teacherId', this.userId)).subscribe((result: any) => {
          var data = result.split(',');
          this.lessonStartTimeLeftforTeacher = data[0];
          this.lessonStartTeacherName = data[1];
          this.lessonStartStudentName = data[2];
          this.studentId = data[3];
        });
    }
  }

  linkCopiedMessage() {
    this.toastr.success('Link copied to clipboard');
  }

  logout() {
    this.commonService.userChatMessage = new BehaviorSubject<boolean>(false);
    this.userService.upsertUserActivity("LoggedOut");
    this.commonService.MenuList = [];
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
    //localStorage.setItem('UserType', 'Role');
    //Remove User local storage
    localStorage.removeItem('userData');
    localStorage.removeItem('userImageUrl');
    localStorage.removeItem('associatedTeacher');
    localStorage.removeItem('LessonRoomKey');
    localStorage.removeItem('LessonLink');
    localStorage.removeItem('InviteGuid');
    localStorage.removeItem('gvlGuid');
    localStorage.removeItem('LessonRoomKey');
    localStorage.setItem('UserType', 'Role');
    // Go back to the home route    
    CommonService.isSignout = true;
    this.router.navigateByUrl('/login');
  }

  startLobbyLesson() {
    localStorage.setItem('lobbyStudentDisplayName', this.lessonStartStudentName);
    if (this.isStudent == 1) {
      localStorage.setItem('lobbyStudentId', this.userId);
    } else {
      localStorage.setItem('lobbyStudentId', this.studentId);
    }
    LivePlayer.livePlayerHasInit = false;
    this.router.navigate(['/teacher/lobby'])
  }

  openKeysApp() {

  }

  userList: any;
  bindLastMessage() {
    if (localStorage.getItem('UserType') == 'Teacher')
      this.studentService.getStudentListingData().subscribe(result => {
        this.userList = result;
      });
    else
      this.teacherService.getTeacherListingData().subscribe(result => {
        this.userList = result;
      });
  }

  userss: User;
  openUser(item) {
    if (localStorage.getItem('UserType') == 'Teacher')
      LivePlayer.openDirectChatMessageWindow(item.StudentId)
    else
      LivePlayer.openDirectChatMessageWindow(item.TeacherId)
  }

}
