import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { BsDropdownModule } from 'ngx-bootstrap';
import { StudentLessonHistoryService } from '../../../services/student-lesson-history.service';
import { CommonService } from '../../../common/common.service';
import { HttpParams } from '@angular/common/http';
import { SharedlibraryService } from '../../../services/sharedlibrary.service';
import { ToastrService } from 'ngx-toastr';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { DomSanitizer, SafeUrl } from '../../../../../node_modules/@angular/platform-browser';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { LessonsService } from '../../../services/lessons.service';
import { MatDialog } from '../../../../../node_modules/@angular/material';
import { CreateLessonDialogComponent } from '../../../teacher/exercise-library/lesson-library/create-lesson-dialog/create-lesson-dialog.component';

declare var VoiceLessons: any;
declare var VoiceLessonsExercisePlayer: any;
declare var jwplayer: any;
declare var VoicelessonsVideoPlayer: any;

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {
  lessonHistoryList: any;
  selectedLesson: any;
  lessonHistory: Array<any> = [];
  jsonLessonHistory: any;
  selectedLessonHistory: any;
  userType: string;
  currentLessonId: number = 0;
  isNoteFlight: boolean;
  isVideo: boolean;
  isLyrics: boolean;
  isTranslation: boolean;
  selectedbutton: string;
  isFavoriteSelection: boolean = false;
  currentLessonTags: string;

  //-----NoteFlight----------
  noteFilightList: any[] = [];
  noteFilightScoreId: string;
  noteFlightURL: SafeUrl;
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
  trustedDashboardUrl: SafeUrl;
  videoTittle: string;
  selectedVideoIndex = -1;

  playList: any;
  isScrollTimeout = false;
  innerWidth: number = 0;

  isTeacher: string;

  ngOnDestroy(): void {
    VoiceLessons.destoryPlayer();
    VoiceLessonsExercisePlayer.stopMusic();
  }
  constructor(private studentLessonHistory: StudentLessonHistoryService, private sharedLibrary: SharedlibraryService,
    private toastr: ToastrService, private mScrollbarService: MalihuScrollbarService, private sanitizer: DomSanitizer, public el: ElementRef,
    public lessonService: LessonsService, public dialog: MatDialog) {
    this.userType = localStorage.getItem('UserType');
    this.getStudentHistoryList();
    this.isNoteFlight = false;
    this.isVideo = false;
    this.isLyrics = false;
    this.isTranslation = false;
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.mScrollbarService.initScrollbar('#libraryData', { axis: 'y', theme: 'dark-thick', scrollButtons: { enable: true } });
  }

  getStudentHistoryList() {
    this.studentLessonHistory.getStudentHistoryList().subscribe(result => {
      this.lessonHistoryList = result;
      this.selectedLesson = this.lessonHistoryList[0].Started;
      if (result[0] != undefined) {
        this.getStudentHistoryByLessonId(result[0].LessonId, result[0].Tags);
        this.currentLessonId = result[0].LessonId;
      }
    });
  }

  getStudentHistoryByLessonId(lessonId, tags) {
    // selectedLesson
    this.currentLessonId = lessonId;
    this.currentLessonTags = tags;
    this.selectedLessonHistory = CommonService.getObjects(this.lessonHistoryList, 'LessonId', lessonId);
    this.selectedLesson = this.selectedLessonHistory[0].Started;
    this.jsonLessonHistory = [];
    this.lessonHistory = [];
    if (this.selectedLessonHistory[0].LessonHistory != '' && this.selectedLessonHistory[0].LessonHistory != undefined)
      this.jsonLessonHistory = JSON.parse(this.selectedLessonHistory[0].LessonHistory);
    this.jsonLessonHistory.forEach(element => {
      if (element.IsTeacherPlayed) {
        element.expanded = false;
        if (this.userType == 'Teacher') {
          if (element.IsTeacherFavorite === undefined) {
            element.IsTeacherFavorite = false;
          }
        }
        else if (this.userType == 'Student') {
          if (element.IsStudentFavorite === undefined) {
            element.IsStudentFavorite = false;
          }
        }
        this.lessonHistory.push(element);
      }
      element.nodes.forEach(childElement => {
        if (element.IsTeacherPlayed) {
          childElement.expanded = false;
          if (this.userType == 'Teacher') {
            if (childElement.IsTeacherFavorite === undefined) {
              childElement.IsTeacherFavorite = false;
            }
          }
          else if (this.userType == 'Student') {
            if (childElement.IsStudentFavorite === undefined) {
              childElement.IsStudentFavorite = false;
            }
          }
          this.lessonHistory.push(childElement);
        }
      });
    });
  }

  bindLessonQueuePlayer(music) {
    VoiceLessonsExercisePlayer.stopMusic();
    VoiceLessons.destoryPlayer();
    $('.videoPlayerWidget').toArray().forEach(element => {
      $(element).html('');
    });
    if (!music.expanded) {
      this.lessonHistory.forEach(x => { x.expanded = false; });
      music.expanded = true;
      var playList = [];
      if (music.FilterType == 'Song') {

        if (music.AudioFile.includes("youtube.com") || music.AudioFile.includes("vimeo.com") || music.AudioFile.includes("dailymotion.com")
          || music.AudioFile.includes("wistia") || music.AudioFile.includes(".mp4")) {
          VoicelessonsVideoPlayer.init('#videoPlayer' + music.Label, music.AudioFile, null);
          $('#videoPlayer' + music.Label).show();
          $('#excrisePlayer' + music.Label).hide();
          $('#audioPlayer' + music.Label).hide();
        }
        else {
          var song = {
            'src': music.AudioFile,
            'jumpPoints': music.JumpPoints != '' ? JSON.parse(music.JumpPoints) : '',
            'tittle': music.LabelName,
            'label': music.Label,
            'played': music.Played,
            'noteFlightId': music.NoteflightScoreID,
            'lyrics': music.Lyrics,
            'translation': music.TransLations,
          }
          playList.push(song);
          VoiceLessons.AudioPlayer('#audioPlayer' + music.Label, playList, null, 0);
          $('#videoPlayer' + music.Label).hide();
          $('#excrisePlayer' + music.Label).hide();
          $('#audioPlayer' + music.Label).show();
        }
      }
      else {
        var exceriseObj = JSON.parse(music.Midi);
        exceriseObj.name = music.LabelName;
        var excerisePlayList = "[";
        excerisePlayList += JSON.stringify(exceriseObj) + ',';
        excerisePlayList = excerisePlayList.substr(0, excerisePlayList.length - 1);
        excerisePlayList += "]";
        VoiceLessonsExercisePlayer.initPlayer(excerisePlayList, music.Label, null, '#excrisePlayer' + music.Label);

        $('#excrisePlayer' + music.Label).show();
        $('#audioPlayer' + music.Label).hide();
      }
      $('.playerTrack').hide();
    }
    else {
      this.lessonHistory.forEach(x => { x.expanded = false; });
    }
  }

  songItemNameChanged(music) {
    var item = this.findCurrentSongItem(music.Label);
    if (this.userType == 'Teacher' && $('#txtItemName_' + music.Label).val() != music.TeacherItemName) {
      item.TeacherItemName = $('#txtItemName_' + music.Label).val().toString().trim();
      this.updateLesson();
    }
    else if (this.userType == 'Student' && $('#txtItemName_' + music.Label).val() != music.StudentItemName) {
      music.StudentItemName = $('#txtItemName_' + music.Label).val().toString().trim();;
      this.updateLesson();
    }
    this.upsertUserFavoriteSongsAndExercises(item, true);
    $('#lblItemName_' + music.Label).show();
    $('#txtItemName_' + music.Label).hide();
  }

  labelItemClick(music) {
    this.lessonHistory.forEach(x => { x.expanded = false; });
    VoiceLessonsExercisePlayer.stopMusic();
    VoiceLessons.destoryPlayer();
    $('#lblItemName_' + music.Label).hide();
    $('#txtItemName_' + music.Label).show();
    $('#txtItemName_' + music.Label).focus();
  }

  findCurrentSongItem(guid): any {
    var isPlayNode = false;
    var parentCounter = 0;
    var i = 0;
    var nodeIteam = null;
    if (this.jsonLessonHistory == undefined)
      return;
    this.jsonLessonHistory.forEach(element => {
      //-----------------Parent Node------------------------------------
      if (isPlayNode == false) {
        if (element.Label == guid) {
          isPlayNode = true;
          nodeIteam = this.jsonLessonHistory[parentCounter];
        }
        parentCounter = parentCounter + 1;
      }
    });

    parentCounter = 0;
    //-----------------Child Node----------------------------------------------
    if (isPlayNode == false) {
      this.jsonLessonHistory.forEach(element => {
        if (element.nodes.length != 0 && isPlayNode == false) {
          var childCounter = 0;
          element.nodes.forEach(childelement => {
            if (childelement.Label == guid && isPlayNode == false) {
              isPlayNode = true;
              nodeIteam = this.jsonLessonHistory[parentCounter].nodes[childCounter];
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
      this.jsonLessonHistory.forEach(element => {
        if (element.nodes.length != 0 && isPlayNode == false) {
          var childCounter = 0;
          var subChildCounter = 0;
          element.nodes.forEach(childelement => {

            if (childelement.nodes.length != 0 && isPlayNode == false) {
              childelement.nodes.forEach(subchildelement => {
                if (subchildelement.Label == guid && isPlayNode == false) {
                  isPlayNode = true;
                  nodeIteam = this.jsonLessonHistory[parentCounter].nodes[childCounter].nodes[subChildCounter];
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

  updateLesson() {
    this.selectedLessonHistory[0].LessonHistory = JSON.stringify(this.jsonLessonHistory);
    this.selectedLessonHistory[0].IsLessonQueueChange = true;
    this.sharedLibrary.post('/lesson/UpsertLesson', this.selectedLessonHistory[0], new HttpParams()).subscribe((response: any) => {
      if (!this.isFavoriteSelection) {
        this.toastr.success("this item updated successfully!");
      }
      else {
        this.isFavoriteSelection = false;
      }
    });
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
    this.noteFilightList = [];

    if (this.lessonHistory != undefined) {
      this.lessonHistory.forEach(element => {
        if (element.NoteflightScoreID != "") {
          var song = {
            'tittle': element.LabelName,
            'label': element.Label,
            'noteFlightId': element.NoteflightScoreID,
            'lyrics': element.Lyrics,
            'translation': element.TransLations,
          }
          this.noteFilightList.push(song);
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
    this.noteFlightURL = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.noteflight.com/embed/' + song[0].noteFlightId + '?scale=1.5&app=html5&windowWidth=800&windowHeight=400');
    this.selectedNoteFlightIndex = index;
  }

  bindLyrics() {
    this.selectedbutton = 'Lyrics';
    this.isVideo = false;
    this.isNoteFlight = false;
    this.isLyrics = true;
    this.isTranslation = false;

    this.lyricsList = [];
    if (this.lessonHistory != undefined) {
      this.lessonHistory.forEach(element => {
        if (element.Lyrics != "") {
          var song = {
            'tittle': element.LabelName,
            'label': element.Label,
            'lyrics': element.Lyrics,
          }
          this.lyricsList.push(song);
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

    this.translationList = [];
    if (this.lessonHistory != undefined) {
      this.lessonHistory.forEach(element => {
        if (element.TransLations != "") {
          var song = {
            'tittle': element.LabelName,
            'label': element.Label,
            'translation': element.TransLations,
          }
          this.translationList.push(song);
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

    this.videoList = [];
    if (this.lessonHistory != undefined) {
      this.lessonHistory.forEach(element => {
        if (element.VideoUrl != "") {
          var song = {
            'tittle': element.LabelName,
            'label': element.Label,
            'videoUrl': element.VideoUrl,
          }
          this.videoList.push(song);
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
      this.trustedDashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(youTubeUrl);
    }
    else if (videoUrl.includes('youtube.com')) {
      this.trustedDashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl.replace("watch?v=", "embed/"));
    }
    else if (videoUrl.includes('vimeo.com')) {
      this.trustedDashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl.replace("vimeo.com", "player.vimeo.com/video"));
    }
    else if (videoUrl.includes('dailymotion.com')) {
      this.trustedDashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl.replace("dailymotion.com/video", "dailymotion.com/embed/video"));
    }
    else {
      this.trustedDashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
    }
    this.selectedVideoIndex = index;
  }

  textNotesChanged(music) {
    debugger
    var noteValue = $('#txtNote_' + music.Label).val().toString().trim();
    $('#txtNote_' + music.Label).val(noteValue);
    $('#lblNote_' + music.Label).show();
    $('#txtNote_' + music.Label).hide();
    //if ($('#txtNote_' + music.Label).val().toString().trim() == '') return;
    var item = this.findCurrentSongItem(music.Label);
    if (this.userType == 'Teacher' && noteValue != music.TeacherItemNote) {
      item.TeacherItemNote = noteValue;
      this.updateLesson();
    }
    else if (this.userType == 'Student' && noteValue != music.StudentItemNote) {
      music.StudentItemNote = noteValue;
      this.updateLesson();
    }    
  }

  labelNoteClick(music) {
    VoiceLessonsExercisePlayer.stopMusic();
    VoiceLessons.destoryPlayer();
    $('#lblNote_' + music.Label).hide();
    $('#txtNote_' + music.Label).show();
    $('#txtNote_' + music.Label).focus();
  }

  downloadFile(url: string) {
    if (url != "") {
      window.open(url);
      window.URL.revokeObjectURL(url);
    }
  }

  upsertUserFavoriteSongsAndExercises(item: any, isFavoriteRenameEntry: boolean = false) {    
    //isFavoriteRenameEntry//== this parameter is using to check that method is hit by rename or from star click
    let itemName = '';
    let isTeacherFavorite = false;
    if(isFavoriteRenameEntry)
    {
    isTeacherFavorite = this.userType == 'Teacher' ? item.IsTeacherFavorite : item.IsStudentFavorite;
    }
    else{
      isTeacherFavorite = this.userType == 'Teacher' ? !item.IsTeacherFavorite : !item.IsStudentFavorite;
    }
    
    if (this.userType == 'Teacher')
      itemName = item.TeacherItemName != undefined ? item.TeacherItemName : item.LabelName;
    else
      itemName = item.StudentItemName != undefined ? item.StudentItemName : item.LabelName;

    let favoriteItem = {
      UserFavoriteMap: 0,
      UserId: CommonService.getUser().UserId,
      LessonId: this.currentLessonId,
      FavoriteItemType: item.FilterType,
      FavoriteItemId: item.SongId,
      CreatedOn: new Date,
      ModifiedOn: "",
      ItemName: itemName,
      IsFavorite: isTeacherFavorite,
      ItemJosn: JSON.stringify(item),
      IsFavoriteEntry: isFavoriteRenameEntry,
    }

    let node = this.findCurrentSongItem(item.Label);
    if (this.userType == 'Teacher') {
      node.IsTeacherFavorite = favoriteItem.IsFavorite;
    }
    else if (this.userType == 'Student') {
      node.IsStudentFavorite = favoriteItem.IsFavorite;
    }
    this.isFavoriteSelection = true;
    this.updateLesson();

    this.sharedLibrary.post('/lesson/UpsertUserFavoriteItems', favoriteItem, new HttpParams()).subscribe((response: any) => {
      if (response.result === 200) {
        if(!isFavoriteRenameEntry){
        if (favoriteItem.IsFavorite) {
          this.toastr.success("This item has been added to your favorites !");
        }
        else {
          this.toastr.success("This item has been removed from your favorites !");
        }
      }
      }
    });
  }

  playVideo(VideoNo) {
    this.playList = [];

    //https://vldevstoragefuncapp.blob.core.windows.net/vl2songs/SampleVideo_1280x720_1mb.mp4
    
    if (VideoNo == 1) {
      this.playList.push({
        "file": "https://vldevstoragefuncapp.blob.core.windows.net/vl2songs/video3ad545c5100583sz410.mp4",
        "image": "",
        "height": 360,
        "width": 640
      });
    } else {
      this.playList.push({
        "file": "https://vldevstoragefuncapp.blob.core.windows.net/vl2songs/small.mp4",
        "image": "../../../../assets/images/caro-video-img.jpg",
        "height": 360,
        "width": 640
      });
    }

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

  @HostListener('window:scroll', ['$event'])
  checkScroll() {
    const componentPosition = this.el.nativeElement.offsetTop
    const scrollPosition = window.pageYOffset
    this.innerWidth = window.innerWidth;
    if (scrollPosition >= componentPosition) {
      this.onScrollViewHandler();
    }
  }

  onScrollViewHandler() {
    var playerContainerEl = document.getElementById('player-container');
    var playerHeight = playerContainerEl.clientHeight;
    var playerOffsetTop = this.getElementOffsetTop(playerContainerEl);
    playerContainerEl.style.height = playerHeight + 'px';

    var scrollTop = this.getScrollTop();

    if (scrollTop >= playerOffsetTop + 50) {
      if (innerWidth == 1600) {
        playerContainerEl.classList.add('player-minimize');
      } else {
        playerContainerEl.classList.add('player-minimize-lap');
      }
      document.getElementById('player').style.height = "164px";
      document.getElementById('player').style.width = "300px";
    }
    else if (playerContainerEl.classList.contains('player-minimize')) {
      playerContainerEl.classList.remove('player-minimize');
      document.getElementById('player').style.height = "100%";
      document.getElementById('player').style.width = "100%";
    }
    else if (playerContainerEl.classList.contains('player-minimize-lap')) {
      playerContainerEl.classList.remove('player-minimize-lap');
      document.getElementById('player').style.height = "100%";
      document.getElementById('player').style.width = "100%";
    }
  }

  onscroll() {
    if (this.isScrollTimeout) return;
    this.isScrollTimeout = true;
    this.onScrollViewHandler();
    setTimeout(function () {
      this.isScrollTimeout = false;
    }, 80);
  };

  getOffset(el) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      _x += el.offsetLeft - el.scrollLeft;
      _y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: _y, left: _x };
  }

  getElementOffsetTop(el) {
    var boundingClientRect = el.getBoundingClientRect();
    var bodyEl = document.body;
    var docEl = document.documentElement;
    var scrollTop = window.pageYOffset || docEl.scrollTop || bodyEl.scrollTop;
    var clientTop = docEl.clientTop || bodyEl.clientTop || 0;
    return Math.round(boundingClientRect.top + scrollTop - clientTop);
  }

  getScrollTop() {
    var docEl = document.documentElement;
    return (window.pageYOffset || docEl.scrollTop) - (docEl.clientTop || 0);
  }

  openLessonPop() {
    this.lessonService.dialogTitle = "Create Lesson";
    this.lessonService.isShowEditModel = true;
    this.lessonService.isShowCreateModel = false;
    const dialogRef = this.dialog.open(CreateLessonDialogComponent, {
      maxHeight: '80vh'
    });
    //this.lessonService.currentLessonId =  this.currentLessonId;
    //this.lessonService.currentLessonTags=this.currentLessonTags;
    this.lessonService.LessonQueueFromHistory = JSON.stringify(this.lessonHistory);
  }

}
