var SocketService = SocketService || {};

SocketService = {
    conn: Object,
    isOpen : false,
    open : function () {        
        if(!SocketService.isOpen){
            SocketService.conn = new xsockets.client('wss://ws-dev-vl2.voicelessons.com');
            SocketService.conn.autoReconnect(true,3000);
            SocketService.conn.autoHeartbeat(true,30000);
            SocketService.conn.open();
            SocketService.isOpen = true;
        }
    }
} 
  