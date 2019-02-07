import { Component, OnInit, NgZone } from '@angular/core';
import { Node } from '../../tree-view/node';
import { TreeView } from '../../tree-view/tree-view';
import { SharedlibraryService } from '../../../services/sharedlibrary.service';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../../common/common.service';
import { MatDialog } from '@angular/material';
import { AdvancedSearchDialogComponent } from '../../../advanced-search-dialog/advanced-search-dialog.component';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

/* export interface DialogData {
  animal: string;
  name: string;
} */
declare var LivePlayer: any;
@Component({
  selector: 'app-lesson-queue',
  templateUrl: './lesson-queue.component.html',
  styleUrls: ['./lesson-queue.component.scss']
})

export class LessonQueueComponent implements OnInit {
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
  isMobilePlayer: boolean = false;
  isLiveLesson = false;
  userType: string;
  editorContent: string;
  window: any;
  lessonQueueHeader: any;

  constructor(public dialog: MatDialog, private mScrollbarService: MalihuScrollbarService, public sharedLibrary: SharedlibraryService
    , public toastr: ToastrService, private _ngZone: NgZone) {
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
    this.getLessonNotes();
    this.isLiveLesson = window.location.hash.includes('lesson-planner') == true ? false : true;
    this.window = window;
    if (window.location.hash == "#/mobile-player")
      this.isMobilePlayer = true;
    CommonService.isPlayerStarted = false;
    this.userType = localStorage.getItem('UserType');
    this.lessonQueueHeader = (localStorage.getItem('UserType') == 'Student' && window.location.hash.includes('student/videoConnected')) ? 'Lesson History' : 'Lesson Queue';

    setTimeout(function () {
      if (localStorage.getItem('UserType') == 'Student') {
        this.window.disableFroalaEditor();
        $('#btnSaveEditor').attr('disabled', 'disabled');
      }
    }, 100);
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

    this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(this.sharedLibrary.libraryNodes);

    this.noteFilightList = [];
    if (this.sharedLibrary.LessonModel.LessonQueue != undefined) {
      //----------Parent Node------------------------------------
      this.sharedLibrary.libraryNodes.forEach(element => {
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
    this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(this.sharedLibrary.libraryNodes);

    this.lyricsList = [];
    if (this.sharedLibrary.LessonModel.LessonQueue != undefined) {
      //----------Parent Node------------------------------------
      this.sharedLibrary.libraryNodes.forEach(element => {
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
    this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(this.sharedLibrary.libraryNodes);

    this.translationList = [];
    if (this.sharedLibrary.LessonModel.LessonQueue != undefined) {
      //----------Parent Node------------------------------------
      this.sharedLibrary.libraryNodes.forEach(element => {
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
    this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(this.sharedLibrary.libraryNodes);

    this.videoList = [];
    if (this.sharedLibrary.LessonModel.LessonQueue != undefined) {
      //----------Parent Node------------------------------------
      this.sharedLibrary.libraryNodes.forEach(element => {
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
    var arrayNodeList: any[] = lessonQueueJsonObject;
    var nodelist = this.lessonQueueFromJsonNodes(arrayNodeList);
    //this.nodes = null;
    //this.nodes = nodelist;
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
            childCounter = childCounter + 1;
          });
        }
        parentCounter = parentCounter + 1;
      });

      return nodeList;
    } catch (ex) { }
  }

  isPlayerStartedCallback(flag) {

  }

  lessonNoteSyncAllowCallback(flag) {
    if (flag) {
      $('#btnSaveEditor').removeAttr('disabled');
      this.window.enableFroalaEditor()
    }
    else {
      $('#btnSaveEditor').attr('disabled', 'disabled');
      this.window.disableFroalaEditor()
    }
  }

  lessonNoteCallback(notes) {
    this.editorContent = notes;
  }

  initTreeViewCallbackEvents() {
    window['lessonQueueReference'] = {
      zone: this._ngZone,
      lessonQueueCallback: (value) => this.lessonQueueCallback(value),
      isPlayerStartedCallback: (value) => this.isPlayerStartedCallback(value),
      lessonNoteSyncAllowCallback: (value) => this.lessonNoteSyncAllowCallback(value),
      lessonNoteCallback: (value) => this.lessonNoteCallback(value),
      component: this,
    };
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
      //this.animal = result;
    });
  }

  playSong(option) {
    if (option == 'PT') {
      $('#selectedPlayMode').html('Play Teacher');
      $('#imgSlectedPlayMode').attr('src', '../../../assets/images/play-t-icon.png');
    }
    else if (option == 'PS') {
      $('#selectedPlayMode').html('Play Student');
      $('#imgSlectedPlayMode').attr('src', '../../../assets/images/play-s-icon.png');
    }
    else if (option == 'PA') {
      $('#selectedPlayMode').html('Play All');
      $('#imgSlectedPlayMode').attr('src', '../../../assets/images/play-a-icon.png');
    }
    else if (option == 'SNP') {
      $('#selectedPlayMode').html('Send No Play');
      $('#imgSlectedPlayMode').attr('src', '../../../assets/images/play-n-icon.png');
    }

    CommonService.lessonQueuePlayMode = option;
  }

  updateLessonNotes() {
    let notesViewModel = {
      'LessonId': this.sharedLibrary.LessonModel.LessonId,
      'Notes': this.editorContent
    }

    this.sharedLibrary.post('/lesson/UpdateNotes', notesViewModel, new HttpParams()).subscribe((response: any) => {
      this.toastr.success("Lesson notes updated successfully.");
      LivePlayer.SendLessonNote(this.editorContent);
    })
  }

  getLessonNotes() {
    if (this.sharedLibrary.LessonModel.LessonId != 0) {
      this.sharedLibrary.get('/lesson/GetNotes', new HttpParams().set("lessonId", this.sharedLibrary.LessonModel.LessonId.toString())).subscribe((response: any) => {
        this.editorContent = response;
      })
    }
  }

  // public options: Object = {
  //   placeholderText: 'Edit Your Notes Here!',
  //   charCounterCount: true,  
  //   // toolbarButtons: ['bold', 'italic', 'underline', 'paragraphFormat','alert'],
  //   // toolbarButtonsXS: ['bold', 'italic', 'underline', 'paragraphFormat','alert'],
  //   // toolbarButtonsSM: ['bold', 'italic', 'underline', 'paragraphFormat','alert'],
  //   // toolbarButtonsMD: ['bold', 'italic', 'underline', 'paragraphFormat','alert'],
  // }

  public options: Object = {
    placeholder: "Edit Your Notes Here!",
    //key: 'yC5G4F4E4jC10D7A5A5B2B3G3E2C2C5B-16toeuvG2C3zzyeczF1B3I1siagsh1A-7H-8irhxmF3ndv==',
    key: 'eA6E6D3C2C-8C2H2C5C1B6C2A1C4C1A1qxcqabD5B1tlbjB-13mE-11B-9nwkerE5maq==',    
    events: {
      'froalaEditor.initialized': function (e, editor) {
        if (this.userType == 'Student')
          editor.edit.off();
        else
          editor.edit.on();
      }
    }
  }

  onAllowSyncNote(value) {
    LivePlayer.SendLessonNoteSyncAllow(value);
  }

}
