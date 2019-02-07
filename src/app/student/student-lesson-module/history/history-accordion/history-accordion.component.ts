import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { StudentLessonHistoryService } from '../../../../services/student-lesson-history.service';
import { CommonService } from '../../../../common/common.service';
import { HttpParams } from '@angular/common/http';
import { SharedlibraryService } from '../../../../services/sharedlibrary.service';
import { ToastrService } from 'ngx-toastr';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { DomSanitizer, SafeUrl } from '../../../../../../node_modules/@angular/platform-browser';
import { LessonsService } from '../../../../services/lessons.service';
import { MatDialog } from '../../../../../../node_modules/@angular/material';
import { ActivatedRoute } from '@angular/router';


declare var VoiceLessons: any;
declare var VoiceLessonsExercisePlayer: any;
declare var jwplayer: any;
declare var VoicelessonsVideoPlayer: any;

@Component({
  selector: 'history-accordion',
  templateUrl: './history-accordion.component.html',
  styleUrls: ['./history-accordion.component.scss']
})

export class HistoryAccordionComponent implements OnInit, OnDestroy {

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
  isTeacher: string;

  ngOnDestroy(): void {
    VoiceLessons.destoryPlayer();
    VoiceLessonsExercisePlayer.stopMusic();
  }
  constructor(private studentLessonHistory: StudentLessonHistoryService, private sharedLibrary: SharedlibraryService,
    private toastr: ToastrService, private mScrollbarService: MalihuScrollbarService, private sanitizer: DomSanitizer, public el: ElementRef,
    public lessonService: LessonsService, public dialog: MatDialog, private activatedRoute: ActivatedRoute) {
    
  }

  ngOnInit() {
    debugger;
    this.userType = this.activatedRoute.snapshot.queryParams["userType"].toLocaleLowerCase();
    this.getStudentHistoryList();
    this.isNoteFlight = false;
    this.isVideo = false;
    this.isLyrics = false;
    this.isTranslation = false;    
  }

  ngAfterViewInit() {
    this.mScrollbarService.initScrollbar('#libraryData', { axis: 'y', theme: 'dark-thick', scrollButtons: { enable: true } });
  }

  getStudentHistoryList() {    
    let userId = this.activatedRoute.snapshot.queryParams["userId"];    
    if(localStorage.getItem('access_token') == undefined)
    localStorage.setItem('access_token', 'a4k0xUChoJp74X58kQ0v69JDoXUk1gyYmKd9EAI8aQBp_rKCWLH98M9-TMREJj473tYKMLJhtdVzoJrZJZqpSM3PPIXVhfAtQFPnVuaUTgEkWBW0CBuv7faUVyP5HmTDwohmTr1BLsZYGOYIJfPwl6vn2QEd1eDKGF70cHsMH0Tm6a84b8cfQCTrXEO21Vm76Rf0tX2kMbYQQ6r8_V9DndiRvjvObKvQ9K9ytmm6xyIbMoQ23NVfzeU0nwqH8-BebmQJ2p98xA428_irlBaGiiOjPYCoTMp5g8uMWjRpoVNh8GJVjhXSrI-Gd85sgfLlfMYhCH8hWRS0lLQms9KEF3na1S6eKmCoapaLLigXJWM');
    this.studentLessonHistory.getMobileHistoryList(userId, this.userType).subscribe(result => {
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
        if (this.userType == 'teacher') {
          if (element.IsTeacherFavorite === undefined) {
            element.IsTeacherFavorite = false;
          }
        }
        else if (this.userType == 'student') {
          if (element.IsStudentFavorite === undefined) {
            element.IsStudentFavorite = false;
          }
        }
        this.lessonHistory.push(element);
      }
      element.nodes.forEach(childElement => {
        if (element.IsTeacherPlayed) {
          childElement.expanded = false;
          if (this.userType == 'teacher') {
            if (childElement.IsTeacherFavorite === undefined) {
              childElement.IsTeacherFavorite = false;
            }
          }
          else if (this.userType == 'student') {
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
    if (this.userType == 'teacher' && $('#txtItemName_' + music.Label).val() != music.TeacherItemName) {
      item.TeacherItemName = $('#txtItemName_' + music.Label).val().toString().trim();
      this.updateLesson();
    }
    else if (this.userType == 'student' && $('#txtItemName_' + music.Label).val() != music.StudentItemName) {
      music.StudentItemName = $('#txtItemName_' + music.Label).val().toString().trim();;
      this.updateLesson();
    }
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
    this.sharedLibrary.post('/lesson/upsertUserFavoriteSongsAndExercisestLesson', this.selectedLessonHistory[0], new HttpParams()).subscribe((response: any) => {
      if (!this.isFavoriteSelection) {
        this.toastr.success("this item updated successfully!");
      }
      else {
        this.isFavoriteSelection = false;
      }
    });
  }

  

  textNotesChanged(music) {
    debugger
    var noteValue = $('#txtNote_' + music.Label).val().toString().trim();
    $('#txtNote_' + music.Label).val(noteValue);
    $('#lblNote_' + music.Label).show();
    $('#txtNote_' + music.Label).hide();
    //if ($('#txtNote_' + music.Label).val().toString().trim() == '') return;
    var item = this.findCurrentSongItem(music.Label);
    if (this.userType == 'teacher' && noteValue != music.TeacherItemNote) {
      item.TeacherItemNote = noteValue;
      this.updateLesson();
    }
    else if (this.userType == 'student' && noteValue != music.StudentItemNote) {
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

  upsertUserFavoriteSongsAndExercises(item: any) {
    debugger;
    let favoriteItem = {
      UserFavoriteMap: 0,
      UserId: this.activatedRoute.snapshot.queryParams["userId"],
      LessonId: this.currentLessonId,
      FavoriteItemType: item.FilterType,
      FavoriteItemId: item.SongId,
      CreatedOn: new Date,
      ModifiedOn: "",
      IsFavorite: this.userType == 'teacher' ? !item.IsTeacherFavorite : !item.IsStudentFavorite,
      ItemJosn: JSON.stringify(item),
    }

    let node = this.findCurrentSongItem(item.Label);
    if (this.userType == 'teacher') {
      node.IsTeacherFavorite = favoriteItem.IsFavorite;
    }
    else if (this.userType == 'student') {
      node.IsStudentFavorite = favoriteItem.IsFavorite;
    }
    this.isFavoriteSelection = true;
    this.updateLesson();

    this.sharedLibrary.post('/lesson/UpsertUserFavoriteItems', favoriteItem, new HttpParams()).subscribe((response: any) => {
      if (response.result === 200) {
        if (favoriteItem.IsFavorite) {
          this.toastr.success("This item has been added to your favorites !");
        }
        else {
          this.toastr.success("This item has been removed from your favorites !");
        }
      }
    });
  }
}