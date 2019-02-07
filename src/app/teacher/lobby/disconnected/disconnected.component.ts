import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { LobbyService } from '../../../services/lobby.service';
import { CommonService } from '../../../common/common.service';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { RateTeacherService } from '../../../services/rate-teacher.service';
import { MatDialog } from '../../../../../node_modules/@angular/material';
import { RateTeacherDialogComponent } from '../../../student/rate-teacher-dialog/rate-teacher-dialog.component';

declare var LivePlayer: any;
@Component({
  selector: 'app-disconnected',
  templateUrl: './disconnected.component.html',
  styleUrls: ['./disconnected.component.scss']
})
export class DisconnectedComponent implements OnInit, OnDestroy {

  //isLessonStarted: boolean = false;
  strScripts: any;
  strScript: any;
  userRole: string;
  userData: any;
  pendingReview: any;
  constructor(private mScrollbarService: MalihuScrollbarService, private lobbyService: LobbyService, private router: Router,
    private _ngZone: NgZone, private rateTeacherService: RateTeacherService, public dialog: MatDialog) {
  }

  ngOnInit() {    
    window['angularComponentReference'] = { zone: this._ngZone, UpdateAttendee: (value) => this.UpdateAttendee(value), component: this };
    this.userRole = localStorage.getItem("UserType");    
    this.userData = JSON.parse(localStorage.getItem("userData"));
    let roomKey = localStorage.getItem("LessonRoomKey");
    if (roomKey != null && roomKey != undefined)
      this.getLessonGuid(roomKey);
    else
      this.lobbyService.startLesson();
    var currenUser = [];
    currenUser.push({
      "UserId": this.userData.UserId,
      "UserType": this.userRole,
      "UserFirstName": this.userData.DisplayName  //localStorage.getItem("UserName")
    });
  }

  getLessonGuid(roomKey: string) {
    this.lobbyService.get('/lesson/GetLessonFromRoomKey', new HttpParams().set('roomKey', roomKey))
      .subscribe((response: any) => {
        if (response != null) {
          this.lobbyService.pushScriptIntoDOM(response);
          if (!LivePlayer.livePlayerHasInit) {
            LivePlayer.init();
          }
          else {
            LivePlayer.sendChatMessage(" HAS ENTERED THE CHANNEL.", "info");
            LivePlayer.changeUserRoomStatus("in");
          }
          LivePlayer.updateLobbyAttendee();
        }
      })
  }

  ngAfterViewInit() {
    this.mScrollbarService.initScrollbar('#customScroll', { axis: 'y', theme: 'dark-thick', scrollButtons: { enable: true } });
  }

  ngOnDestroy() {
    LivePlayer.livePlayerHasInit = false;
    LivePlayer.isConnDestory = true;
    LivePlayer.chatRoomCurrentUsers = {};
    clearInterval(LivePlayer.constInitUpdateAttendee);
  }

  getChatHistory() {
    let roomKey = localStorage.getItem("LessonRoomKey");
    if (roomKey === null || roomKey === undefined) {
      this.lobbyService.startLesson();
      let lessonGuid = localStorage.getItem('LessonGuid');
      roomKey = lessonGuid.replace('-', '').substring(0, 12);
    }
    this.fetchChatHistory(roomKey);
  }

  chatSubmit(event: any) {
    if (event.key === "Enter")
      this.lobbyService.chatSubmit();
  }

  fetchChatHistory(reqRoomKey) {
    this.lobbyService.fetchChatHistorySer(reqRoomKey).subscribe((data: any) => {
      data.forEach(function (value) {
        if (moment(new Date(value.DateSent)).format('YYYY/MM/DD') == moment(new Date()).format('YYYY/MM/DD'))
          $("#chatLog").append('<li _ngcontent-c3><label _ngcontent-c3>' + moment(new Date(value.DateSent)).format('hh:mm A') + ' ' + value.From + '</label><span>&nbsp' + value.Content + '</span></li>');
        else
          $("#chatLog").append('<li _ngcontent-c3><label _ngcontent-c3>' + moment(new Date(value.DateSent)).format('MM/DD/YYYY hh:mm A') + ' ' + value.From + '</label><span>&nbsp' + value.Content + '</span></li>');
      });
    });
  }

  UpdateAttendee(roomAttendee) {
    this.lobbyService.UpdateAttendee(roomAttendee).subscribe((data: any) => {
      data.forEach(element => {
        LivePlayer.changeUserLobbyStatus(element);
      });
    });
  }

  startVideoLesson() {
    if (this.userRole == 'Teacher') {
      this.router.navigate(['/teacher/videoConnected']);
    } else {
      this.rateTeacherService.getPendingReviewLesson(this.userData.UserId).subscribe((response: any) => {
        this.pendingReview = response;
        if (this.pendingReview.length == 0) {
          this.router.navigate(['/student/videoConnected']);
        } else {
          this.rateTeacherService.TeacherReviewModel.StudentUserId = this.pendingReview[0].StudentUserId;
          this.rateTeacherService.TeacherReviewModel.TeacherUserId = this.pendingReview[0].TeacherUserId;
          this.rateTeacherService.TeacherReviewModel.LessonId =this.pendingReview[0].LessonId;
          const dialogRef = this.dialog.open(RateTeacherDialogComponent, {
            maxHeight: '80vh'
          });
        }
      });
    }
  }

}