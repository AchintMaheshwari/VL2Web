import { Component, OnInit, OnDestroy } from '@angular/core';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { SongsService } from '../../../services/song.service';
import { Node } from '../../tree-view/node';
import { SharedlibraryService } from '../../../services/sharedlibrary.service';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../common/common.service';
import { Router } from '@angular/router';
import { ExerciseLibraryService } from '../../../services/exercise-library.service';
import { LoaderService } from '../../../services/loader.service';
import { VideoService } from '../../../services/video.service';
import { LessonsService } from '../../../services/lessons.service';

declare var VoiceLessons: any;
declare var VoiceLessonsExercisePlayer: any;

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})

export class LibraryComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    CommonService.parentNodeList = undefined;
    CommonService.currentParentNodeList = undefined;
    this.sharedLibrary.libraryNodes = undefined;
    VoiceLessons.destoryPlayer();
    VoiceLessonsExercisePlayer.stopMusic();
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
    public sharedLibrary: SharedlibraryService, private toastr: ToastrService, private router: Router,
    public exerciseLibraryService: ExerciseLibraryService, private loaderService: LoaderService,
    public videoService: VideoService, public lessonSer: LessonsService) {
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

  playSong(objSongData) {

  }

  upsertLesson() {
    if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
      this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));

      if (this.lessonSer.currentLessonTags != undefined) {
        this.sharedLibrary.LessonModel.Tags = this.lessonSer.currentLessonTags.trim();
      }

      if (this.lessonSer.currentLessonStudent != undefined) {
        if (this.lessonSer.currentLessonStudent != "") {
          this.sharedLibrary.LessonModel.Student = this.lessonSer.currentLessonStudent.trim().split(',');
        } else {
          this.sharedLibrary.LessonModel.Student = [];
        }
      }

      if (this.sharedLibrary.LessonModel.Student != undefined) {
        this.sharedLibrary.LessonModel.Student.forEach(element => {
          if (this.sharedLibrary.LessonModel.Users == null)
            this.sharedLibrary.LessonModel.Users = element + ',';
          else
            this.sharedLibrary.LessonModel.Users = this.sharedLibrary.LessonModel.Users + element + ',';
        });
      }

      if (this.sharedLibrary.libraryNodes != undefined) {
        var nodeLength = this.sharedLibrary.libraryNodes.length;
        for (let index = 0; index < nodeLength; index++) {
          if (this.sharedLibrary.libraryNodes[0].LabelName == 'Drag Here!...') {
            this.sharedLibrary.libraryNodes.splice(index, 1);
            break;
          }
        }
        if (this.sharedLibrary.libraryNodes.length > 0) {
          this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(this.sharedLibrary.libraryNodes);
        } else {
          this.sharedLibrary.LessonModel.LessonQueue = "";
        }
      } else {
        this.sharedLibrary.LessonModel.LessonQueue = "";
      }
      //this.sharedLibrary.LessonModel.Ended = CommonService.convertToUTCDate(Date.now.toString());
      this.sharedLibrary.LessonModel.Ended = CommonService.convertToUTCDate(new Date().toString());
      if (this.sharedLibrary.LessonModel.Tags == null) {
        this.sharedLibrary.LessonModel.Tags = "";
      }
      this.loaderService.processloader = true;
      this.sharedLibrary.post('/lesson/UpsertLesson', this.sharedLibrary.LessonModel, new HttpParams()).subscribe((response: any) => {
        this.loaderService.processloader = false;
        this.toastr.success("Lesson saved successfully.");
        localStorage.removeItem("EditLesson");
        this.sharedLibrary.LessonModel = null;
        CommonService.isEditLessonQueueLoaded = false;
        this.router.navigate(['/teacher/lesson-library']);
      });
    } else {
      if (this.sharedLibrary.libraryNodes != undefined) {
        var nodeLength = this.sharedLibrary.libraryNodes.length;
        for (let index = 0; index < nodeLength; index++) {
          if (this.sharedLibrary.libraryNodes[0].LabelName == 'Drag Here!...') {
            this.sharedLibrary.libraryNodes.splice(index, 1);
            break;
          }
        }
        if (this.sharedLibrary.libraryNodes.length > 0) {
          this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(this.sharedLibrary.libraryNodes);
        } else {
          this.sharedLibrary.LessonModel.LessonQueue = "";
        }
      } else {
        this.sharedLibrary.LessonModel.LessonQueue = "";
      }

      if (CommonService.treeViewObject == null) {
        this.sharedLibrary.LessonModel.LessonHistory = '';
      }
      else {
        this.sharedLibrary.LessonModel.LessonHistory = JSON.stringify(CommonService.treeViewObject.libraryHistory);
      }
      if (this.sharedLibrary.LessonModel.Tags == null) {
        this.sharedLibrary.LessonModel.Tags = "";
      }
      this.loaderService.processloader = true;
      this.sharedLibrary.post('/lesson/UpsertLesson', this.sharedLibrary.LessonModel, new HttpParams()).subscribe((response: any) => {
        this.loaderService.processloader = false;
        this.toastr.success("Lesson saved successfully.");
        localStorage.removeItem("EditLesson");
        this.sharedLibrary.LessonModel = null;
        this.router.navigate(['/teacher/lesson-library']);
      });
    }
  }

  addSong() {
    this.songService.songId = 0;
    this.songService.songTags = "";
    this.songService.IsAddedFromLibrary = false;
    if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
      this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      CommonService.isEditLessonQueueLoaded = false;
    }
    this.router.navigate(['/teacher/lesson-planner/add-song']);
  }

  addExercise() {
    this.exerciseLibraryService.exerciseId = 0;
    this.exerciseLibraryService.exerciseTags = "";
    this.exerciseLibraryService.IsAddedFromLibrary = false;
    if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
      this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      CommonService.isEditLessonQueueLoaded = false;
    }
    this.router.navigate(['/teacher/lesson-planner/add-exercise']);
  }

  addVideo() {
    this.videoService.videoId = 0;
    this.videoService.videoTags = "";
    this.videoService.IsAddedFromLibrary = false;
    if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
      this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      CommonService.isEditLessonQueueLoaded = false;
    }
    this.router.navigate(['/teacher/lesson-planner/add-video']);
  }
}
