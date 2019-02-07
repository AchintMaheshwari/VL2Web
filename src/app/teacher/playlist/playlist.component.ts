import { Component, OnInit, OnDestroy } from '@angular/core';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { SongsService } from '../../services/song.service';
import { Node } from '../tree-view/node';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../common/common.service';
import { Router } from '@angular/router';
import { ExerciseLibraryService } from '../../services/exercise-library.service';
import { LoaderService } from '../../services/loader.service';
import { VideoService } from '../../services/video.service';
import { LessonsService } from '../../services/lessons.service';
import { PlaylistService } from '../../services/playlist.service';

declare var VoiceLessons: any


@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit, OnDestroy {

  ngOnDestroy(): void {
    CommonService.parentNodeList = undefined;
    CommonService.currentParentNodeList = undefined;
    this.playlistService.libraryNodes = undefined;
  }
  nodes: Array<Node> = [];
  songsDatalist: any;
  targetList: Array<Node> = [];
  isDropup = true;
  songsDataEmpty: any;
  libraryList: any;
  rows2: object;
  searchText: any;

  //-----NoteFlight----------
  noteFilightList: any[] = [];
  noteFilightScoreId: string;
  noteFlightURL: string;
  selectedNoteFlight: string;

  //---Lyrics---------------------
  lyricsList: any[] = [];
  selectedLyrics: string;
  lyricshtml: string;

  //-------Translation-------------------
  translationhtml: string;

  //--------Video-----------------
  videoList: any[] = [];
  selectedVideoUrl: string;
  trustedDashboardUrl = null;

  lessonTags = [];

  public scrollbarOptions = { axis: 'yx', theme: 'minimal-dark' };

  constructor(private mScrollbarService: MalihuScrollbarService, public songService: SongsService,
    private toastr: ToastrService, private router: Router,public exerciseLibraryService: ExerciseLibraryService, private loaderService: LoaderService,
    public videoService: VideoService, public lessonSer: LessonsService,public playlistService:PlaylistService) {
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

  ngAfterViewInit() {
    this.mScrollbarService.initScrollbar('#libraryData', { axis: 'y', theme: 'dark-thick', scrollButtons: { enable: true } });
  }

  ngOnInit() {
  }

  upsertLesson() {
    if (localStorage.getItem('Playlist') != null && localStorage.getItem('Playlist') != "") {
      this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));

      if (this.lessonSer.currentLessonTags != undefined) {
        this.playlistService.LessonModel.Tags = this.lessonSer.currentLessonTags.trim();
      }

      if (this.lessonSer.currentLessonStudent != undefined) {
        if (this.lessonSer.currentLessonStudent != "") {
          this.playlistService.LessonModel.Student = this.lessonSer.currentLessonStudent.trim().split(',');
        } else {
          this.playlistService.LessonModel.Student = [];
        }
      }

      if (this.playlistService.LessonModel.Student != undefined) {
        this.playlistService.LessonModel.Student.forEach(element => {
          if (this.playlistService.LessonModel.Users == null)
            this.playlistService.LessonModel.Users = element + ',';
          else
            this.playlistService.LessonModel.Users = this.playlistService.LessonModel.Users + element + ',';
        });
      }

      if (this.playlistService.libraryNodes != undefined) {
        var nodeLength = this.playlistService.libraryNodes.length;
        for (let index = 0; index < nodeLength; index++) {
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
      } else {
        this.playlistService.LessonModel.LessonQueue = "";
      }
      //this.playlistService.LessonModel.Ended = CommonService.convertToUTCDate(Date.now.toString());
      this.playlistService.LessonModel.Ended = CommonService.convertToUTCDate(new Date().toString());
      if (this.playlistService.LessonModel.Tags == null) {
        this.playlistService.LessonModel.Tags = "";
      }
      this.loaderService.processloader = true;
      this.playlistService.post('/lesson/UpsertLesson', this.playlistService.LessonModel, new HttpParams()).subscribe((response: any) => {
        this.loaderService.processloader = false;
        this.toastr.success("Playlist saved successfully.");
        localStorage.removeItem("Playlist");
        this.playlistService.LessonModel = null;
        CommonService.isPlayListLoaded = false;
        this.router.navigate(['/student/playlist-library']);
      });
    } else {
      if (this.playlistService.libraryNodes != undefined) {
        this.playlistService.initialiseLessonModel();
        var nodeLength = this.playlistService.libraryNodes.length;
        for (let index = 0; index < nodeLength; index++) {
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
      } else {
        this.playlistService.LessonModel.LessonQueue = "";
      }

      if (CommonService.treeViewObject == null) {
        this.playlistService.LessonModel.LessonHistory = '';
      }
      else {
        this.playlistService.LessonModel.LessonHistory = JSON.stringify(CommonService.treeViewObject.libraryHistory);
      }
      if (this.playlistService.LessonModel.Tags == null) {
        this.playlistService.LessonModel.Tags = "";
      }
      this.loaderService.processloader = true;
      this.playlistService.post('/lesson/UpsertLesson', this.playlistService.LessonModel, new HttpParams()).subscribe((response: any) => {
        this.loaderService.processloader = false;
        this.toastr.success("Playlist saved successfully.");
        this.playlistService.LessonModel=response;
        localStorage.setItem("Playlist", JSON.stringify(this.playlistService.LessonModel));
       // localStorage.removeItem("Playlist");
        //this.playlistService.LessonModel = null;
        //this.router.navigate(['/student/dashboard']);
      });
    }
  }

  addSong() {
    this.songService.songId = 0;
    this.songService.songTags = "";
    this.songService.IsAddedFromLibrary = false;
    if (localStorage.getItem('Playlist') != null && localStorage.getItem('Playlist') != "") {
      this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));
      CommonService.isPlayListLoaded = false;
    }
    this.router.navigate(['/student/playlist/add-song']);
  }

  addExercise() {
    this.exerciseLibraryService.exerciseId = 0;
    this.exerciseLibraryService.exerciseTags = "";
    this.exerciseLibraryService.IsAddedFromLibrary = false;
    if (localStorage.getItem('Playlist') != null && localStorage.getItem('Playlist') != "") {
      this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));
      CommonService.isPlayListLoaded = false;
    }
    this.router.navigate(['/student/playlist/add-exercise']);
  }

  addVideo() {
    this.videoService.videoId = 0;
    this.videoService.videoTags = "";
    this.videoService.IsAddedFromLibrary = false;
    if (localStorage.getItem('Playlist') != null && localStorage.getItem('Playlist') != "") {
      this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));
      CommonService.isPlayListLoaded = false;
    }
    this.router.navigate(['/student/playlist/add-video']);
  }
}
