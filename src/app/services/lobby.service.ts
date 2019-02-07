import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { CommonService } from '../common/common.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserService } from './user.service';
import { Observable } from 'rxjs/Observable';
import { LobbyPlayer } from './lobbyPlayer-adapter';
import { moment } from 'ngx-bootstrap/chronos/test/chain';

declare var LivePlayer: any;
@Injectable()
export class LobbyService extends CrudService {
  lobby: LobbyPlayer = null;
  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService,
    private userService: UserService, ) {
    super(http, commonService);
  }

  startLesson() {
    let userData = CommonService.getUser();
    localStorage.setItem('userRole', this.userService.userRole);
    var teacherId = 0;
    var studentId = 0;
    if (localStorage.getItem('UserType') === "Student") {
      studentId = parseInt(userData.Student[0].StudentId);
      teacherId = JSON.parse(localStorage.getItem('lobbyTeacherId'));
    }
    else if (localStorage.getItem('UserType') === "Teacher") {
      teacherId = parseInt(userData.Teacher[0].TeacherId);
      studentId = JSON.parse(localStorage.getItem('lobbyStudentId'));
    }
    this.crudService.post('/lesson/StartLesson?studentId=' + studentId + '&teacherId=' + teacherId + '&userId=' + userData.UserId + '&userRole=' + this.userService.userRole, null).subscribe((result) => {
      this.pushScriptIntoDOM(result);
      //this.injectChatLibrary();   
      //update Attendee      
      if (!LivePlayer.livePlayerHasInit) {
        LivePlayer.init();
      }
      else {
        LivePlayer.sendChatMessage(" HAS ENTERED THE CHANNEL.", "info");
        LivePlayer.changeUserRoomStatus("in");
      }
      LivePlayer.updateLobbyAttendee();
    });
  }

  initLivePlayerMobile(teacherId,studentId,userId,userRole) {    
    this.crudService.post('/lesson/StartLesson?studentId=' + studentId + '&teacherId=' + teacherId + '&userId=' + userId + '&userRole=' + userRole, null).subscribe((result) => {      
      this.pushScriptIntoDOM(result);      
      if (!LivePlayer.livePlayerHasInit) {        
        LivePlayer.init();
      }
      else {
        LivePlayer.sendChatMessage(" HAS ENTERED THE CHANNEL.", "info");
        LivePlayer.changeUserRoomStatus("in");
      }
      LivePlayer.updateLobbyAttendee();
    });



    // this.fetchChatHistorySer(localStorage.getItem("roomKey")).subscribe((data: any) => {
    //   data.forEach(function (value) {
    //     if (moment(value.DateSent).format('YYYY/MM/DD') === moment.utc(new Date()).format('YYYY/MM/DD')) {
    //       value.DateSent = moment(value.DateSent).format('YYYY/MM/DD hh:mm A');
    //       $("#chatLog").append('<li _ngcontent-c3><label _ngcontent-c3>' + CommonService.convertToUserTime(value.DateSent) + ' ' + value.From + '</label><span>&nbsp' + value.Content + '</span></li>');
    //     } else {
    //       value.DateSent = moment(value.DateSent).format('YYYY/MM/DD hh:mm A');
    //       $("#chatLog").append('<li _ngcontent-c3><label _ngcontent-c3>' + CommonService.convertChatMessageToUserTimeZone(value.DateSent) + ' ' + value.From + '</label><span>&nbsp' + value.Content + '</span></li>');
    //     }
    //   })
    // });    
    // this.initTextEnter();    
    // LivePlayer.init();
  }

  chatSubmit() {
    this.lobby.sendChatMessage($('#chatSubmit').val(), "message")
    $('#chatSubmit').val('');
  }

  addExistingUsersToRoom(user: any) {
    this.lobby = new LobbyPlayer();
    this.lobby.init();
    this.lobby.addExistingUsersToRoom(user);
  }

  pushScriptIntoDOM(result) {
    localStorage.setItem('LessonGuid', result.id);
    localStorage.setItem('roomKey', result.key);
    this.fetchChatHistorySer(result.key).subscribe((data: any) => {
      data.forEach(function (value) {
        if (moment(value.DateSent).format('YYYY/MM/DD') === moment.utc(new Date()).format('YYYY/MM/DD')) {
          value.DateSent = moment(value.DateSent).format('YYYY/MM/DD hh:mm A');
          $("#chatLog").append('<li _ngcontent-c3><label _ngcontent-c3>' + CommonService.convertToUserTime(value.DateSent) + ' ' + value.From + '</label><span>&nbsp' + value.Content + '</span></li>');
        } else {
          value.DateSent = moment(value.DateSent).format('YYYY/MM/DD hh:mm A');
          $("#chatLog").append('<li _ngcontent-c3><label _ngcontent-c3>' + CommonService.convertChatMessageToUserTimeZone(value.DateSent) + ' ' + value.From + '</label><span>&nbsp' + value.Content + '</span></li>');
        }
      })
    });
    this.initTextEnter();
  }

  initTextEnter() {
    $('#chatSubmit').keypress(function (e) {
      if (e.which == 10 || e.which == 13) {
        let msg = $('#chatSubmit').val();
        if (msg != "")
          LivePlayer.sendChatMessage(msg, 'msg');
        $('#chatSubmit').val('');
      }
    });
  }

  getAssociatedTeacher(studentId: string) {
    let userData = CommonService.getUser();
    this.crudService.get('/lesson/GetAssociatedTeacher', new HttpParams().set("studentId", studentId)).subscribe((resultData: any) => {
      this.crudService.post('/lesson/StartLesson?studentId=' + studentId + '&teacherId=' + resultData +
        '&userId=' + userData.UserId + '&userRole=' + this.userService.userRole, null).subscribe((result) => {
          this.pushScriptIntoDOM(result.id);
          //LivePlayer.init();
          if (!LivePlayer.livePlayerHasInit) {
            LivePlayer.init();
          }
          else {
            LivePlayer.sendChatMessage(" HAS ENTERED THE CHANNEL.", "info");
            LivePlayer.changeUserRoomStatus("in");
          }
        });
    });
  }

  fetchChatHistorySer(reqRoomKey): Observable<any> {
    return this.crudService.get<any>('/chat/GetChatMessages', new HttpParams().set("roomKey", reqRoomKey));
  }

  UpdateAttendee(roomAttendee): Observable<any> {
    return this.crudService.post("/room/UpdateAttendee", null,
      new HttpParams().set('roomKey', roomAttendee.roomKey).set('userType', roomAttendee.userType).
        set('userId', roomAttendee.userId));
  }

  injectChatLibrary() {
    //if (!CommonService.livePlayerHasInit) {
    const time_update_interval = setInterval(function () {
      //   //CommonService.livePlayerHasInit = true;
      //   this.strScript = document.createElement("script");
      //   this.strScript.type = "text/javascript";
      //   this.strScript.id = "livePlayerJS";
      //   this.strScript.src = "../assets/js/XSockets/LivePlayer.js";
      //   document.head.appendChild(this.strScript);

      this.strScripts = document.createElement("script");
      this.strScripts.type = "text/javascript";
      this.strScripts.id = "lobbyJs";
      this.strScripts.src = "../assets/js/lobby.js";
      document.head.appendChild(this.strScripts);

      clearInterval(time_update_interval);
    }, 1000);
  }
  // }
}