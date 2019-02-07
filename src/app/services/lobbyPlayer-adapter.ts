import { CommonService } from "../common/common.service";

//============= Lobby Chat  Class ================================
declare var xsockets: any;
export class LobbyPlayer {
  static userData: any;
  static debug: any;
  static roomKey: any;
  static userFirstName: any;
  static user: any;
  static lessonGuid: any;
  static usertype: any;
  static hasTeacher: boolean = false;
  static hasAtLeastOneStudent: boolean = false;
  static chatRoomCurrentUsers: {} = [];

  init() {    
    LobbyPlayer.userData = JSON.parse(localStorage.getItem('userData'));
    LobbyPlayer.roomKey = localStorage.getItem('LessonGuid').replace("-", "").substr(0, 12); //'edd2e9e075f8';
    localStorage.setItem('roomKey',LobbyPlayer.roomKey);
    LobbyPlayer.userFirstName = LobbyPlayer.userData.FirstName; //'murli';
    if (localStorage.getItem('userRole') == 'Student')
      LobbyPlayer.user = LobbyPlayer.userData.Student[0].StudentId; //'d4f81ffc-ae4b-4659-9acc-9dfed7d62492';
    else
      LobbyPlayer.user = LobbyPlayer.userData.Teacher[0].TeacherId;
    LobbyPlayer.lessonGuid = localStorage.getItem('LessonGuid'); //'edd2e9e0-75f8-438a-b717-789ba36a9960';
    LobbyPlayer.usertype = localStorage.getItem('userRole');

    //setup xsocket            
    if (CommonService.xsocketconn == null) {      
      CommonService.xsocketconn = new xsockets.client('wss://ws-dev-vl2.voicelessons.com::4503');      
      CommonService.xsocketconn.autoReconnect(true, 3000);
      CommonService.xsocketconn.autoHeartbeat(true, 30000);

      this.onChatOpen();
      CommonService.xsocketconn.open();
    }
    else
    {
      LobbyPlayer.chatRoomCurrentUsers = [];
      this.sendChatMessage(" HAS ENTERED THE CHANNEL.", "info");
      this.changeUserRoomStatus("in");
    //   setTimeout(this.changeUserRoomStatus("in"), 5000);
    //   setTimeout(this.changeUserRoomStatus("in"), 30000);
    }
  }

  onChatOpen() {
    CommonService.xsocketconn.onOpen = function (e) {
      //CommonService.xsocketconn.controller("sequencer").setProperty("LessonGuid", this.lessonGuid);
      CommonService.xsocketconn.controller("message").setProperty("RoomKey", this.roomKey);
      //if (!LobbyPlayer.mobile) {
      CommonService.xsocketconn.controller("message").subscribe("chatmessage", function (data) {
        var offset = new Date().getTimezoneOffset();
        var dateSent = new Date(parseInt(data.DateSent));

        var ampm = "am";
        var hour = dateSent.getHours();
        //if (hour < 10) hour = "0" + hour;
        if (hour == 12) { ampm = "pm"; }
        else if (hour > 12) { hour -= 12; ampm = "pm"; }
        var min = dateSent.getMinutes();
        if (min < 10) { min = 0 + min; }
        var time = hour + ":" + min + " " + ampm;

        if (data.Type == "info") {
          $("#chatLog").append('<li _ngcontent-c3> <label _ngcontent-c3>' + time + ' ' + data.From + '&nbsp;' + data.Content + '</label></li>');
        } else {
          $("#chatLog").append('<li _ngcontent-c3> <label _ngcontent-c3>' + time + ' ' + data.From + '</label> <span>' + '&nbsp;' + data.Content + '</span> </li>');
        }

        var height1 = $("#chatLog").height();
        $("#lobbyChatLogScroller").scrollTop(height1);
      });

      //===================
      CommonService.xsocketconn.controller("message").subscribe("changeuserroomstatus", function (data) {       
        debugger;
        var uid = data.UserId.toString().replace(/\-/g, "");
        //console.log("uid = " + uid);
        var cu_userid = "user_" + uid;
        console.log("changeuserroomstatus = " + cu_userid + " this.chatRoomCurrentUsers[cu_userid] = " + LobbyPlayer.chatRoomCurrentUsers[cu_userid]);
        //if (cu_userid in this.chatRoomCurrentUsers) {

        if (LobbyPlayer.chatRoomCurrentUsers[cu_userid] != undefined) {
          $("#" + cu_userid).attr("class", data.Status);
        } else {
          $("#currentUsers").append('<li _ngcontent-c3 class="' + data.Status + '" id="' + cu_userid + '" data-usertype=' + data.UserType + '>' + data.UserFirstName + '</li>');

          LobbyPlayer.chatRoomCurrentUsers[cu_userid] = data.UserType;
        }
        for (var key in LobbyPlayer.chatRoomCurrentUsers) {
          if (LobbyPlayer.chatRoomCurrentUsers[key] == "Teacher") { LobbyPlayer.hasTeacher = true; }
          else if (LobbyPlayer.chatRoomCurrentUsers[key] == "Student") { LobbyPlayer.hasAtLeastOneStudent = true; }
        }
        console.log("hasTeacher = ", LobbyPlayer.hasTeacher);
        console.log("hasAtLeastOneStudent = ", LobbyPlayer.hasAtLeastOneStudent);
        if (LobbyPlayer.hasTeacher && LobbyPlayer.hasAtLeastOneStudent) {
          console.log("hasTeacher && hasAtLeastOneStudent - show start Lesson button");
          //start Lesson button
          $("#statusWaiting").attr("class", "hidden");
          $("#statusReady").attr("class", "show");
        }
      });
      //==================      
      var lobbyPlayer = new LobbyPlayer();
      lobbyPlayer.sendChatMessage(" HAS ENTERED THE CHANNEL.", "info");
      lobbyPlayer.changeUserRoomStatus("in");
       setTimeout(lobbyPlayer.changeUserRoomStatus("in"), 5000);
       setTimeout(lobbyPlayer.changeUserRoomStatus("in"), 30000);
    }
  }  
  sendChatMessage(message, type) {
    var lobbyPlayer = new LobbyPlayer();
    var now = new Date();
    var now_utc2 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
    var dateJson = (now_utc2).toString();
    var msg = { RoomKey: LobbyPlayer.roomKey, From: LobbyPlayer.userFirstName, FromUserId: LobbyPlayer.user, Content: message, Attachment: null, DateSent: dateJson, Type: type };
    CommonService.xsocketconn.controller("message").publish("sendchatmessage", msg);
    if (LobbyPlayer.debug) console.log("LivePlayer sendChatMessage", msg);
  }

  changeUserRoomStatus(status) {

    var urs = { UserId: LobbyPlayer.user, UserFirstName: LobbyPlayer.userFirstName, Status: status, UserType: LobbyPlayer.usertype };
    CommonService.xsocketconn.controller("message").publish("changeuserroomstatus", urs);
    if (LobbyPlayer.debug) console.log("LivePlayer changeuserroomstatus", urs);
  }

  addExistingUsersToRoom(currentUsers) {        
    console.log('LivePlayer addExistingUsersToRoom');
    for (var i = 0; i < currentUsers.length; i++) {
        console.log('addExistingUsersToRoom currentUsers[' + i + '] = ', currentUsers[i]);
        var uid = currentUsers[i].UserId;
        //console.log("uid = " + uid);
        var cu_userid = "user_" + uid;
        console.log("addExistingUsersToRoom changeuserroomstatus = " + cu_userid + " LobbyPlayer.chatRoomCurrentUsers[cu_userid] = " + LobbyPlayer.chatRoomCurrentUsers[cu_userid]);
        //if (cu_userid in LobbyPlayer.chatRoomCurrentUsers) {
        if (LobbyPlayer.chatRoomCurrentUsers[cu_userid] != undefined) {
            //$("#" + cu_userid).attr("class", 'in');
        } else {
            //$("#currentUsers").append('<li class="' + 'in' + '" id="user_"' + cu_userid + ' data-usertype=' +  currentUsers[i].UserType + '><a>' +  currentUsers[i].UserFirstName + '</a></li>');
            LobbyPlayer.chatRoomCurrentUsers[cu_userid] = currentUsers[i].UserType;
        }
        for (var key in LobbyPlayer.chatRoomCurrentUsers) {
            if (LobbyPlayer.chatRoomCurrentUsers[key] == "Teacher") { LobbyPlayer.hasTeacher = true; }
            else if (LobbyPlayer.chatRoomCurrentUsers[key] == "Student") { LobbyPlayer.hasAtLeastOneStudent = true; }
        }
        console.log("hasTeacher = ", LobbyPlayer.hasTeacher);
        console.log("hasAtLeastOneStudent = ", LobbyPlayer.hasAtLeastOneStudent);
        if (LobbyPlayer.hasTeacher && LobbyPlayer.hasAtLeastOneStudent) {
            console.log("hasTeacher && hasAtLeastOneStudent - show start Lesson button");
            //start Lesson button
            $("#statusWaiting").attr("class", "hidden");
            $("#statusReady").attr("class", "show");
        }
    }
}

}