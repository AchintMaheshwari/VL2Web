import { Component, OnInit, NgZone } from '@angular/core';
import { Node } from '../../../tree-view/node';
import { SharedlibraryService } from '../../../../services/sharedlibrary.service';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../../../common/common.service';
import { MatDialog } from '@angular/material';
import { AdvancedSearchDialogComponent } from '../../../../advanced-search-dialog/advanced-search-dialog.component';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-video-lesson-queue',
  templateUrl: './add-video-lesson-queue.component.html',
  styleUrls: ['./add-video-lesson-queue.component.scss']
})
export class AddVideoLessonQueueComponent implements OnInit {

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
  
  selectedbutton: string;

  
  isMobilePlayer: boolean = false;
  isLiveLesson = false;
  userType: string;
  editorContent: string;
  window: any;

  constructor(public dialog: MatDialog, private mScrollbarService: MalihuScrollbarService, public sharedLibrary: SharedlibraryService
    , public toastr: ToastrService, private _ngZone: NgZone) {
  }

  ngAfterViewInit() {
    this.mScrollbarService.initScrollbar('#libraryData', { axis: 'y', theme: 'dark-thick', scrollButtons: { enable: true } });
  }

  addTo($event: any) {
    debugger;
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
    this.isLiveLesson = window.location.hash.includes('lesson-planner') == true ? false : true;
    this.window = window;
    if (window.location.hash == "#/mobile-player")
      this.isMobilePlayer = true;
    CommonService.isPlayerStarted = false;
    this.userType = localStorage.getItem('UserType');

    setTimeout(function () {
      debugger;
      if (localStorage.getItem('UserType') == 'Student') {
        this.window.disableFroalaEditor();
        $('#btnSaveEditor').attr('disabled', 'disabled');
      }
    },100);
  }


  onAutoPlayChange(value) {
    CommonService.autoPlay = value;
  }

  lessonQueueCallback(lessonQueueJsonObject) {
    debugger;
    var arrayNodeList: any[] = lessonQueueJsonObject;
    var nodelist = this.lessonQueueFromJsonNodes(arrayNodeList);
    this.nodes = null;
    this.nodes = nodelist;
    CommonService.parentNodeList = nodelist;
    this.sharedLibrary.libraryNodes = nodelist;
    this.sharedLibrary.libraryHistoryNodes = nodelist;
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
            // if (childelement.nodes.length != 0) {
            //   var subchildCounter = 0;
            //   childelement.nodes.forEach(subchildelement => {
            //     nodeList[parentCounter].nodes[childCounter].nodes.push(new Node(subchildelement.SongId,subchildelement.Label, subchildelement.LabelName, subchildelement.Artist, subchildelement.VideoUrl, subchildelement.AudioFile, subchildelement.JumpPoints, subchildelement.FilterType, subchildelement.CreatedByUserId, false, subchildelement.NoteflightScoreID, subchildelement.Lyrics, subchildelement.TransLations, subchildelement.LessonQueue, subchildelement.Midi, subchildelement.IsTeacherPlayed, subchildelement.IsStudentPlayed, [],subchildelement.TeacherItemName,subchildelement.StudentItemName));
            //     subchildCounter = subchildCounter + 1;
            //   });
            // }
            childCounter = childCounter + 1;
          });
        }
        parentCounter = parentCounter + 1;
      });
      return nodeList;
    } catch (ex) { }
  }


  expendLesson() {
    $('#songplayer').hide();
    $('#divlessonQueue').show();
  }

  collapse() {
    $('#songplayer').show();
    $('#divlessonQueue').show();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AdvancedSearchDialogComponent, {
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  playSong(option) {
    if (option == 'PT'){
      $('#selectedPlayMode').html('Play Teacher');
      $('#imgSlectedPlayMode').attr('src','../../../assets/images/play-t-icon.png');
    }
    else if (option == 'PS')
    {
      $('#selectedPlayMode').html('Play Student');
      $('#imgSlectedPlayMode').attr('src','../../../assets/images/play-s-icon.png');
    }
    else if (option == 'PA'){
      $('#selectedPlayMode').html('Play All');
      $('#imgSlectedPlayMode').attr('src','../../../assets/images/play-a-icon.png');
    }
    else if (option == 'SNP'){
      $('#selectedPlayMode').html('Send No Play');
      $('#imgSlectedPlayMode').attr('src','../../../assets/images/play-n-icon.png');
    }

    CommonService.lessonQueuePlayMode = option;
  }

}

