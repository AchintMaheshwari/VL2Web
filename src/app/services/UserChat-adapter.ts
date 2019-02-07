import { User} from '../ng-chat/core/user';
import { Message} from '../ng-chat/core/message';
import { UserStatus } from '../ng-chat/core/user-status.enum';
//import { Message } from './src/app/ng-chat/core';
import { Observable, Observer } from "rxjs/Rx";
import { StudentService } from './student.service';
import { CommonService } from '../common/common.service';
import { TeacherService } from './teacher.service';
import { HttpParams } from '@angular/common/http';
import { ChatAdapter } from "../ng-chat/core/chat-adapter";
import { NgChat } from '../ng-chat/ng-chat.component';

//declare var ChatPlayer: any
//declare var xsockets: any;
declare var SocketService: any;
declare var LivePlayer: any;
export class UserChatAdapter extends ChatAdapter {    
    //chatPlayer: any;
    //static conn: any;
    static userChat: any;
    userType = localStorage.getItem('UserType');
    result$: Observable<{}>;
    constructor(private studentService: StudentService, private teacherService: TeacherService) {        
        super();        
        UserChatAdapter.userChat = this;
        //UserChatAdapter.conn = new xsockets.client('wss://ws-dev-vl2.voicelessons.com:443',['generic']);
        SocketService.open();

        let userData = JSON.parse(localStorage.getItem('userData'));
        if (userData != null) {
            if (this.userType == 'Teacher') {
                //this.init(100); 
                if (userData.Teacher != undefined && userData.Teacher != null) {
                    this.onChatOpen(userData.Teacher[0].TeacherId);
                }
            }
            //this.init(userData.Teacher[0].TeacherId);
            else if(this.userType == 'Student') {
                //this.init(200); 
                if (userData.Student != undefined && userData.Student != null) {
                    this.onChatOpen(userData.Student[0].StudentId);
                }
                //this.init(userData.Student[0].StudentId);  
            }
        }
    }

    public static mockedUsers: User[] = [];

    listFriends(): Observable<User[]> {
        UserChatAdapter.mockedUsers = [];
        var userList: any;
        if (this.userType == 'Teacher' && CommonService.getUser() != null)
            this.studentService.getStudentListingData().subscribe(result => { this.bindUserList(result) });
        else {
            if (CommonService.getUser() != null)
                this.teacherService.getTeacherListingData().subscribe(result => { this.bindUserList(result) });
        }
        return Observable.of(UserChatAdapter.mockedUsers);
    }

    bindUserList(userList) {
        userList.forEach(element => {
            UserChatAdapter.mockedUsers.push(
                {
                    id: this.userType == 'Teacher' ? element.StudentId : element.TeacherId,
                    displayName: element.DisplayName != '' ? element.DisplayName : element.FirstName,
                    avatar: element.ImageUrl,
                    status: UserStatus.Online
                });
        });
    }

    getMessageHistory(userId: any): Observable<Message[]> {

        let userData = JSON.parse(localStorage.getItem('userData'));
        let fromUserId = "";
        if (this.userType == "Teacher")
            fromUserId = userData.Teacher[0].TeacherId;
        else
            fromUserId = userData.Student[0].StudentId;

        return this.getDirectMessageList(userId, fromUserId);
    }

    getDirectMessageList(toUserId, fromUserId): Observable<Message[]> {
        let mockedHistory: Array<Message> = [];
        return this.studentService.get<any>('/chat/GetDirectChatMessages', new HttpParams().set('fromId', fromUserId).set('toId', toUserId))
            .map((res): any => {
                res.forEach(element => {
                    mockedHistory.push({
                        fromId: element.FromUserId,
                        toId: element.ToUserId,
                        message: element.Content
                    });
                });
                return mockedHistory;
            });
    }

    sendMessage(message: Message): void {
        var userData = JSON.parse(localStorage.getItem('userData'));
        if (this.userType == 'Teacher') {
            message.toId = message.toId; //200
            message.fromId = userData.Teacher[0].TeacherId;//100; //
        }
        else {
            message.toId = message.toId; //100
            message.fromId = userData.Student[0].StudentId; //200;
        }
        this.sendChatMessage(message);
    }

    destory() {
        //UserChatAdapter.conn.close();
    }
    init(toUserId) {
        //setup xsocket        
        //UserChatAdapter.conn.autoReconnect(true, 3000);
        //UserChatAdapter.conn.autoHeartbeat(true, 30000);
        this.onChatOpen(toUserId);
        //UserChatAdapter.conn.open();        
    }

    onChatOpen(toUserId) {
        SocketService.conn.onOpen = function (e) {
            SocketService.conn.controller("message").setProperty("ToUserId", toUserId);

            SocketService.conn.controller("message").subscribe("directmessage", function (message) {                
                let replyMessage = new Message();
                replyMessage.fromId = parseInt(message.FromUserId); //ToUserId;//toId;
                replyMessage.toId = parseInt(message.ToUserId); //FromUserId; //fromId;
                replyMessage.message = message.Content;  //"You have typed '" + message.message + "'";
                replyMessage.type = 1;
                replyMessage.seenOn = new Date();
                let user = UserChatAdapter.mockedUsers.find(x => x.id == replyMessage.fromId);
                UserChatAdapter.userChat.onMessageReceived(user, replyMessage);                
            });

            SocketService.conn.onClose = function () {
            };
            SocketService.conn.onError = function (err) {
                console.log("ERROR", err);
            };
        }
    }

    sendChatMessage(message) {
        var now = new Date();
        let userData = JSON.parse(localStorage.getItem('userData'));
        let fromUserName = userData.DisplayName != '' ? userData.DisplayName : userData.FirstName;
        var now_utc2 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        var dateJson = (now_utc2).toString();
        var msg = { ToUserId: message.toId, From: fromUserName, FromUserId: message.fromId, Content: message.message, Attachment: null, DateSent: dateJson, Type: null };
        SocketService.conn.controller("message").publish("senddirectmessage", msg);
    }

    onFriendsListChanged(users: User[]): void
    {
        CommonService.friendsListChangedHandler(users);
        //this.friendsListChangedHandler(users);
    }

    onMessageReceived(user: User, message: Message): void
    {
        CommonService.messageReceivedHandler(user, message);
        //UserChatAdapter.userChat.messageReceivedHandler(user, message);
    }    
}