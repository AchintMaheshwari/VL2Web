import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Node } from '../tree-view/node';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../common/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../../services/crud.service';
import { GuidedvideoService } from '../../services/guidedvideo.service';
import { MatDialog } from '../../../../node_modules/@angular/material';
import { RateTeacherDialogComponent } from '../../student/rate-teacher-dialog/rate-teacher-dialog.component';
import { RateTeacherService } from '../../services/rate-teacher.service';

declare var VoiceLessons: any;
declare var VoiceLessonsExercisePlayer: any;
//declare var VoicelessonsVideoPlayer: any;
declare var VoicelessonsGuidedVideoPlayer: any;

@Component({
  selector: 'app-mobile-guided-video-player',
  templateUrl: './mobile-guided-video-player.component.html',
  styleUrls: ['./mobile-guided-video-player.component.scss']
})

export class MobileGuidedVideoPlayerComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    CommonService.parentNodeList = undefined;
    VoiceLessons.destoryPlayer();
    VoiceLessonsExercisePlayer.stopMusic();
    CommonService.isEditLessonQueueLoaded = false;
    CommonService.isPlayerStarted = false;
    if (this.rateTeacherService.TeacherReviewModel.TeacherUserId != 0) {
      this.checkReviewByLessonGuid();
    }
  }

  animal: string;
  name: string;
  nodes: Array<Node> = [];
  songsDatalist: any;
  targetList: Array<Node> = [];
  isDropup = true;
  songsDataEmpty: any;
  libraryList: any;
  rows2: object;
  searchText: any;
  isNoteFlight: boolean;
  isVideo: boolean;
  isLyrics: boolean;
  isTranslation: boolean;
  selectedbutton: string;
  isMobilePlayer: boolean = false;
  teacherId: string;
  studentId: string;
  displayName: string;
  userId: string;
  userRole: string;
  teacherName: string;
  constructor(private mScrollbarService: MalihuScrollbarService, private activatedRoute: ActivatedRoute, private _ngZone: NgZone,
    private crudService: CrudService, public guidedvideoService: GuidedvideoService, public dialog: MatDialog, public rateTeacherService: RateTeacherService) {
  }

  ngAfterViewInit() {
    this.mScrollbarService.initScrollbar('#libraryData', { axis: 'y', theme: 'dark-thick', scrollButtons: { enable: true } });
  }

  clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

  convertToNodes(songNodes: any): Array<Node> {
    var nodeList = new Array<Node>();
    songNodes.forEach(element => {
      nodeList.push(new Node(element.SongId, Math.random().toString(), element.Label, element.Artist, element.VideoUrl, element.AudioFile, element.JumpPoints, element.FilterType, element.CreatedByUserId, false, element.NoteflightScoreID, element.Lyrics, element.TransLations, element.LessonQueue, element.IsTeacherPlayed, element.IsStudentPlayed, element.Midi, [], element.TeacherItemName, element.StudentItemName));
    });
    return nodeList;
  }

  ngOnInit() {
    if (this.guidedvideoService.guidedLessonGuid == null || this.guidedvideoService.guidedLessonGuid == undefined || this.guidedvideoService.guidedLessonGuid == "") {
      this.guidedvideoService.guidedLessonGuid = this.activatedRoute.snapshot.queryParams['lessonGuid'];
    }
    this.getTeacherDataByLessonGuid();
    this.getLessonByLessonGuid();
  }

  getLessonByLessonGuid() {
    this.crudService.get('/lesson/GetGuidedVideoLessonDetailsByLessonGuid?lessonGuid=' + this.guidedvideoService.guidedLessonGuid, null).subscribe((response: any) => {
      this.lessonQueue(JSON.parse(response.LessonQueue));
      VoicelessonsGuidedVideoPlayer.init('#defaultVideoPlayer', this.getdefaultVideo(), null, null, true);
    });
  }

  getTeacherDataByLessonGuid() {    
    this.crudService.get('/guidedVideo/GetTeacherDataByLessonGuid?lessonGuid=' + this.guidedvideoService.guidedLessonGuid, null).subscribe((response: any) => {
      this.rateTeacherService.TeacherReviewModel.TeacherUserId = response.result.TeacherId;
      this.guidedvideoService.IsPaid = response.result.IsPaid;
      this.guidedvideoService.PaymentTime = response.result.PaymentTime;
      this.guidedvideoService.Price = response.result.Price;
      this.teacherName = response.result.TeacherName;
      this.guidedvideoService.videoSubmissionId = response.result.VideoSubmissionId;
    });
  }

  getdefaultVideo() {
    let isDefaultVideoUrl = false; let defaultVideoUrl = "";
    CommonService.parentNodeList.forEach(element => {
      if (!isDefaultVideoUrl && element.VideoUrl.length > 0) {
        defaultVideoUrl = element.VideoUrl;
        isDefaultVideoUrl = true;
      }
    });
    return defaultVideoUrl;

  }

  lessonQueue(lessonQueueJsonObject) {
    var arrayNodeList: any[] = lessonQueueJsonObject;
    var nodelist = this.lessonQueueFromJsonNodes(arrayNodeList);
    this.nodes = null;
    this.nodes = nodelist;
    CommonService.parentNodeList = this.nodes;
  }

  lessonQueueFromJsonNodes(songNodes: any): Array<Node> {

    try {
      if (songNodes == undefined) return;
      var nodeList = new Array<Node>();
      var parentCounter = 0;
      songNodes.forEach(element => {
        nodeList.push(new Node(element.SongId, element.Label, element.LabelName, element.Artist, element.VideoUrl, element.AudioFile, element.JumpPoints, element.FilterType, element.CreatedByUserId, false, element.NoteflightScoreID, element.Lyrics, element.TransLations, element.LessonQueue, element.Midi, element.IsTeacherPlayed, element.IsStudentPlayed, [], element.TeacherItemName, element.StudentItemName));
        if (element.nodes.length != 0) {
          var childCounter = 0;
          element.nodes.forEach(childelement => {
            nodeList[parentCounter].nodes.push(new Node(childelement.SongId, childelement.Label, childelement.LabelName, childelement.Artist, childelement.VideoUrl, childelement.AudioFile, childelement.JumpPoints, childelement.FilterType, childelement.CreatedByUserId, false, childelement.NoteflightScoreID, childelement.Lyrics, childelement.TransLations, childelement.LessonQueue, childelement.Midi, childelement.IsTeacherPlayed, childelement.IsStudentPlayed, [], childelement.TeacherItemName, childelement.StudentItemName));
            childCounter = childCounter + 1;
          });
        }
        parentCounter = parentCounter + 1;
      });
      return nodeList;
    } catch (ex) { }
  }

  onAutoPlayChange(value) {
    CommonService.autoPlay = value;
  }

  openRateTeacherDialog(): void {
    const dialogRef = this.dialog.open(RateTeacherDialogComponent, {
      maxHeight: '80vh'
    });
  }

  checkReviewByLessonGuid() {
    this.crudService.get('/student/CheckReviewByLessonGuid?lessonGuid=' + this.guidedvideoService.guidedLessonGuid, null).subscribe((response: any) => {
      if (response == true) {
        this.openRateTeacherDialog();
      }
      else {
        this.guidedvideoService.guidedLessonGuid = "";
      }
    });
  }
}