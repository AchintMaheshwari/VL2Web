import { Component, OnInit } from '@angular/core';
import { LobbyService } from '../../../services/lobby.service';
import { moment } from 'ngx-bootstrap/chronos/test/chain';

@Component({
  selector: 'lesson-chat',
  templateUrl: './lesson-chat.component.html',
  styleUrls: ['./lesson-chat.component.scss']
})
export class LessonChatComponent implements OnInit {

  constructor(private lobbyService: LobbyService, ) { }

  ngOnInit() {
    var lessonGuid = localStorage.getItem('LessonGuid');
    var roomKey = lessonGuid.replace('-', '').substring(0, 12);
    //console.log('***getChatHistory LessonGuid',lessonGuid);
    //console.log('***getChatHistory roomKey',roomKey);
    this.fetchChatHistory(roomKey);
    //this.fetchChatHistory('4dcc94e94a6a');
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

}
