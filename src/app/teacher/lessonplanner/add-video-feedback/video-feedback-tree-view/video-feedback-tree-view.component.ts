import { Component, Input, OnDestroy, NgZone, OnInit, trigger, state, style, transition, animate } from '@angular/core';
import { Node } from '../../../tree-view/node';
import { CommonService } from '../../../../common/common.service';
import { DragLessonDialogComponent } from '../../../drag-lesson-dialog/drag-lesson-dialog.component';
import { MatDialog } from '../../../../../../node_modules/@angular/material';
import { CrudService } from '../../../../services/crud.service';
import { LobbyService } from '../../../../services/lobby.service';
import { ToastrService } from 'ngx-toastr';
import { GuidedvideoService } from '../../../../services/guidedvideo.service';
import { ActivatedRoute } from '../../../../../../node_modules/@angular/router';

declare var VoiceLessons: any;
declare var VoiceLessonsExercisePlayer: any;
declare var VoiceLessonsExercisePlayer: any;
declare var LivePlayer: any;
declare var VoicelessonsVideoPlayer: any;
declare var VoicelessonsGuidedVideoPlayer: any;

@Component({
  selector: 'app-video-feedback-tree-view',
  templateUrl: './video-feedback-tree-view.component.html',
  animations: [
    trigger('animateState', [
      state('active', style({
        backgroundColor: '#1c1d1f'
      })),
      transition('* => *', animate(1500))
    ])
  ]
})
export class VideoFeedbackTreeViewComponent implements OnInit, OnDestroy {
  isFirstVido: boolean = false;


  songsData: any[];
  @Input() nodes: Array<Node>;
  expanded = true;
  zone: string;
  uniqueId: string;
  counter = 0;
  parentNode: Array<Node> = [];
  lessonQueue: string = null;
  currentSongNo: any;
  childNode: Array<Node>;
  isChildAdded = false;
  isPlayerStarted = false;
  currentItemGuid = '';
  isVideoConnectedPage = false;
  EditLesson: String = "";
  isItemDragged: boolean = false;

  ngOnInit(): void {
    if (CommonService.isGVLessonQueueLoaded == false) {
      CommonService.isGVLessonQueueLoaded = true;
      this.getGuidedVideoInstructionLesson();
    }

  }

  ngOnDestroy(): void {
    CommonService.isPlayerStarted = false;
    CommonService.isGVLessonQueueLoaded=false;
  }

  constructor(private guidedvideoService: GuidedvideoService, public dialog: MatDialog, private lobbyService: LobbyService,
    public toastr: ToastrService, private crudService: CrudService, private _ngZone: NgZone, private activatedRoute: ActivatedRoute) {
  }

  getGuidedVideoInstructionLesson() {
    this.crudService.get('/lesson/GetLessonDetailsByLessonGuid?lessonGuid=' + CommonService.guidedLessonInstructionGuid, null).subscribe((response: any) => {
      this.addLiveLessonQueue(response.LessonQueue);
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DragLessonDialogComponent, {});
    dialogRef.afterClosed().subscribe(result => { })
  }


  addBackgroundColor(itemGuid) {
    $('#div_' + itemGuid).css('background-color', '#ff159b');
  }

  fistVideoItem: any;

  addLessonNodes(nodedata, nodeLength, position, isPopUp) {
    var nodelist: any;
    var counter = 0;
    nodelist = this.convertLessonToNodes(nodedata);
    if (position == 'bottom') {
      for (let index = 0; index < nodeLength; index++) {
        if (this.nodes[0].LabelName == 'Drag Here!...') {
          this.nodes.splice(index, 1);
          break;
        }
      }
    }
    else {
      if (nodeLength > 0) {
        while (nodeLength--) {
          this.nodes.splice(nodeLength, 1);
        }
      }
    }
    for (var i = 0; i < nodelist.length; i++) {
      if (!this.isChildAdded) {
        this.nodes.push(new Node(nodelist[i].SongId, CommonService.getGuid(), nodelist[i].LabelName, nodelist[i].Artist, nodelist[i].VideoUrl, nodelist[i].AudioFile, nodelist[i].JumpPoints, nodelist[i].FilterType, nodelist[i].CreatedByUserId, false, nodelist[i].NoteflightScoreID, nodelist[0].Lyrics, nodelist[i].TransLations, nodelist[i].LessonQueue, nodelist[i].Midi, nodelist[i].IsTeacherPlayed, nodelist[i].IsStudentPlayed, nodelist[i].nodes, nodelist[i].TeacherItemName, nodelist[i].StudentItemName));
      }
      else {
        CommonService.currentParentNodeList.push(new Node(nodelist[i].SongId, CommonService.getGuid(), nodelist[i].LabelName, nodelist[i].Artist, nodelist[i].VideoUrl, nodelist[i].AudioFile, nodelist[i].JumpPoints, nodelist[i].FilterType, nodelist[i].CreatedByUserId, false, nodelist[i].NoteflightScoreID, nodelist[0].Lyrics, nodelist[i].TransLations, nodelist[i].LessonQueue, nodelist[i].Midi, nodelist[i].IsTeacherPlayed, nodelist[i].IsStudentPlayed, nodelist[i].nodes, nodelist[i].TeacherItemName, nodelist[i].StudentItemName));
      }
    }
    this.guidedvideoService.libraryNodes = this.nodes;
    this.guidedvideoService.libraryHistoryNodes = this.nodes;
    CommonService.currentParentNodeList = this.nodes;
    CommonService.parentNodeList = this.guidedvideoService.libraryNodes;
    if (isPopUp)
      this.nodes = CommonService.currentParentNodeList;
    // Play first Default Video
    debugger;
    (this.isFirstVido)    
    this.playCurrentSong(this.fistVideoItem, 'PT');
  }

  convertLessonToNodes(songNodes: any): Array<Node> {

    if (songNodes == undefined) return;
    var nodeList = new Array<Node>();
    var parentCounter = 0;
    songNodes.forEach(element => {

      let newParentNode = new Node(element.SongId, CommonService.getGuid(), element.LabelName, element.Artist, element.VideoUrl, element.AudioFile, element.JumpPoints, element.FilterType, element.CreatedByUserId, false, element.NoteflightScoreID, element.Lyrics, element.TransLations, element.LessonQueue, element.Midi, element.IsTeacherPlayed, element.IsStudentPlayed, [], element.TeacherItemName, element.StudentItemName);
      if (element.FilterType == 'Video' && !this.isFirstVido) {
        this.isFirstVido = true;
        this.fistVideoItem = newParentNode
      }
      nodeList.push(newParentNode);
      if (element.nodes.length != 0) {
        var childCounter = 0;
        element.nodes.forEach(childelement => {

          let newChildNode = new Node(childelement.SongId, CommonService.getGuid(), childelement.LabelName,
            childelement.Artist, childelement.VideoUrl, childelement.AudioFile, childelement.JumpPoints, childelement.FilterType,
            childelement.CreatedByUserId, false, childelement.NoteflightScoreID, childelement.Lyrics, childelement.TransLations,
            childelement.LessonQueue, childelement.Midi, childelement.IsTeacherPlayed, childelement.IsStudentPlayed, [],
            childelement.TeacherItemName, childelement.StudentItemName);

          if (element.FilterType == 'Video' && !this.isFirstVido) {
            this.isFirstVido = true;
            this.fistVideoItem = newChildNode;
          }
          nodeList[parentCounter].nodes.push(newChildNode);
          childCounter = childCounter + 1;
        });
      }
      parentCounter = parentCounter + 1;
    });
    return nodeList;
  }

  // Bind Lesson Queue 
  lessonQueueFromJsonNodes(songNodes: any): Array<Node> {
    if (songNodes == undefined) return;
    var nodeList = new Array<Node>();
    var parentCounter = 0;
    songNodes.forEach(element => {
      nodeList.push(new Node(element.SongId, element.Label, element.LabelName, element.Artist, element.VideoUrl, element.AudioFile, element.JumpPoints, element.FilterType, element.CreatedByUserId, false, element.NoteflightScoreID, element.Lyrics, element.TransLations, element.LessonQueue, element.Midi, element.IsTeacherPlayed, element.IsStudentPlayed, [], element.TeacherItemName, element.StudentItemName));
      if (element.nodes.length != 0) {
        var childCounter = 0;
        element.nodes.forEach(childelement => {
          nodeList[parentCounter].nodes.push(new Node(childelement.SongId, childelement.Label, childelement.LabelName,
            childelement.Artist, childelement.VideoUrl, childelement.AudioFile, childelement.JumpPoints,
            childelement.FilterType, childelement.CreatedByUserId, false, childelement.NoteflightScoreID,
            childelement.Lyrics, childelement.TransLations, childelement.LessonQueue, childelement.Midi,
            childelement.IsTeacherPlayed, childelement.IsStudentPlayed, [], childelement.TeacherItemName,
            childelement.StudentItemName));
          childCounter = childCounter + 1;
        });
      }
      parentCounter = parentCounter + 1;
    });
    return nodeList;
  }

  addLiveLessonQueue(lessonQueue) {
    this.nodes = [];
    this.nodes.push(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
    if (lessonQueue != "" && lessonQueue != null) {
      var json = JSON.parse(lessonQueue);
      this.addLessonNodes(json, 1, 'overwrite', false);
    }
  }

  // take all node.ts code here

  playSong(currentSongNo, NodeList, option) {
    if (!CommonService.isPlayerStarted)
      LivePlayer.sendLessonQueueObject(this.guidedvideoService.libraryNodes);
    if (option == 'PA') {
      LivePlayer.sendLessonQueueItem(NodeList[currentSongNo].Label);
      this.playCurrentSong(NodeList[currentSongNo]);
    }
    else if (option == 'PT') {
      this.playCurrentSong(NodeList[currentSongNo]);
    }
    else if (option == 'PS') {
      LivePlayer.sendLessonQueueItem(NodeList[currentSongNo].Label);
    }
    else if (option == 'SNP') {
      LivePlayer.sendLessonQueueItem(NodeList[currentSongNo].Label + ',' + 'SNP');
    }
    this.currentSongNo = currentSongNo;
  }


  trackMediaPlayed(music) {        
    let playedItem = {
        "UserId": CommonService.getUser().UserId,
        "PlayerItemId": music.SongId,
        "ItemType": music.FilterType,
    }
    this.guidedvideoService.post('/lesson/trackMediaPlayed', playedItem, null).subscribe((result: any) => {            
    });
}

  playCurrentSong(music, option = null) {
    this.trackMediaPlayed(music);
    //color current playing Item
    $('.treeView-drag-over').toArray().forEach(element => {
      $(element).removeClass('treeView-drag-over');
    });
    //$('#div_' + music.Label).addClass('treeView-drag-over');
    //$('#customScroll').mCustomScrollbar('scrollTo', $('#div_' + music.Label)[0].offsetTop);

    VoiceLessons.destoryPlayer();
    VoiceLessonsExercisePlayer.stopMusic();
    $('#videoPlayer').html('');
    $('#divVideoPlayer').html('');
    $('#divVideoPlayer').hide();
    localStorage.setItem('currentItemGuid', music.Label);
    if (music == undefined) return;
    var playList = [];
    if (music.FilterType == 'Song') {
      if (music.AudioFile.includes("youtube.com") || music.AudioFile.includes("vimeo.com") || music.AudioFile.includes("dailymotion.com")
        || music.AudioFile.includes("wistia") || music.AudioFile.includes(".mp4")) {
        if (this.activatedRoute.snapshot.routeConfig.path.includes('videoConnected'))
          VoicelessonsVideoPlayer.init('#videoPlayer', music.AudioFile, music.LabelName, null);
        else
          VoicelessonsGuidedVideoPlayer.init('#videoPlayer', music.AudioFile, music.LabelName, null);
        $('#videoPlayer').show();
        $('#excrisePlayer').hide();
        $('#audioPlayer').hide();
      }
      else {
        var song = {
          'src': music.AudioFile,
          'jumpPoints': music.JumpPoints != '' ? JSON.parse(music.JumpPoints) : '',
          'tittle': (music.TeacherItemName != undefined && music.TeacherItemName != null) ? music.TeacherItemName : music.LabelName,
          'label': music.Label,
          'played': music.Played,
          'noteFlightId': music.NoteflightScoreID,
          'lyrics': music.Lyrics,
          'translation': music.TransLations,
        }
        playList.push(song);
        var fileType = song.src.toString().includes(".mid") == true ? 'mid' : 'song';
        VoiceLessons.AudioPlayer('#audioPlayer', playList, this.voiceLessonsMusicCallback, 0, fileType);
        if (option == 'SNP')
          VoiceLessons.audio.pause();
        $('#videoPlayer').hide();
        $('#excrisePlayer').hide();
        $('#audioPlayer').show();
      }

    }
    else if (music.FilterType == 'Video') {
      $('#videoPlayer').show();
      $('#excrisePlayer').hide();
      $('#audioPlayer').hide();
      debugger;
      if (this.activatedRoute.snapshot.routeConfig.path.includes('videoConnected') || this.activatedRoute.snapshot.routeConfig.path.includes('student/guidedvideofeedback/add-video'))
        VoicelessonsVideoPlayer.init('#videoPlayer', music.VideoUrl, music.LabelName, null);
      else
        VoicelessonsGuidedVideoPlayer.init('#videoPlayer', music.VideoUrl, music.LabelName, null);
    }
    else {
      try {
        debugger;
        if (music.Midi == '' || music.Midi == undefined) return;
        var exceriseObj = JSON.parse(music.Midi);
        exceriseObj.name = (music.TeacherItemName != undefined && music.TeacherItemName != null) ? music.TeacherItemName : music.LabelName;
        var excerisePlayList = "[";
        excerisePlayList += JSON.stringify(exceriseObj) + ',';
        excerisePlayList = excerisePlayList.substr(0, excerisePlayList.length - 1);
        excerisePlayList += "]";
        VoiceLessonsExercisePlayer.initPlayer(excerisePlayList, music.Label, this.exceriseCallback, '#excrisePlayer');
        //this.sharedLibrary.AdvanceSettingExerciseId = music.SongId;
        if (option == 'SNP')
          VoiceLessonsExercisePlayer.stopMusic();

        $('#excrisePlayer').show();
        $('#audioPlayer').hide();
        $('#videoPlayer').hide();
      }
      catch{
        var song = {
          'src': music.Midi,
          'jumpPoints': music.JumpPoints != '' ? JSON.parse(music.JumpPoints) : '',
          'tittle': (music.TeacherItemName != undefined && music.TeacherItemName != null) ? music.TeacherItemName : music.LabelName,
          'label': music.Label,
          'played': music.Played,
          'noteFlightId': music.NoteflightScoreID,
          'lyrics': music.Lyrics,
          'translation': music.TransLations,
        }
        playList.push(song);
        var fileType = song.src.toString().includes(".mid") == true ? 'mid' : 'song';
        VoiceLessons.AudioPlayer('#audioPlayer', playList, this.voiceLessonsMusicCallback, 0, fileType);
        if (option == 'SNP')
          VoiceLessons.audio.pause();
        $('#videoPlayer').hide();
        $('#excrisePlayer').hide();
        $('#audioPlayer').show();
      }
    }
  }

  updateLessonQueueHistory(guid) {
    var isPlayNode = false;
    var parentCounter = 0;
    var i = 0;
    var nodeIteam = null;
    if (CommonService.parentNodeList == undefined)
      return;

    CommonService.parentNodeList.forEach(element => {
      //-----------------Parent Node------------------------------------
      if (isPlayNode == false) {
        if (element.Label == guid) {
          isPlayNode = true;
          this.guidedvideoService.libraryHistoryNodes[parentCounter].IsTeacherPlayed = true;
        }
        parentCounter = parentCounter + 1;
      }
    });

    parentCounter = 0;
    //-----------------Child Node----------------------------------------------
    if (isPlayNode == false) {
      CommonService.parentNodeList.forEach(element => {
        if (element.nodes.length != 0 && isPlayNode == false) {
          var childCounter = 0;
          element.nodes.forEach(childelement => {
            if (childelement.Label == guid && isPlayNode == false) {
              isPlayNode = true;
              this.guidedvideoService.libraryHistoryNodes[parentCounter].nodes[childCounter].IsTeacherPlayed = true
            }
            childCounter = childCounter + 1;
          });
        }
        parentCounter = parentCounter + 1;
      });
    }
    parentCounter = 0;
  }

  exceriseCallback(itemGuid) {
    if (CommonService.autoPlay && localStorage.getItem('userRole') == 'Teacher') {
      var nextItem = this.findNextSongItem(itemGuid);
      LivePlayer.sendLessonQueueItem(nextItem.Label);
      this.playCurrentSong(nextItem);
    }
  }

  voiceLessonsMusicCallback(completedSong) {
    if (CommonService.autoPlay && localStorage.getItem('userRole') == 'Teacher') {
      var nextItem = this.findNextSongItem(completedSong.label);
      LivePlayer.sendLessonQueueItem(nextItem.Label);
      this.playCurrentSong(nextItem);
    }
  }

  findNextSongItem(guid): any {
    var i = 0;
    var nodeIteam = null;
    if (CommonService.parentNodeList == undefined)
      return;
    CommonService.parentNodeList.forEach(element => {

      var j = 0
      if (element.Label == guid && element.nodes.length > 0) {
        nodeIteam = element.nodes[j];
      }
      else if (element.Label == guid && element.nodes.length == 0 && (CommonService.parentNodeList.length - 1) == i) {
        nodeIteam = CommonService.parentNodeList[0];
      }
      else if (element.Label == guid && element.nodes.length == 0 && (CommonService.parentNodeList.length - 1) > i) {
        nodeIteam = CommonService.parentNodeList[i + 1];
      }
      else {
        element.nodes.forEach(node => {
          if (node.Label == guid) {
            if (element.nodes.length - 1 > j)
              nodeIteam = element.nodes[j + 1];
            else if (CommonService.parentNodeList.length - 1 > i)
              nodeIteam = CommonService.parentNodeList[i + 1];
            else
              nodeIteam = CommonService.parentNodeList[0];
          }
          j++;
        });
      }
      i++;
    });
    return nodeIteam;
  }

  findPreviousSongItem(guid): any {
    var i = 0;
    var nodeIteam = null;
    if (CommonService.parentNodeList == undefined)
      return;
    CommonService.parentNodeList.forEach(element => {
      var j = 0
      if (element.Label == guid && element.nodes.length > 0) {
        nodeIteam = element.nodes[j];
      }
      else if (element.Label == guid && element.nodes.length == 0 && (CommonService.parentNodeList.length - 1) == i) {
        nodeIteam = CommonService.parentNodeList[0];
      }
      else if (element.Label == guid && element.nodes.length == 0 && (CommonService.parentNodeList.length - 1) > i) {
        nodeIteam = CommonService.parentNodeList[i + 1];
      }
      else {
        element.nodes.forEach(node => {
          if (node.Label == guid) {
            if (element.nodes.length - 1 > j)
              nodeIteam = element.nodes[j + 1];
            else if (CommonService.parentNodeList.length - 1 > i)
              nodeIteam = CommonService.parentNodeList[i + 1];
            else
              nodeIteam = CommonService.parentNodeList[0];
          }
          j++;
        });
      }
      i++;
    });
    return nodeIteam;
  }

  findCurrentSongItem(guid): any {
    var isPlayNode = false;
    var parentCounter = 0;
    var i = 0;
    var nodeIteam = null;
    if (CommonService.parentNodeList == undefined)
      return;

    CommonService.parentNodeList.forEach(element => {
      //-----------------Parent Node------------------------------------
      if (isPlayNode == false) {
        if (element.Label == guid) {
          isPlayNode = true;
          nodeIteam = CommonService.parentNodeList[parentCounter];
        }
        parentCounter = parentCounter + 1;
      }
    });

    parentCounter = 0;
    //-----------------Child Node----------------------------------------------
    if (isPlayNode == false) {
      CommonService.parentNodeList.forEach(element => {
        if (element.nodes.length != 0 && isPlayNode == false) {
          var childCounter = 0;
          element.nodes.forEach(childelement => {
            if (childelement.Label == guid && isPlayNode == false) {
              isPlayNode = true;
              nodeIteam = CommonService.parentNodeList[parentCounter].nodes[childCounter];
            }
            childCounter = childCounter + 1;
          });
        }
        parentCounter = parentCounter + 1;
      });
    }

    parentCounter = 0;
    //-----------------Sub Child Node----------------------------------------------
    if (isPlayNode == false) {
      CommonService.parentNodeList.forEach(element => {
        if (element.nodes.length != 0 && isPlayNode == false) {
          var childCounter = 0;
          var subChildCounter = 0;
          element.nodes.forEach(childelement => {

            if (childelement.nodes.length != 0 && isPlayNode == false) {
              childelement.nodes.forEach(subchildelement => {
                if (subchildelement.Label == guid && isPlayNode == false) {
                  isPlayNode = true;
                  nodeIteam = CommonService.parentNodeList[parentCounter].nodes[childCounter].nodes[subChildCounter];
                }
                subChildCounter = subChildCounter + 1;
              });
            }
            childCounter = childCounter + 1;
          });
        }
        parentCounter = parentCounter + 1;
      });
    }
    return nodeIteam;
  }

  playedIteamCallback(itemGuid) {
    var item = this.findCurrentSongItem(itemGuid.split(',')[0]);
    this.playCurrentSong(item, itemGuid.split(',')[1]);
  }

  isPlayerStartedCallback(flag) {
    CommonService.isPlayerStarted = true;
  }

  playNextItem() {
    var item = this.findNextSongItem(localStorage.getItem('currentItemGuid'));
    this.playCurrentSong(item);
    LivePlayer.sendLessonQueueItem(item.Label);
  }

  playPreviousItem() {
    var item = this.findPreviousSongItem(localStorage.getItem('currentItemGuid'));
    this.playCurrentSong(item);
    LivePlayer.sendLessonQueueItem(item.Label);
  }

  onDragEnter($event: any) {
    $($event.mouseEvent.target).parent('li').addClass('treeView-drag-over');
  }

  onDragLeave($event: any) {
    $($event.mouseEvent.target).parent('li').removeClass('treeView-drag-over');
  }
}   
