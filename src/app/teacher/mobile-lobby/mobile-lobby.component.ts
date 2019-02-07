import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { LobbyService } from '../../services/lobby.service';
import { CommonService } from '../../common/common.service';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { Router, ActivatedRoute } from '@angular/router';

declare var LivePlayer: any;
@Component({
  selector: 'app-mobile-lobby',
  templateUrl: './mobile-lobby.component.html',
  styleUrls: ['./mobile-lobby.component.scss']
})

export class MobileLobbyComponent implements OnInit, OnDestroy {

  strScripts: any;
  strScript: any;
  userRole: string;
  userData: any;
  teacherId: any;
  studentId: any;
  displayName: any;
  userId: any;
  constructor(private mScrollbarService: MalihuScrollbarService, private lobbyService: LobbyService,
    private activatedRoute: ActivatedRoute, private router: Router, private _ngZone: NgZone) {
  }

  ngOnInit() {    
    this.teacherId = this.activatedRoute.snapshot.queryParams["teacherId"];
    this.studentId = this.activatedRoute.snapshot.queryParams["studentId"];
    this.displayName = this.activatedRoute.snapshot.queryParams["displayName"];
    this.userId = this.activatedRoute.snapshot.queryParams["userId"];
    this.userRole = this.activatedRoute.snapshot.queryParams["userRole"];

    //localStorage.setItem("LessonGuid", "726d2b24-b75e-4199-a338-d6f89709cb71");
    //localStorage.setItem("roomKey", "726d2b24b75e");
    localStorage.setItem("userRole", this.userRole);
    localStorage.setItem("displayName", this.displayName);
    localStorage.setItem("userId", this.userId);

    window['angularComponentReference'] = { zone: this._ngZone, UpdateAttendee: (value) => this.UpdateAttendee(value), component: this };
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.startLobbyLesson()
  }

  ngAfterViewInit() {
    this.mScrollbarService.initScrollbar('#customScroll', { axis: 'y', theme: 'dark-thick', scrollButtons: { enable: true } });
  }

  ngOnDestroy() {
    LivePlayer.livePlayerHasInit = false;
    LivePlayer.isConnDestory = true;
  }

  getChatHistory() {
    this.lobbyService.startLesson();
    var lessonGuid = localStorage.getItem('LessonGuid');
    var roomKey = lessonGuid.replace('-', '').substring(0, 12);
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
          $("#chatLog").append('<li _ngcontent-c3><label _ngcontent-c3>' + moment(new Date(value.DateSent)).format('hh:mm A') + '</label><span>&nbsp' + value.Content + '</span></li>');
        else
          $("#chatLog").append('<li _ngcontent-c3><label _ngcontent-c3>' + moment(new Date(value.DateSent)).format('MM/DD/YYYY hh:mm A') + '</label><span>&nbsp' + value.Content + '</span></li>');
      })
    });
  }

  UpdateAttendee(roomAttendee) {
    this.lobbyService.UpdateAttendee(roomAttendee).subscribe((data: any) => {
      data.forEach(element => {
        LivePlayer.changeUserLobbyStatus(element);
      });
    });
  }

  startLobbyLesson() {
    if (localStorage.getItem('access_token') == undefined)
      localStorage.setItem('access_token', 'BGo56yrMMF3o7PgdAIabjSiF4hJ9APFtuVxGkNCDgidWmYyePnENgfzCJdl166BC-aRa8XKxhW9cyccN2hi6oPvzYiwC-LqREEEdbrHUFvMQSwS6zF-6Bz8j8qTW5a1rMt151-w3wmzzWhNIea2NspjZ1IzXaULdD9ECkqsPHgjuGx5TNdm8XK_KhgAK_f_-l6GbSbqBBJhHDxWJa-jq1m97lGec012EUX1JH7sU8fPJE9IZvpr2NpZfGIYNQFvjVmQFDqZ-oD53w594fB2zNLyaMKPt5FBq-13AT2oGNGSAvf1P1V4Iv3gmGLStQA3Yta-1sp9tCC9hdoYnLIIMuVUMpK9Tupnq-GI1UYflLmohjW_zrXfiCufz1GQvYtBR');

    this.teacherId = this.activatedRoute.snapshot.queryParams["teacherId"];
    this.studentId = this.activatedRoute.snapshot.queryParams["studentId"];
    this.displayName = this.activatedRoute.snapshot.queryParams["displayName"];
    this.userId = this.activatedRoute.snapshot.queryParams["userId"];
    this.userRole = this.activatedRoute.snapshot.queryParams["userRole"];
    
    LivePlayer.livePlayerHasInit = false;
    this.lobbyService.initLivePlayerMobile(this.teacherId,this.studentId,this.userId,this.userRole);
  }
}