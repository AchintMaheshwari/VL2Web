import { Component, OnInit, NgZone } from '@angular/core';
import { Node } from '../../tree-view/node';
import { TreeView } from '../../tree-view/tree-view';
import { GuidedvideoService } from '../../../services/guidedvideo.service';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../../common/common.service';
import { MatDialog } from '@angular/material';
import { AdvancedSearchDialogComponent } from '../../../advanced-search-dialog/advanced-search-dialog.component';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-guidedvideo-lesson-queue',
  templateUrl: './guidedvideo-lesson-queue.component.html',
  styleUrls: ['./guidedvideo-lesson-queue.component.scss']
})
export class GuidedvideoLessonQueueComponent implements OnInit {

  
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

  //-----NoteFlight----------
  noteFilightList: any[] = [];
  noteFilightScoreId: string;
  noteFlightURL: string;
  selectedNoteFlight: string;
  noteflightTittle: string;
  selectedNoteFlightIndex = -1;

  //---Lyrics---------------------
  lyricsList: any[] = [];
  selectedLyrics: string;
  lyricshtml: string;
  lyricsTittle: string;
  selectedLyricsIndex = -1;

  //-------Translation-------------------
  translationList: any[] = [];
  selectedTranslation: string;
  translationhtml: string;
  translationTittle: string;
  selectedTranslationIndex = -1;

  //--------Video-----------------
  videoList: any[] = [];
  selectedVideoUrl: string;
  trustedDashboardUrl = null;
  videoTittle: string;
  selectedVideoIndex = -1;



  constructor(public dialog: MatDialog, private mScrollbarService: MalihuScrollbarService, private guidedvideoService: GuidedvideoService, private _ngZone: NgZone) {
    //this.nodes.push(new Node(Math.random().toString(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null,null, []));
    this.isNoteFlight = false;
    this.isVideo = false;
    this.isLyrics = false;
    this.isTranslation = false;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AdvancedSearchDialogComponent, {
      
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
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
    CommonService.isPlayerStarted = false;
  }


  bindNoteFlight() {
    this.selectedbutton = 'Score';
    this.isVideo = false;
    this.isNoteFlight = true;
    this.isLyrics = false;
    this.isTranslation = false;
    this.noteFlightURL = "";
    this.lyricshtml = "";
    this.translationhtml = "";

    if (localStorage.getItem('GVLesson') != null && localStorage.getItem('GVLesson') != "") {
      this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
    }
    //this.guidedvideoService.LessonModel.LessonQueue = JSON.stringify(this.guidedvideoService.libraryNodes);

    this.noteFilightList = [];
    if (this.guidedvideoService.LessonModel.LessonQueue != undefined) {
      var Queue=JSON.parse(this.guidedvideoService.LessonModel.LessonQueue);
      //----------Parent Node------------------------------------
      Queue.forEach(element => {
        var Parentsong = {
          'tittle': element.LabelName,
          'label': element.Label,
          'noteFlightId': element.NoteflightScoreID,
          'lyrics': element.Lyrics,
          'translation': element.TransLations,
        }

        if (Parentsong.noteFlightId != '') {
          this.noteFilightList.push(Parentsong);
        }

        //------------Child Node----------------------------------------
        if (element.nodes.length > 0) {
          element.nodes.forEach(Childelement => {
            var Childsong = {
              'tittle': Childelement.LabelName,
              'label': Childelement.Label,
              'noteFlightId': Childelement.NoteflightScoreID,
              'lyrics': Childelement.Lyrics,
              'translation': Childelement.TransLations,
            }

            if (Childsong.noteFlightId != '') {
              this.noteFilightList.push(Childsong);
            }

            //---------Sub Child Node-----------------------------------------
            if (Childelement.nodes.length > 0) {
              Childelement.nodes.forEach(SubChildelement => {
                var SubChildsong = {
                  'tittle': SubChildelement.LabelName,
                  'label': SubChildelement.Label,
                  'noteFlightId': SubChildelement.NoteflightScoreID,
                  'lyrics': SubChildelement.Lyrics,
                  'translation': SubChildelement.TransLations,
                }

                if (SubChildsong.noteFlightId != '') {
                  this.noteFilightList.push(SubChildsong);
                }
              });
            }
          });
        }
      });

      this.selectedNoteFlight = this.noteFilightList[0].label;
      this.noteflightTittle = this.noteFilightList[0].tittle;
      if (this.selectedNoteFlight != null) {
        this.getNoteflightId(this.selectedNoteFlight, 0);
      }
    }
  }

  getNoteflightId(songLabel, index: number) {
    if (songLabel.includes(":")) {
      songLabel = songLabel.substr(songLabel.indexOf(":") + 1)
      songLabel = songLabel.substring(1);
    }
    var song = this.noteFilightList.filter(x => x.label === songLabel);
    this.noteflightTittle = song[0].tittle;
    //this.noteFlightURL= 'https://www.noteflight.com/embed/' + noteFilightScoreId;
    this.noteFlightURL = 'https://www.noteflight.com/embed/' + song[0].noteFlightId + '?scale=1.5&app=html5&windowWidth=800&windowHeight=400';
    //this.noteFlightURL= 'https://www.noteflight.com/scores/view/' + noteFilightScoreId +'?scale=1.5&app=html5&windowWidth=800&windowHeight=400';
    this.selectedNoteFlightIndex = index;
  }



  bindLyrics() {
    this.selectedbutton = 'Lyrics';
    this.isVideo = false;
    this.isNoteFlight = false;
    this.isLyrics = true;
    this.isTranslation = false;
   // this.guidedvideoService.LessonModel.LessonQueue = JSON.stringify(this.guidedvideoService.libraryNodes);
    if (localStorage.getItem('GVLesson') != null && localStorage.getItem('GVLesson') != "") {
      this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
    }
    this.lyricsList = [];
    if (this.guidedvideoService.LessonModel.LessonQueue != undefined) {
      var Queue=JSON.parse(this.guidedvideoService.LessonModel.LessonQueue);
      //----------Parent Node------------------------------------
      Queue.forEach(element => {
        var Parentsong = {
          'tittle': element.LabelName,
          'label': element.Label,
          'lyrics': element.Lyrics,
        }

        if (Parentsong.lyrics != '') {
          this.lyricsList.push(Parentsong);
        }

        //------------Child Node----------------------------------------
        if (element.nodes.length > 0) {
          element.nodes.forEach(Childelement => {
            var Childsong = {
              'tittle': Childelement.LabelName,
              'label': Childelement.Label,
              'lyrics': Childelement.Lyrics,
            }

            if (Childsong.lyrics != '') {
              this.lyricsList.push(Childsong);
            }

            //---------Sub Child Node-----------------------------------------
            if (Childelement.nodes.length > 0) {
              Childelement.nodes.forEach(SubChildelement => {
                var SubChildsong = {
                  'tittle': SubChildelement.LabelName,
                  'label': SubChildelement.Label,
                  'lyrics': SubChildelement.Lyrics,
                }

                if (SubChildsong.lyrics != '') {
                  this.lyricsList.push(SubChildsong);
                }
              });
            }
          });
        }
      });

      this.selectedLyrics = this.lyricsList[0].label;
      this.lyricsTittle = this.lyricsList[0].tittle;
      this.getLyrics(this.selectedLyrics, 0);
    }
  }

  getLyrics(songLabel, index: number) {
    if (songLabel.includes(":")) {
      songLabel = songLabel.substr(songLabel.indexOf(":") + 1)
      songLabel = songLabel.substring(1);
    }
    var song = this.lyricsList.filter(x => x.label === songLabel);
    this.lyricsTittle = song[0].tittle;
    this.lyricshtml = song[0].lyrics;
    this.selectedLyricsIndex = index;
  }

  bindTranslation() {
    this.selectedbutton = 'Translation';
    this.isVideo = false;
    this.isNoteFlight = false;
    this.isLyrics = false;
    this.isTranslation = true;
    //this.guidedvideoService.LessonModel.LessonQueue = JSON.stringify(this.guidedvideoService.libraryNodes);
    if (localStorage.getItem('GVLesson') != null && localStorage.getItem('GVLesson') != "") {
      this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
    }
    this.translationList = [];
    if (this.guidedvideoService.LessonModel.LessonQueue != undefined) {
      var Queue=JSON.parse(this.guidedvideoService.LessonModel.LessonQueue);
      //----------Parent Node------------------------------------
      Queue.forEach(element => {
        var Parentsong = {
          'tittle': element.LabelName,
          'label': element.Label,
          'translation': element.TransLations,
        }

        if (Parentsong.translation != '') {
          this.translationList.push(Parentsong);
        }

        //------------Child Node----------------------------------------
        if (element.nodes.length > 0) {
          element.nodes.forEach(Childelement => {
            var Childsong = {
              'tittle': Childelement.LabelName,
              'label': Childelement.Label,
              'translation': Childelement.TransLations,
            }

            if (Childsong.translation != '') {
              this.translationList.push(Childsong);
            }

            //---------Sub Child Node-----------------------------------------
            if (Childelement.nodes.length > 0) {
              Childelement.nodes.forEach(SubChildelement => {
                var SubChildsong = {
                  'tittle': SubChildelement.LabelName,
                  'label': SubChildelement.Label,
                  'translation': SubChildelement.TransLations,
                }

                if (SubChildsong.translation != '') {
                  this.translationList.push(SubChildsong);
                }
              });
            }
          });
        }
      });

      this.selectedTranslation = this.translationList[0].label;
      this.translationTittle = this.translationList[0].tittle;

      this.getTranslation(this.selectedTranslation, 0);
    }
  }

  getTranslation(songLabel, index: number) {
    if (songLabel.includes(":")) {
      songLabel = songLabel.substr(songLabel.indexOf(":") + 1)
      songLabel = songLabel.substring(1);
    }
    var song = this.translationList.filter(x => x.label === songLabel);
    this.translationTittle = song[0].tittle;
    this.translationhtml = song[0].translation;
    this.selectedTranslationIndex = index;
  }

  bindVideo() {
    this.selectedbutton = 'Video';
    this.isVideo = true;
    this.isNoteFlight = false;
    this.isLyrics = false;
    this.isTranslation = false;
    //this.guidedvideoService.LessonModel.LessonQueue = JSON.stringify(this.guidedvideoService.libraryNodes);
    if (localStorage.getItem('GVLesson') != null && localStorage.getItem('GVLesson') != "") {
      this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
    }
    this.videoList = [];
    if (this.guidedvideoService.LessonModel.LessonQueue != undefined) {

      var Queue=JSON.parse(this.guidedvideoService.LessonModel.LessonQueue);
      //----------Parent Node------------------------------------
      Queue.forEach(element => {
        var Parentsong = {
          'tittle': element.LabelName,
          'label': element.Label,
          'videoUrl': element.VideoUrl,
        }

        if (Parentsong.videoUrl != '') {
          this.videoList.push(Parentsong);
        }

        //------------Child Node----------------------------------------
        if (element.nodes.length > 0) {
          element.nodes.forEach(Childelement => {
            var Childsong = {
              'tittle': Childelement.LabelName,
              'label': Childelement.Label,
              'videoUrl': Childelement.VideoUrl,
            }

            if (Childsong.videoUrl != '') {
              this.videoList.push(Childsong);
            }

            //---------Sub Child Node-----------------------------------------
            if (Childelement.nodes.length > 0) {
              Childelement.nodes.forEach(SubChildelement => {
                var SubChildsong = {
                  'tittle': SubChildelement.LabelName,
                  'label': SubChildelement.Label,
                  'videoUrl': SubChildelement.VideoUrl,
                }

                if (SubChildsong.videoUrl != '') {
                  this.videoList.push(SubChildsong);
                }
              });
            }
          });
        }
      });

      this.selectedVideoUrl = this.videoList[0].label;
      this.videoTittle = this.videoList[0].tittle;
      this.getVideoUrl(this.selectedVideoUrl, 0);
    }
  }

  getVideoUrl(label, index: number) {
    if (label.includes(":")) {
      label = label.substr(label.indexOf(":") + 1)
      label = label.substring(1);
    }
    var song = this.videoList.filter(x => x.label === label);
    this.videoTittle = song[0].tittle;
    var videoUrl = song[0].videoUrl;
    if (videoUrl.includes('m.youtube.com')) {
      var youTubeUrl = videoUrl.replace('m.youtube.com', 'youtube.com').replace("watch?v=", "embed/");
      youTubeUrl = youTubeUrl.substr(0, youTubeUrl.indexOf('&'));
      this.trustedDashboardUrl = youTubeUrl;
    }
    else if (videoUrl.includes('youtube.com')) {
      this.trustedDashboardUrl = videoUrl.replace("watch?v=", "embed/");
    }
    else if (videoUrl.includes('vimeo.com')) {
      this.trustedDashboardUrl = videoUrl.replace("vimeo.com", "player.vimeo.com/video");
    }
    else if (videoUrl.includes('dailymotion.com')) {
      this.trustedDashboardUrl = videoUrl.replace("dailymotion.com/video", "dailymotion.com/embed/video");
    }
    else {
      this.trustedDashboardUrl = videoUrl;
    }
    this.selectedVideoIndex = index;
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
    this.guidedvideoService.libraryNodes = nodelist;
    this.guidedvideoService.libraryHistoryNodes = nodelist;
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

}

