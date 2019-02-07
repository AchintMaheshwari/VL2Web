import { Component, OnInit, NgZone } from '@angular/core';
import { Node } from '../tree-view/node';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../common/common.service';
import { ActivatedRoute } from '@angular/router';
import { LobbyService } from '../../services/lobby.service';

declare var VidyoIOPlayer: any;
declare var VoiceLessons: any;
declare var VoiceLessonsExercisePlayer: any;
declare var LivePlayer: any;
@Component({
  selector: 'mobile-lessonplayer',
  templateUrl: './mobile-lessonplayer.component.html',
  styleUrls: ['./mobile-lessonplayer.component.scss']
})

export class MobileLessonPlayerComponent implements OnInit {
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
  userId:string;
  userRole : string;

  constructor(private mScrollbarService: MalihuScrollbarService,private activatedRoute: ActivatedRoute, private _ngZone: NgZone,
    private lobbyService: LobbyService,) {
    //this.nodes.push(new Node(Math.random().toString(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null,null, []));
    this.isNoteFlight = false;
    this.isVideo = false;
    this.isLyrics = false;
    this.isTranslation = false;
    this.initTreeViewCallbackEvents();
  }

  ngAfterViewInit() {
    this.mScrollbarService.initScrollbar('#libraryData', { axis: 'y', theme: 'dark-thick', scrollButtons: { enable: true } });
  }

  addTo($event: any) {    
    this.targetList.push($event.dragData);
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
    debugger;
    // this.teacherId = this.activatedRoute.snapshot.queryParams["teacherId"];
    // this.studentId = this.activatedRoute.snapshot.queryParams["studentId"];
    // this.displayName = this.activatedRoute.snapshot.queryParams["displayName"];
    // this.userId = this.activatedRoute.snapshot.queryParams["userId"];
    // this.userRole = this.activatedRoute.snapshot.queryParams["userRole"];

    //localStorage.setItem("LessonGuid", "726d2b24-b75e-4199-a338-d6f89709cb71");
    //localStorage.setItem("roomKey", "726d2b24b75e");
    localStorage.setItem("userRole", "teacher");
    localStorage.setItem("displayName", 'Rob');
    localStorage.setItem("userId", "250");

    if (window.location.hash == "#/mobile-player")
      this.isMobilePlayer = true;
    CommonService.isPlayerStarted = false;
    this.startLobbyLesson();
  }

  lessonQueueCallback(lessonQueueJsonObject) {    
    var arrayNodeList: any[] = lessonQueueJsonObject;
    var nodelist = this.lessonQueueFromJsonNodes(arrayNodeList);
    this.nodes = null;
    this.nodes = nodelist;   
    CommonService.parentNodeList = nodelist; 
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

  isPlayerStartedCallback(flag) {
    CommonService.isPlayerStarted = true;
  }

  initTreeViewCallbackEvents() {
    window['lessonQueueReference'] = {
      zone: this._ngZone,
      lessonQueueCallback: (value) => this.lessonQueueCallback(value),
      isPlayerStartedCallback: (value) => this.isPlayerStartedCallback(value),
      component: this,
    };
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