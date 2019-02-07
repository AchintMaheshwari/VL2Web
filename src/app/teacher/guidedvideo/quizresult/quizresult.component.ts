import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../services/student.service';
import { GuidedvideoService } from '../../../services/guidedvideo.service';

declare var jwplayer: any;
declare var VoicelessonsVideoPlayer: any;
@Component({
  selector: 'quizresult',
  templateUrl: './quizresult.component.html',
  styleUrls: ['./quizresult.component.scss']
})
export class QuizresultComponent implements OnInit {

  studentQuizResult: any = null;
  videoSubmissionURL: String = null;
  playList: any;
  constructor(private studentSer: StudentService, private guidedvideoService: GuidedvideoService) { }

  ngOnInit() {
    var videoSubmissionId = localStorage.getItem('VideoSubmissionId');
    let gvLesson = JSON.parse(localStorage.getItem('GVLesson'));
    this.studentSer.getQuizResult(gvLesson.Users, videoSubmissionId).subscribe((result: any) => {
      this.studentQuizResult = result;
    });

    this.guidedvideoService.getVideoSubmissionData(videoSubmissionId).subscribe((data: any) => {
      this.guidedvideoService.videoSubmissionData = data.result;
      if (data.result.VideoUrl.includes("youtube.com") || data.result.VideoUrl.includes("vimeo.com") ||
        data.result.VideoUrl.includes("dailymotion.com") || data.result.VideoUrl.includes("wistia") ||
        data.result.VideoUrl.includes(".mp4")) {
        VoicelessonsVideoPlayer.init('#videoPlayer', data.result.VideoUrl, null, null, true);
        $('#videoPlayer').show();
        $('#excrisePlayer').hide();
        $('#audioPlayer').hide();
      }
    });
  }

  playVideo() {
    this.playList = [];
    this.playList.push({
      "file": this.videoSubmissionURL,//"https://vldevstoragefuncapp.blob.core.windows.net/vl2songs/small.mp4",
      "image": "../../../../assets/images/caro-video-img.jpg",
      "height": 360,
      "width": 640
    });

    var playlist = this.playList;
    const playerJw = jwplayer('player').setup({
      title: 'Player Test',
      playlist: this.playList,
      width: "100%",
      height: "100%",
      aspectratio: '16:9',
      mute: false,
      autostart: true,
      primary: 'html5',
      nextUpDisplay: true,
      displaytitle: true,
      displaydescription: true,
      visualplaylist: false,
    });
  }
}