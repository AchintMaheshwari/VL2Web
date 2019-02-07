
var ChatPlayer = ChatPlayer || {};

ChatPlayer = {
    //conn: Object,    
    toUser : '',
    userData: '',
    roomKey: '',
    userFirstName: '',
    //lessonGuid = 'edd2e9e0-75f8-438a-b717-789ba36a9960-123456';
    //var usertype = localStorage.getItem('userRole');

    destory : function() {
        //ScoketService.conn.close();
    },
    init : function (toUserId) {
        debugger;
        //setup xsocket
        //this.conn = new xsockets.client('wss://ws-dev-vl2.voicelessons.com:443',['generic']);        
        // ScoketService.conn.autoReconnect(true, 3000);
        // ScoketService.conn.autoHeartbeat(true, 30000);
        ScoketService.open();
        ScoketService.conn.onOpen = function (e) {
            debugger;            
            ScoketService.conn.controller("message").setProperty("ToUserId", toUserId);
    
            ScoketService.conn.controller("message").subscribe("directmessage", function (data) {
                debugger;
            });
    
            ScoketService.conn.onClose = function () {
            };
            ScoketService.conn.onError = function (err) {
                console.log("ERROR", err);
            };
        }
        //ScoketService.conn.open();
    },
    sendChatMessage : function(message, type) {
        var now = new Date();
        var now_utc2 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        var dateJson = (now_utc2).toString();
        var msg = { ToUserId: message.toId, From: 'murli', FromUserId: message.fromId, Content: message.message, Attachment: null, DateSent: dateJson, Type: type };
        ScoketService.conn.controller("message").publish("senddirectmessage", msg);
    }
}

$(document).ready(function () {

    //ChatPlayer.init('3lsjfk-keke-pp');
    var userData = JSON.parse(localStorage.getItem('userData'));
    debugger;
        if (userData.Teacher[0] != undefined)
        ChatPlayer.init(100); //ChatPlayer.init(userData.Teacher[0].TeacherId);
        if (userData.Student[0] != undefined)
        ChatPlayer.init(200); //ChatPlayer.init(userData.Student[0].StudentId);
});