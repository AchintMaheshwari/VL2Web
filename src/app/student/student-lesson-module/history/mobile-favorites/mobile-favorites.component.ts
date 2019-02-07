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
  selector: 'app-mobile-favorites',
  templateUrl: './mobile-favorites.component.html',
  styleUrls: ['./mobile-favorites.component.scss']
})

export class MobileFavoritesComponent implements OnInit, OnDestroy {

  lessonHistoryList: any;
  selectedLesson: any;
  lessonHistory: Array<any> = [];
  jsonLessonHistory: any;
  selectedLessonHistory: any;
  userType: string;
  userId: string;
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
    this.userType = '';//this.activatedRoute.snapshot.queryParams["userType"].toLocaleLowerCase();
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
    //let userId =this.activatedRoute.snapshot.queryParams["userId"];
    if (localStorage.getItem('access_token') == undefined)
      localStorage.setItem('access_token', 'dR-hfOcrYX1-HlWXfAfDt-NudyeP0bDsya7ZKIoY0CRNb9fN2zh_Rj1MRvur7M1q_k7IKSfHMcXYBE74x1AyhdUYOC6IsSB39S5hSmHMU9g4Jv3e2A8VHIpZUO9FGmi6-2NdLa1ELxNRwJibB73oOb62xFd6l_GWA0kfM273DbbK2ntMjQhz_mAs6SuQkfU5bsrGffB7YmRh8-kNV5LD0DYap9YNiex82dfaNho0QC_od8nOgFH2lvu7Sv04pkk2InR0o-7hXwE2PIZBMGcnWxgY4r8lbWcDOaQQYBYT8GtDzM903KEr0ouaAuXowydu');
    this.studentLessonHistory.getMobileFavoritesList().subscribe(result => {
      this.userType = result[0].UserRole.toLocaleLowerCase();
      this.userId = result[0].UserId;
      this.lessonHistoryList = result;
      if (result != undefined) {
        this.getStudentHistoryByLessonId(result);
      }
    });
  }

  getStudentHistoryByLessonId(lessonFavorites) {
    lessonFavorites.forEach(element => {
      if (element.ItemJosn != undefined) {
        let favorite = JSON.parse(element.ItemJosn);
        favorite.LessonId = element.LessonId,
          favorite.IsFavorite = element.IsFavorite,
          favorite.LabelName = element.ItemName != null ? element.ItemName : favorite.LabelName,
          this.lessonHistory.push(favorite);
      }
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
    if (this.userType == 'teacher' && $('#txtItemName_' + music.Label).val() != music.TeacherItemName) {
      music.TeacherItemName = $('#txtItemName_' + music.Label).val().toString().trim();
      this.upsertUserFavoriteSongsAndExercisesName(music, music.TeacherItemName);      
    }
    else if (this.userType == 'student' && $('#txtItemName_' + music.Label).val() != music.StudentItemName) {
      music.StudentItemName = $('#txtItemName_' + music.Label).val().toString().trim();
      this.upsertUserFavoriteSongsAndExercisesName(music, music.StudentItemName);      
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

  updateLesson(lessonId: string, item: any) {
    this.sharedLibrary.get('/lesson/GetLessonData', new HttpParams().set('lessonId', lessonId))
      .subscribe((result: any) => {
        this.jsonLessonHistory = JSON.parse(result.LessonHistory);
        let currentItem = this.findCurrentSongItem(item.Label);
        if (this.userType == 'teacher')        
        {
        currentItem.TeacherItemName = item.TeacherItemName != undefined ? item.TeacherItemName : item.LabelName;       
        currentItem.IsTeacherFavorite = item.IsFavorite;       
        }
        else 
        {
          currentItem.StudentItemName = item.StudentItemName != undefined ? item.StudentItemName :  (item.TeacherItemName != undefined ? item.TeacherItemName : item.LabelName);
          currentItem.IsStudentFavorite = item.IsFavorite;       
        }
        result.LessonHistory = JSON.stringify(this.jsonLessonHistory);
        result.IsLessonQueueChange = true;
        this.sharedLibrary.post('/lesson/UpsertLesson', result, new HttpParams()).subscribe((response: any) => {
          // if (!this.isFavoriteSelection) {
          //   this.toastr.success("this item updated successfully!");
          // }
          // else {
          //   this.isFavoriteSelection = false;
          // }
        });
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
      //this.updateLesson();
    }
    else if (this.userType == 'student' && noteValue != music.StudentItemNote) {
      music.StudentItemNote = noteValue;
      //this.updateLesson();
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
    if (this.userType == 'teacher') {
      item.IsTeacherFavorite = !item.IsFavorite;
    }
    else if (this.userType == 'student') {
      item.IsStudentFavorite = !item.IsFavorite;
    }
    let favoriteItem = {
      UserFavoriteMap: 0,
      UserId: this.userId, //this.activatedRoute.snapshot.queryParams["userId"],
      LessonId: item.LessonId,
      FavoriteItemType: item.FilterType,
      FavoriteItemId: item.SongId,
      CreatedOn: new Date,
      ModifiedOn: "",
      IsFavorite: !item.IsFavorite,
      ItemJosn: JSON.stringify(item),
      ItemName: item.LabelName,
    }
    item.IsFavorite = !item.IsFavorite
    this.isFavoriteSelection = true;
    
    this.updateLesson(item.LessonId,item);

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


  upsertUserFavoriteSongsAndExercisesName(item: any, itemName: string = null) {
    debugger;
    let favoriteItem = {
      UserFavoriteMap: 0,
      UserId: this.userId, //this.activatedRoute.snapshot.queryParams["userId"],
      LessonId: item.LessonId,
      FavoriteItemType: item.FilterType,
      FavoriteItemId: item.SongId,
      CreatedOn: new Date,
      ModifiedOn: "",
      IsFavorite: item.IsFavorite,
      ItemJosn: JSON.stringify(item),
      ItemName: itemName,
    }
    item.LabelName = itemName;
    this.updateLesson(item.LessonId, item);

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