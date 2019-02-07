import { Component, OnInit } from '@angular/core';
import { SongsService } from '../../../services/song.service';
import { AddSongComponent } from '../add-song/add-song.component';
import { LessonsService } from '../../../services/lessons.service';
import { CommonService } from '../../../common/common.service';
import { BlobService } from 'angular-azure-blob-service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { SharedlibraryService } from '../../../services/sharedlibrary.service';
import { HttpParams } from '@angular/common/http';
import { GuidedvideoService } from '../../../services/guidedvideo.service';
import { ExerciseLibraryService } from '../../../services/exercise-library.service';
import { AddExerciseComponent } from '../add-exercise/add-exercise.component';
import { PlaylistService } from '../../../services/playlist.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {

 
  isDropup = true;
  isGuidedVideoLesson: boolean = false;
  isPlaylist: boolean = false;

  constructor(private songService: SongsService, private lessonSer: LessonsService, private blob: BlobService, private toastr: ToastrService,
    private route: Router, public sharedLibrary: SharedlibraryService, public guidedvideoService: GuidedvideoService,
    public exerciseService:ExerciseLibraryService,private lessonService: LessonsService,public playlistService:PlaylistService) {
    this.sharedLibrary.saveItemSource = "library";
    this.isGuidedVideoLesson = this.route.url.includes('guidedvideo-lessonplanner');
    this.isPlaylist = this.route.url.includes('playlist');
  }

  ngOnInit() {
  }

  addNewSong() {
    this.songService.songId = 0;
    this.songService.songTags = "";
    CommonService.parentNodeList = undefined;
    var songObj = new AddSongComponent(this.sharedLibrary, this.toastr, this.route,
      this.blob, this.lessonSer, this.songService, null, this.guidedvideoService,this.playlistService);
    songObj.selectedGenre = [];
    songObj.songTagsList = [];
    songObj.selectedVocal = [];
    songObj.initialiseSongData();
    if (this.isGuidedVideoLesson == false && this.isPlaylist==false) {
      CommonService.isEditLessonQueueLoaded = false;
      if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != ""
        && localStorage.getItem('EditLesson') != undefined) {
        this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      }
      this.route.navigate(['/teacher/lesson-planner/add-song']);
    }
    else if (this.isGuidedVideoLesson == true && this.isPlaylist==false) {
      CommonService.isGVLessonQueueLoaded = false;
      if (localStorage.getItem('GVLesson') != null && localStorage.getItem('GVLesson') != ""
        && localStorage.getItem('GVLesson') != undefined) {
        this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
      }
      this.route.navigate(['/teacher/guidedvideo-lessonplanner/add-song']);
    }
    else if (this.isGuidedVideoLesson == false && this.isPlaylist==true) {
      CommonService.isPlayListLoaded = false;
      if (localStorage.getItem('Playlist') != null && localStorage.getItem('Playlist') != ""
        && localStorage.getItem('Playlist') != undefined) {
        this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));
      }
      this.route.navigate(['/student/playlist/add-song']);
    }
  }

  redirectToLibrary() {
    if (this.isGuidedVideoLesson == false && this.isPlaylist==false) {
      CommonService.isEditLessonQueueLoaded = false;
      CommonService.parentNodeList = undefined;
      this.route.navigate(['/teacher/lesson-planner/library']);
    } else if (this.isGuidedVideoLesson == true && this.isPlaylist==false) {
      CommonService.isGVLessonQueueLoaded = false;
      this.guidedvideoService.isGVLesson=true;
      this.guidedvideoService.redirectfromExercise=true;
      this.route.navigate(['/teacher/guidedvideo-lessonplanner']);
    }
    else if (this.isGuidedVideoLesson == false && this.isPlaylist==true) {
      CommonService.isPlayListLoaded = false;
      this.playlistService.isPlaylistLesson=true;
      this.playlistService.redirectfromExercise=true;
      this.route.navigate(['/student/playlist']);
    }
  }

  upsertLesson() {
    if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "") {
      if (this.sharedLibrary.LessonModel.LessonId > 0) {
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
        } else {
          this.sharedLibrary.LessonModel.Users = "";
        }

       /*  if (this.sharedLibrary.LessonModel.Student != undefined) {
          if (this.sharedLibrary.LessonModel.Student.length > 0) {
            this.sharedLibrary.LessonModel.Student.forEach(element => {
              if (this.sharedLibrary.LessonModel.Users == null)
                this.sharedLibrary.LessonModel.Users = element.UserId + ',';
              else
                this.sharedLibrary.LessonModel.Users = this.sharedLibrary.LessonModel.Users + element.UserId + ',';
            });
          }
          else {
            this.sharedLibrary.LessonModel.Users = "";
          }
        }
        else {
          this.sharedLibrary.LessonModel.Users = "";
        } */

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
        if (this.sharedLibrary.LessonModel.Tags == null) {
          this.sharedLibrary.LessonModel.Tags = "";
        }
        //this.sharedLibrary.LessonModel.Ended = CommonService.convertToUTCDate(Date.now.toString());
        this.sharedLibrary.LessonModel.Ended =  CommonService.convertToUTCDate(new Date().toString());
        this.sharedLibrary.post('/lesson/UpsertLesson', this.sharedLibrary.LessonModel, new HttpParams()).subscribe((response: any) => {
          this.toastr.success("Lesson saved successfully.");
          localStorage.removeItem("EditLesson");
          this.sharedLibrary.LessonModel = null;
          CommonService.isEditLessonQueueLoaded = false;
          this.route.navigate(['/teacher/lesson-library']);
        });
      }
    } else {
      this.route.navigate(['/teacher/video-library']);
    }
  }

  upsertGuidedVideoLesson() {
    if (localStorage.getItem('GVLesson') != null && localStorage.getItem('GVLesson') != "") {
      if (this.guidedvideoService.LessonModel.LessonId > 0) {
        this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
        if (this.guidedvideoService.LessonModel.Student != undefined) {
          if (this.guidedvideoService.LessonModel.Student.length > 0) {
            this.guidedvideoService.LessonModel.Student.forEach(element => {
              if (this.guidedvideoService.LessonModel.Users == null)
                this.guidedvideoService.LessonModel.Users = element.UserId + ',';
              else
                this.guidedvideoService.LessonModel.Users = this.guidedvideoService.LessonModel.Users + element.UserId + ',';
            });
          }
          else {
            this.guidedvideoService.LessonModel.Users = "";
          }
        }
        else {
          this.guidedvideoService.LessonModel.Users = "";
        }

        if (this.guidedvideoService.libraryNodes != undefined) {
          var nodeLength = this.guidedvideoService.libraryNodes.length;
          for (let index = 0; index < nodeLength; index++) {
            if (this.guidedvideoService.libraryNodes[0].LabelName == 'Drag Here!...') {
              this.guidedvideoService.libraryNodes.splice(index, 1);
              break;
            }
          }
          if (this.guidedvideoService.libraryNodes.length > 0) {
            this.guidedvideoService.LessonModel.LessonQueue = JSON.stringify(this.guidedvideoService.libraryNodes);
          } else {
            this.guidedvideoService.LessonModel.LessonQueue = "";
          }
        } else {
          this.guidedvideoService.LessonModel.LessonQueue = "";
        }
        if (this.guidedvideoService.LessonModel.Tags == null) {
          this.guidedvideoService.LessonModel.Tags = "";
        }
        this.guidedvideoService.LessonModel.isGuidedVideoLessonCompleted=true;
        //this.guidedvideoService.LessonModel.Ended = CommonService.convertToUTCDate(Date.now.toString());
        this.guidedvideoService.LessonModel.Ended =  CommonService.convertToUTCDate(new Date().toString());
        this.guidedvideoService.post('/lesson/UpsertLesson', this.guidedvideoService.LessonModel, new HttpParams()).subscribe((response: any) => {
          this.toastr.success("Lesson saved successfully.");
          localStorage.removeItem("GVLesson");
          localStorage.removeItem("VideoSubmissionId");
          this.guidedvideoService.LessonModel = null;
          CommonService.isGVLessonQueueLoaded = false;
          this.route.navigate(['/teacher/lesson-library']);
        });
      }
    }
  }

  upsertPlayListLesson() {
    if (localStorage.getItem('Playlist') != null && localStorage.getItem('Playlist') != "") {
      if (this.playlistService.LessonModel.LessonId > 0) {
        this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));
        if (this.playlistService.LessonModel.Student != undefined) {
          if (this.playlistService.LessonModel.Student.length > 0) {
            this.playlistService.LessonModel.Student.forEach(element => {
              if (this.playlistService.LessonModel.Users == null)
                this.playlistService.LessonModel.Users = element.UserId + ',';
              else
                this.playlistService.LessonModel.Users = this.playlistService.LessonModel.Users + element.UserId + ',';
            });
          }
          else {
            this.playlistService.LessonModel.Users = "";
          }
        }
        else {
          this.playlistService.LessonModel.Users = "";
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
        if (this.playlistService.LessonModel.Tags == null) {
          this.playlistService.LessonModel.Tags = "";
        }
        this.playlistService.LessonModel.isGuidedVideoLessonCompleted=true;
        //this.guidedvideoService.LessonModel.Ended = CommonService.convertToUTCDate(Date.now.toString());
        this.playlistService.LessonModel.Ended = CommonService.convertToUTCDate(new Date().toString());
        this.playlistService.post('/lesson/UpsertLesson', this.playlistService.LessonModel, new HttpParams()).subscribe((response: any) => {
          this.toastr.success("Playlist saved successfully.");
          localStorage.removeItem("Playlist");
          this.playlistService.LessonModel = null;
          CommonService.isPlayListLoaded = false;
          this.route.navigate(['/student/playlist-library']);
        });
      }
    } else {
      this.route.navigate(['/student/video-library']);
    }
  }
  
  addRecordVideo(){
    CommonService.isGVLessonQueueLoaded = false;
    this.guidedvideoService.isGVLesson = true;
    this.route.navigate(['/teacher/guidedvideo-lessonplanner']);
  }

  redirectGuidedLessonVideo(){
    CommonService.isGVLessonQueueLoaded = false;
    this.guidedvideoService.isGVLesson = true;
    this.route.navigate(['/teacher/guidedvideo-lessonplanner']);
  }

  addNewExercise() {
    this.exerciseService.exerciseId = 0;
    this.exerciseService.exerciseTags = "";
    var exerciseObj = new AddExerciseComponent(this.toastr, this.route, this.exerciseService, this.blob,
      this.lessonService, this.sharedLibrary, null, this.guidedvideoService,this.playlistService);
    exerciseObj.selectedKey = [];
    exerciseObj.selectedVocal = [];
    exerciseObj.skillLevel = 0;
    exerciseObj.initialiseExerciseData();
    if (this.isGuidedVideoLesson == false  && this.isPlaylist==false) {
      CommonService.isEditLessonQueueLoaded = false;
      CommonService.parentNodeList = undefined;
      if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != ""
        && localStorage.getItem('EditLesson') != undefined) {
        this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      }
      this.route.navigate(['/teacher/lesson-planner/add-exercise']);
    }
    else if (this.isGuidedVideoLesson == true && this.isPlaylist==false) {
      CommonService.isGVLessonQueueLoaded = false;
      if (localStorage.getItem('GVLesson') != null && localStorage.getItem('GVLesson') != ""
        && localStorage.getItem('GVLesson') != undefined) {
        this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
      }
      this.route.navigate(['/teacher/guidedvideo-lessonplanner/add-exercise']);
    }
    else if (this.isGuidedVideoLesson == false && this.isPlaylist==true) {
      CommonService.isPlayListLoaded = false;
      if (localStorage.getItem('Playlist') != null && localStorage.getItem('Playlist') != ""
        && localStorage.getItem('Playlist') != undefined) {
        this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));
      }
      this.route.navigate(['/student/playlist/add-exercise']);
    }
  }

}

