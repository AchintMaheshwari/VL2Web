import { Component, Input, NgZone, OnInit, trigger, state, style, transition, animate } from '@angular/core';
import { Node } from '../../../teacher/tree-view/node';
import { CommonService } from '../../../common/common.service';
import { DragLessonDialogComponent } from '../../../teacher/drag-lesson-dialog/drag-lesson-dialog.component';
import { MatDialog } from '../../../../../node_modules/@angular/material';
import { HttpParams } from '@angular/common/http';
import { CrudService } from '../../../services/crud.service';
import { LobbyService } from '../../../services/lobby.service';
import { ToastrService } from 'ngx-toastr';
import { PlaylistService } from '../../../services/playlist.service';

declare var VoiceLessons: any;
declare var VoiceLessonsExercisePlayer: any;
declare var LivePlayer: any;

@Component({
  selector: 'app-playlist-tree-view',
  templateUrl: './playlist-tree-view.component.html',
  styleUrls: ['./playlist-tree-view.component.scss'],
  animations: [
    trigger('animateState', [
      state('active', style({
        backgroundColor: '#1c1d1f'
      })),
      transition('* => *', animate(1500))
    ])
  ]
})
export class PlaylistTreeViewComponent implements OnInit {

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
    if (CommonService.isPlayListLoaded == false) {
      CommonService.isPlayListLoaded = true;
      this.getPlaylistLesson();
    }
  }

  ngOnDestroy(): void {
    CommonService.isPlayerStarted = false;
  }

  constructor(private playlistService: PlaylistService, public dialog: MatDialog, private lobbyService: LobbyService,
    public toastr: ToastrService, private crudService: CrudService) {
  }

  getPlaylistLesson() {
    this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));
    if (this.playlistService.LessonModel != null) {
      this.crudService.get('/lesson/GetLessonDetailsByLessonGuid?lessonGuid=' + this.playlistService.LessonModel.LessonGuid, null).subscribe((response: any) => {
        this.addLiveLessonQueue(response.LessonQueue);
        this.playlistService.LessonModel.LessonQueue=response.LessonQueue;
        localStorage.setItem("Playlist", JSON.stringify(this.playlistService.LessonModel));
      });
    } else {
      this.nodes = [];
      this.nodes.push(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
      this.playlistService.libraryNodes = this.nodes;
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DragLessonDialogComponent, {});
    dialogRef.afterClosed().subscribe(result => { })
  }


  addTo($event: any, parentNode) {
    $('.treeView-drag-over').toArray().forEach(element => {
      $(element).removeClass('treeView-drag-over');
    });
    let itemGuid = CommonService.getGuid();
    this.isChildAdded = false;
    var nodeLength = this.nodes.length;
    if ($event.dragData.FilterType == 'Lesson') {
      this.playlistService.event = $event;
      if (this.nodes[0].LabelName == 'Drag Here!...') {
        if ($event.dragData.LessonQueue != '') {
          var json = JSON.parse($event.dragData.LessonQueue);
          this.addLessonNodes(json, nodeLength, 'bottom', false);
          // this.updateLesson();
        }
      }
      else {
        this.openDragLessonPopUp($event);
      }
    }
    else {
      this.nodes.push(new Node($event.dragData.SongId, itemGuid, $event.dragData.LabelName, $event.dragData.Artist, $event.dragData.VideoUrl, $event.dragData.AudioFile, $event.dragData.JumpPoints, $event.dragData.FilterType, $event.dragData.CreatedByUserId, false, $event.dragData.NoteflightScoreID, $event.dragData.Lyrics, $event.dragData.TransLations, $event.dragData.LessonQueue, $event.dragData.Midi, $event.dragData.IsTeacherPlayed, $event.dragData.IsStudentPlayed, [], $event.dragData.TeacherItemName, $event.dragData.StudentItemName))
      for (let index = 0; index < nodeLength; index++) {
        if (this.nodes[0].LabelName == 'Drag Here!...') {
          this.nodes.splice(index, 1);
          break;
        }
      }
      this.playlistService.libraryNodes = this.nodes;
      if (this.playlistService.libraryNodes == undefined || this.playlistService.libraryNodes.length == 0) {
        this.playlistService.libraryHistoryNodes = this.nodes;
      }
      this.updateLesson();
    }

    if ($event.dragData.FilterType != 'Lesson') {
      setTimeout(() => {
        $('#customScroll').mCustomScrollbar('scrollTo', $('#div_' + itemGuid)[0].offsetTop);
        $('#div_' + itemGuid).animate({
          backgroundColor: "#ff159b"
        }, 2000);

        setTimeout(() => {
          $('#div_' + itemGuid).animate({
            backgroundColor: "#1c1d1f"
          }, 2000);
        }, 2000);

      }, 10);
    }
  }

  dropToChild(itemGuid) {
    setTimeout(() => {
      $('#customScroll').mCustomScrollbar('scrollTo', $('#div_' + itemGuid)[0].offsetTop);
      $('#div_' + itemGuid).animate({
        backgroundColor: "#ff159b"
      }, 2000);

      setTimeout(() => {
        $('#div_' + itemGuid).animate({
          backgroundColor: "#1c1d1f"
        }, 2000);
      }, 2000);

    }, 10);
  }

  updateLesson() {
    this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));
    if (this.playlistService.LessonModel != null) {
      if (this.playlistService.LessonModel.LessonId != 0) {
        for (let index = 0; index < this.playlistService.libraryNodes.length; index++) {
          if (this.playlistService.libraryNodes[0].LabelName == 'Drag Here!...') {
            this.playlistService.libraryNodes.splice(index, 1);
            break;
          }
        }
        if (this.playlistService.libraryNodes.length > 0) {
          this.playlistService.LessonModel.LessonQueue = JSON.stringify(this.playlistService.libraryNodes);
        } else {
          this.playlistService.LessonModel.LessonQueue = "";
        }

        this.playlistService.LessonModel.LessonHistory = JSON.stringify(this.playlistService.libraryHistoryNodes);
        this.playlistService.LessonModel.IsLessonQueueChange = true;
        if (this.playlistService.LessonModel.Tags == null) {
          this.playlistService.LessonModel.Tags = "";
        }
        this.playlistService.post('/lesson/UpsertLesson', this.playlistService.LessonModel, new HttpParams()).subscribe((response: any) => {
          this.playlistService.LessonModel.LessonQueue = response.LessonQueue;
          this.playlistService.LessonModel.IsLessonQueueChange = false;
          localStorage.setItem('Playlist', JSON.stringify(this.playlistService.LessonModel));
          if (response.LessonQueue == "") {
            this.addLiveLessonQueue(response.LessonQueue);
          }

          this.toastr.success("Lesson Queue updated successfully.");

        });
      }
    }
  }

  openDragLessonPopUp(event) {
    const dialogRef = this.dialog.open(DragLessonDialogComponent, {});
  }

  LessonAddPosition(position, isPopUp = false) {
    this.nodes = this.playlistService.libraryNodes;
    var nodeLength = this.nodes.length;
    if (this.playlistService.event.dragData.LessonQueue != '') {
      var json = JSON.parse(this.playlistService.event.dragData.LessonQueue);
      this.addLessonNodes(json, nodeLength, position, isPopUp);
      // this.updateLesson();
    }
  }

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
        //if (!isPopUp)                
        this.nodes.push(new Node(nodelist[i].SongId, CommonService.getGuid(), nodelist[i].LabelName, nodelist[i].Artist, nodelist[i].VideoUrl, nodelist[i].AudioFile, nodelist[i].JumpPoints, nodelist[i].FilterType, nodelist[i].CreatedByUserId, false, nodelist[i].NoteflightScoreID, nodelist[0].Lyrics, nodelist[i].TransLations, nodelist[i].LessonQueue, nodelist[i].Midi, nodelist[i].IsTeacherPlayed, nodelist[i].IsStudentPlayed, nodelist[i].nodes, nodelist[i].TeacherItemName, nodelist[i].StudentItemName));
      }
      else {
        CommonService.currentParentNodeList.push(new Node(nodelist[i].SongId, CommonService.getGuid(), nodelist[i].LabelName, nodelist[i].Artist, nodelist[i].VideoUrl, nodelist[i].AudioFile, nodelist[i].JumpPoints, nodelist[i].FilterType, nodelist[i].CreatedByUserId, false, nodelist[i].NoteflightScoreID, nodelist[0].Lyrics, nodelist[i].TransLations, nodelist[i].LessonQueue, nodelist[i].Midi, nodelist[i].IsTeacherPlayed, nodelist[i].IsStudentPlayed, nodelist[i].nodes, nodelist[i].TeacherItemName, nodelist[i].StudentItemName));
      }
    }
    this.playlistService.libraryNodes = this.nodes;
    this.playlistService.libraryHistoryNodes = this.nodes;
    CommonService.currentParentNodeList = this.nodes;
    CommonService.parentNodeList = this.playlistService.libraryNodes;
    //this.updateLesson();
    if (isPopUp)
      this.nodes = CommonService.currentParentNodeList;
  }

  convertLessonToNodes(songNodes: any): Array<Node> {
    if (songNodes == undefined) return;
    var nodeList = new Array<Node>();
    var parentCounter = 0;
    songNodes.forEach(element => {
      nodeList.push(new Node(element.SongId, CommonService.getGuid(), element.LabelName, element.Artist, element.VideoUrl, element.AudioFile, element.JumpPoints, element.FilterType, element.CreatedByUserId, false, element.NoteflightScoreID, element.Lyrics, element.TransLations, element.LessonQueue, element.Midi, element.IsTeacherPlayed, element.IsStudentPlayed, [], element.TeacherItemName, element.StudentItemName));
      if (element.nodes.length != 0) {
        var childCounter = 0;
        element.nodes.forEach(childelement => {
          nodeList[parentCounter].nodes.push(new Node(childelement.SongId, CommonService.getGuid(), childelement.LabelName,
            childelement.Artist, childelement.VideoUrl, childelement.AudioFile, childelement.JumpPoints, childelement.FilterType,
            childelement.CreatedByUserId, false, childelement.NoteflightScoreID, childelement.Lyrics, childelement.TransLations,
            childelement.LessonQueue, childelement.Midi, childelement.IsTeacherPlayed, childelement.IsStudentPlayed, [],
            childelement.TeacherItemName, childelement.StudentItemName));
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
      LivePlayer.sendLessonQueueObject(this.playlistService.libraryNodes);
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
    this.playlistService.post('/lesson/trackMediaPlayed', playedItem, null).subscribe((result: any) => {
    });
  }

  playCurrentSong(music, option = null) {
    this.trackMediaPlayed(music)
    VoiceLessons.destoryPlayer();
    VoiceLessonsExercisePlayer.stopMusic();
    localStorage.setItem('currentItemGuid', music.Label);
    if (music == undefined) return;
    var playList = [];
    if (music.FilterType == 'Song') {
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

      $('#excrisePlayer').hide();
      $('#audioPlayer').show();
    }
    else {
      if (music.Midi == '' || music.Midi == undefined) return;
      var exceriseObj = JSON.parse(music.Midi);
      exceriseObj.name = (music.TeacherItemName != undefined && music.TeacherItemName != null) ? music.TeacherItemName : music.LabelName;
      var excerisePlayList = "[";
      excerisePlayList += JSON.stringify(exceriseObj) + ',';
      excerisePlayList = excerisePlayList.substr(0, excerisePlayList.length - 1);
      excerisePlayList += "]";
      VoiceLessonsExercisePlayer.initPlayer(excerisePlayList, music.Label, this.exceriseCallback, '#excrisePlayer');
      if (option == 'SNP')
        VoiceLessonsExercisePlayer.stopMusic();

      $('#excrisePlayer').show();
      $('#audioPlayer').hide();
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
          this.playlistService.libraryHistoryNodes[parentCounter].IsTeacherPlayed = true;
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
              this.playlistService.libraryHistoryNodes[parentCounter].nodes[childCounter].IsTeacherPlayed = true
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

  delete(index: number, data: Array<Node>, parentNode) {
    var nextItem = null;
    if (localStorage.getItem('currentItemGuid') == data[index].Label)
      nextItem = this.findNextSongItem(localStorage.getItem('currentItemGuid'));
    if (parentNode.length == 1 && parentNode[0].Label == 'Drag Here!...') {
      parentNode.unshift(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
      data.splice(index + 1, 1);
    }
    else
      data.splice(index, 1);
    if (this.playlistService.libraryNodes.length == 0) {
      data.push(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
      $('#excrisePlayer').hide();
      $('#audioPlayer').hide();

    }
    CommonService.parentNodeList = this.playlistService.libraryNodes;
    if (this.playlistService.location != null) {
      if (localStorage.getItem('userRole') == 'Teacher' && this.playlistService.location.toLocaleLowerCase() == 'videoconnected') {
        LivePlayer.sendLessonQueueObject(this.playlistService.libraryNodes);
        if (VoiceLessons.audio != null && data[0].LabelName != 'Drag Here!...') {
          LivePlayer.sendLessonQueueItem(nextItem.Label);
          this.playCurrentSong(nextItem);
        }
      }
    }
    this.updateLesson();
  }

  add(index: number, currentNode, parentNode) {

    this.isChildAdded = true;
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].LabelName == "_emptynode_") {
        this.nodes.splice(i, 1);
        break;
      }
    }
    currentNode.nodes.unshift(new Node(currentNode.SongId, CommonService.getGuid(), currentNode.LabelName, currentNode.Artist, currentNode.VideoUrl, currentNode.AudioFile, currentNode.JumpPoints, currentNode.FilterType, currentNode.CreatedByUserId, false, currentNode.NoteflightScoreID, currentNode.Lyrics, currentNode.TransLations, currentNode.LessonQueue, currentNode.Midi, false, false, [], currentNode.TeacherItemName, currentNode.StudentItemName));

    CommonService.parentNodeList = parentNode;
    this.updateLesson();
  }

  bindLiveLesson() {
    var LessonId = 83
    if (LessonId != null && LessonId != 0) {
      this.crudService.post('/lesson/CopyLesson?lessonId=' + LessonId, null).subscribe((response: any) => {
        this.addLiveLessonQueue(response.LessonQueue);
      });
    }
    CommonService.parentNodeList = [];
  }

  getLessonQueue() {
    var LessonGuid = localStorage.getItem('LessonGuid');
    if (LessonGuid != null && LessonGuid != "") {
      this.crudService.get('/lesson/GetLessonDetailsByLessonGuid?lessonGuid=' + LessonGuid, null).subscribe((response: any) => {
        this.playlistService.LessonModel = response;
        CommonService.isPlayListLoaded = true;
        this.addLiveLessonQueue(response.LessonQueue);
        localStorage.setItem('Playlist', JSON.stringify(this.playlistService.LessonModel));
      });
    }
  }

  getEditLessonQueue() {
    if (this.playlistService.LessonModel.LessonId != null && this.playlistService.LessonModel.LessonId != 0) {
      this.crudService.get('/lesson/GetLessonDetailsById?lessonId=' + this.playlistService.LessonModel.LessonId, null).subscribe((response: any) => {
        this.playlistService.LessonModel = response;
        this.addLiveLessonQueue(response.LessonQueue);
        localStorage.setItem('Playlist', JSON.stringify(this.playlistService.LessonModel));
      });
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

  renameItems(itemName) {
    var nextItem = this.findCurrentSongItem(localStorage.getItem('currentItemGuid'));
    nextItem.TeacherItemName = itemName;
    $('#lblExceriseItemId').html(itemName); $('#exceriseItemId').val(itemName);
    $('#lblSongItemId').html(itemName); $('#txtSongItemId').val(itemName);
    $('#lblExceriseItemId').show(); $('#exceriseItemId').hide();
    $('#lblSongItemId').show(); $('#txtSongItemId').hide();
    if (this.playlistService.location != null) {
      if (localStorage.getItem('userRole') == 'Teacher' && this.playlistService.location.toLocaleLowerCase() == 'videoconnected') {
        LivePlayer.sendLessonQueueObject(this.playlistService.libraryNodes);
      }
    }
    //this.updateLesson();
  }

  UpdateAttendee(roomAttendee) {
    this.lobbyService.UpdateAttendee(roomAttendee).subscribe((data: any) => {
      data.forEach(element => {
        LivePlayer.changeUserLobbyStatus(element);
      });
    });
  }

  songItemNameChanged(music) {
    if (localStorage.getItem('userRole') == 'Teacher' && music.TeacherItemName != $('#txtItemName_' + music.Label).val()) {
      var item = this.findCurrentSongItem(music.Label);
      music.TeacherItemName = $('#txtItemName_' + music.Label).val();
      $('#lblItemName_' + music.Label).show();
      $('#txtItemName_' + music.Label).hide();
      LivePlayer.sendLessonQueueObject(this.playlistService.libraryNodes);
      //this.updateLesson();
    }
  }

  labelItemClick(music) {
    if (localStorage.getItem('userRole') == 'Teacher') {
      $('.lblItemClass').show();
      $('.txtItemClass').hide();
      $('#lblItemName_' + music.Label).hide();
      $('#lblItemName_' + music.Label).hide();
      $('#txtItemName_' + music.Label).show();
      $('#txtItemName_' + music.Label).focus();
    }
  }

  onDragEnter($event: any) {
    $($event.mouseEvent.target).parent('li').addClass('treeView-drag-over');
  }

  onDragLeave($event: any) {
    $($event.mouseEvent.target).parent('li').removeClass('treeView-drag-over');
  }
}   
