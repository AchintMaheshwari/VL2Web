import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { MatDialog, MatChipInputEvent } from '@angular/material';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonService } from '../../../common/common.service';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes, UploaderOptions, UploadStatus } from 'ngx-uploader';
import { BlobService, UploadConfig } from 'angular-azure-blob-service'
import { Config } from '../../../models/config.template';
import { Node } from '../../tree-view/node';
import { LoaderService } from '../../../services/loader.service';
import { VideoService } from '../../../services/video.service';
import { RecordVideoComponent } from '../add-video-feedback/record-video/record-video.component';
import { VideoSubmissionCompleteComponent } from '../add-video-feedback/video-submission-complete/video-submission-complete.component';
import { ConfirmVideoChangeComponent } from '../add-video-feedback/confirm-video-change/confirm-video-change.component';
import { VideoModel } from '../../../models/video.model';
import { SharedlibraryService } from '../../../services/sharedlibrary.service';
import { GuidedvideoService } from '../../../services/guidedvideo.service';
import { PlaylistService } from '../../../services/playlist.service';

@Component({
  selector: 'app-add-video',
  templateUrl: './add-video.component.html',
  styleUrls: ['./add-video.component.scss'],
})


export class AddVideoComponent implements OnInit {
  sasToken: any;
  ReadFile: void;
  addOnBlur: boolean = true;
  isDropup = true;
  removable = true;
  isAddVideoFlag: boolean = false;
  nodes: Array<Node>;
  separatorKeysCodes = [ENTER, COMMA];
  @ViewChild('addVideo') form: any;

  options: UploaderOptions;
  formData: FormData;
  files: UploadFile[];
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;
  config: UploadConfig;
  videoTags = [];
  jsonObj: any;
  window: any;
  uploadRecordedVideoURL: string;
  videoModel: VideoModel;
  videoData: any;

  @ViewChild('video') video: any
  isGuidedVideoLesson: boolean = false;
  percent: number;
  isPlaylist:boolean=false;

  constructor(private toastr: ToastrService, private route: Router, private blob: BlobService,
    private loaderService: LoaderService, public videoService: VideoService, public dialog: MatDialog,
    public sharedLibrary: SharedlibraryService, public guidedvideoService: GuidedvideoService,public playlistService:PlaylistService) {
    this.config = null
    this.options = { concurrency: 1, maxUploads: 3 };
    this.files = []; // local uploading files array
    this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes;
    this.isGuidedVideoLesson = this.route.url.includes('guidedvideo-lessonplanner');
    this.isPlaylist = this.route.url.includes('playlist');
  }

  ngOnInit() {
    this.window = window;
    this.initialiseVideoData();
    if (this.videoService.videoId > 0) {
      this.videoService.get('/Video/GetVideoDataById', new HttpParams().set('videoId', this.videoService.videoId.toString())).subscribe(result => {
        this.videoData = result;
        this.videoModel = this.videoData;
        this.videoModel.Tags = this.videoService.videoTags;
        if (this.videoModel.VideoURL.includes('vldevstoragefuncapp')) {
          this.videoService.videoURL = this.videoModel.VideoURL;
        }
        else if (this.videoModel.OtherVideoUrl != "") {
          this.videoService.otherVideoUrl = this.videoModel.OtherVideoUrl;
        } else {
          this.videoService.inputVideoURL = this.videoModel.VideoURL;
        }
        if (this.videoModel.Tags.trim() != "") {
          this.videoModel.Tags.split(',').forEach(x => {
            this.videoTags.push({ name: x.trim() });
          });
        }
      })
    }
  }

  public initialiseVideoData() {
    this.videoModel = {
      VideoId: 0,
      VideoGUID: "",
      VideoName: '',
      CreatedOn: new Date(),
      ModifiedOn: null,
      CreatedByUserId: 0,
      VideoURL: "",
      IsDeleted: false,
      LibraryType: 0,
      ModifiedByUserId: 0,
      Tags: "",
      OtherVideoUrl: "",
      AccessType: "Private"
    }
    this.videoService.inputVideoURL = "";
    this.videoService.videoURL = "";
    this.videoModel.Tags = "";
    this.videoService.otherVideoUrl = "";
  }

  upsertVideo() {
    this.isAddVideoFlag = true;
    if (this.videoTags.length === 0) {
      this.toastr.warning("Tags required.");
    } else {
      if (this.form.valid) {
        if (this.videoService.inputVideoURL == "" && this.videoService.videoURL == "" && this.videoService.otherVideoUrl == "") {
          this.toastr.warning('You must provide a submission using recording, uploading, or a pasting a link');
        } else {
          let userId = CommonService.getUser().UserId;
          this.videoModel.Tags = "";
          this.videoTags.forEach(element => {
            this.videoModel.Tags = this.videoModel.Tags + element.name + ',';
          });
          this.videoModel.Tags = this.videoModel.Tags.substr(0, this.videoModel.Tags.length - 1);
          this.videoModel.CreatedByUserId = userId;
          this.videoModel.IsDeleted = false;

          if (this.videoService.videoURL.includes('vldevstoragefuncapp')) {
            this.videoModel.VideoURL = this.videoService.videoURL;
            this.videoModel.OtherVideoUrl = "";
          } else if (this.videoService.otherVideoUrl != "") {
            this.videoModel.OtherVideoUrl = this.videoService.otherVideoUrl;
            this.videoModel.VideoURL = "";
          } else {
            this.videoModel.VideoURL = this.videoService.inputVideoURL;
            this.videoModel.OtherVideoUrl = "";
          }

          this.videoService.post('/Video/UpsertVideo', this.videoModel, new HttpParams()).subscribe((response: any) => {
            this.form.reset();
            this.videoTags = [];
            this.videoService.inputVideoURL = "";
            this.videoService.videoURL = "";
            this.videoService.otherVideoUrl = "";
            var newAddedVideo = response;
            this.isGuidedVideoLesson = this.route.url.includes('guidedvideo-lessonplanner');
            //-------------if exercise added in an lesson--------------------------------------------------------------------
            if (!this.isGuidedVideoLesson && !this.isPlaylist && (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "")) {
              this.addVideoInLiveLesson(newAddedVideo);
            }
            else if (this.isGuidedVideoLesson && !this.isPlaylist) {
              this.addVideoInGuidedVideoLesson(newAddedVideo);
            }
            else if (!this.isGuidedVideoLesson && this.isPlaylist) {
              this.addVideoInPlaylistLesson(newAddedVideo);
          }
            else {
              if (this.videoModel.VideoId > 0) {
                this.videoService.videoId = 0;
                this.videoService.videoTags = "";
                this.toastr.success('An Video Updated!!');
                if (this.sharedLibrary.saveItemSource === "library")
                  this.route.navigateByUrl('/teacher/video-library');
              }
              else if (this.videoService.IsAddedFromLibrary == true) {
                this.videoService.IsAddedFromLibrary = false;
                this.toastr.success('A New video Added in Library!!');
                if (this.sharedLibrary.saveItemSource === "library")
                  this.route.navigateByUrl('/teacher/video-library');
              }
              else {
                this.toastr.success('A New video Added in Queue!!');
                if (this.sharedLibrary.saveItemSource === "library")
                  this.route.navigate(['/teacher/lesson-planner/library']);
              }
            }
          });
        }
      } else {
        this.toastr.warning('Please Fill Required Fields!');
      }
    }
  }

  addVideoInLiveLesson(newAddedVideo) {
    this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
    this.nodes = [];
    if (this.sharedLibrary.LessonModel.LessonQueue != "") {
      var Queue = JSON.parse(this.sharedLibrary.LessonModel.LessonQueue);
      var nodes = this.addLiveLessonQueue(Queue, newAddedVideo);
      this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
      var nodeLength = nodes.length;
      for (let index = 0; index < nodeLength; index++) {
        if (nodes[0].LabelName == 'Drag Here!...') {
          nodes.splice(index, 1);
          break;
        }
      }
      this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(nodes);
    } else {
      this.nodes.push(new Node(newAddedVideo.VideoId, CommonService.getGuid(), newAddedVideo.VideoName, '', newAddedVideo.VideoURL, '', '', 'Video', newAddedVideo.CreatedByUserId, false, '', '', '', '', '', false, false, [], undefined, undefined))
      this.sharedLibrary.LessonModel.LessonQueue = JSON.stringify(this.nodes);
    }

    if (this.sharedLibrary.LessonModel.Student != undefined) {
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
    }

    if (this.sharedLibrary.LessonModel.Tags == null) {
      this.sharedLibrary.LessonModel.Tags = "";
    }
    this.sharedLibrary.post('/lesson/UpsertLesson', this.sharedLibrary.LessonModel, new HttpParams()).subscribe((response: any) => {

      this.sharedLibrary.LessonModel.LessonQueue = response.LessonQueue;
      localStorage.setItem('EditLesson', JSON.stringify(this.sharedLibrary.LessonModel));
      if (this.sharedLibrary.saveItemSource === "library") {
        CommonService.isEditLessonQueueLoaded = false;
        this.route.navigate(['/teacher/lesson-planner/library']);
      }
      else if (this.sharedLibrary.saveItemSource === "video") {
        CommonService.isEditLessonQueueLoaded = true;
        this.window.addItemLessonQueue(nodes);
        this.sharedLibrary.isSong = this.sharedLibrary.isExercise = this.sharedLibrary.isVideo = false;
        this.sharedLibrary.isLibrary = true;
      }
    });
  }

  addVideoInGuidedVideoLesson(newAddedVideo) {
    this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
    this.nodes = [];
    if (this.guidedvideoService.LessonModel.LessonQueue != "") {
      var Queue = JSON.parse(this.sharedLibrary.LessonModel.LessonQueue);
      var nodes = this.addLiveLessonQueue(Queue, newAddedVideo);
      this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
      var nodeLength = nodes.length;
      for (let index = 0; index < nodeLength; index++) {
        if (nodes[0].LabelName == 'Drag Here!...') {
          nodes.splice(index, 1);
          break;
        }
      }
      this.guidedvideoService.LessonModel.LessonQueue = JSON.stringify(nodes);
    } else {
      this.nodes.push(new Node(newAddedVideo.VideoId, CommonService.getGuid(), newAddedVideo.VideoName, '', newAddedVideo.VideoURL, '', '', 'Video', newAddedVideo.CreatedByUserId, false, '', '', '', '', '', false, false, [], undefined, undefined))
      this.guidedvideoService.LessonModel.LessonQueue = JSON.stringify(this.nodes);
    }

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

    if (this.guidedvideoService.LessonModel.Tags == null) {
      this.guidedvideoService.LessonModel.Tags = "";
    }
    this.guidedvideoService.post('/lesson/UpsertLesson', this.guidedvideoService.LessonModel, new HttpParams()).subscribe((response: any) => {
      this.guidedvideoService.LessonModel.LessonQueue = response.LessonQueue;
      localStorage.setItem('GVLesson', JSON.stringify(this.guidedvideoService.LessonModel));
      CommonService.isGVLessonQueueLoaded = false;
      this.route.navigate(['teacher/guidedvideo-lessonplanner']);
    });
  }

  addVideoInPlaylistLesson(newAddedVideo) {
    this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));
    this.nodes = [];
    if (this.playlistService.LessonModel.LessonQueue != "") {
      var Queue = JSON.parse(this.playlistService.LessonModel.LessonQueue);
      var nodes = this.addLiveLessonQueue(Queue, newAddedVideo);
      this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));
      var nodeLength = nodes.length;
      for (let index = 0; index < nodeLength; index++) {
        if (nodes[0].LabelName == 'Drag Here!...') {
          nodes.splice(index, 1);
          break;
        }
      }
      this.playlistService.LessonModel.LessonQueue = JSON.stringify(nodes);
    } else {
      this.nodes.push(new Node(newAddedVideo.VideoId, CommonService.getGuid(), newAddedVideo.VideoName, '', newAddedVideo.VideoURL, '', '', 'Video', newAddedVideo.CreatedByUserId, false, '', '', '', '', '', false, false, [], undefined, undefined))
      this.playlistService.LessonModel.LessonQueue = JSON.stringify(this.nodes);
    }

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

    if (this.playlistService.LessonModel.Tags == null) {
      this.playlistService.LessonModel.Tags = "";
    }
    this.playlistService.post('/lesson/UpsertLesson', this.playlistService.LessonModel, new HttpParams()).subscribe((response: any) => {
      CommonService.isPlayListLoaded = false;
      this.videoService.videoId = 0;
      this.videoService.videoTags = "";
      this.route.navigate(['student/playlist']);
    });
  }

  addLiveLessonQueue(lessonQueue, newAddedVideo) {
    this.nodes = [];
    this.nodes.push(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
    if (lessonQueue != "") {
      var nodelist: any;
      nodelist = this.convertLessonToNodes(lessonQueue);
      for (var i = 0; i < nodelist.length; i++) {
        this.nodes.push(new Node(nodelist[i].SongId, CommonService.getGuid(), nodelist[i].LabelName, nodelist[i].Artist, nodelist[i].VideoUrl, nodelist[i].AudioFile, nodelist[i].JumpPoints, nodelist[i].FilterType, nodelist[i].CreatedByUserId, false, nodelist[i].NoteflightScoreID, nodelist[0].Lyrics, nodelist[i].TransLations, nodelist[i].LessonQueue, nodelist[i].Midi, nodelist[i].IsTeacherPlayed, nodelist[i].IsStudentPlayed, nodelist[i].nodes, nodelist[i].TeacherItemName, nodelist[i].StudentItemName));
      }
      this.nodes.push(new Node(newAddedVideo.VideoId, CommonService.getGuid(), newAddedVideo.VideoName, '', newAddedVideo.VideoURL, '', '', 'Video', newAddedVideo.CreatedByUserId, false, '', '', '', '', '', false, false, [], undefined, undefined))
    } else {
      this.nodes.push(new Node(newAddedVideo.VideoId, CommonService.getGuid(), newAddedVideo.VideoName, '', newAddedVideo.VideoURL, '', '', 'Video', newAddedVideo.CreatedByUserId, false, '', '', '', '', '', false, false, [], undefined, undefined))
    }
    return this.nodes;
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
          nodeList[parentCounter].nodes.push(new Node(childelement.SongId, CommonService.getGuid(), childelement.LabelName, childelement.Artist, childelement.VideoUrl, childelement.AudioFile, childelement.JumpPoints, childelement.FilterType, childelement.CreatedByUserId, false, childelement.NoteflightScoreID, childelement.Lyrics, childelement.TransLations, childelement.LessonQueue, childelement.Midi, childelement.IsTeacherPlayed, childelement.IsStudentPlayed, [], childelement.TeacherItemName, childelement.StudentItemName));
          if (childelement.nodes.length != 0) {
            var subchildCounter = 0;
            childelement.nodes.forEach(subchildelement => {
              nodeList[parentCounter].nodes[childCounter].nodes.push(new Node(subchildelement.SongId, CommonService.getGuid(), subchildelement.LabelName, subchildelement.Artist, subchildelement.VideoUrl, subchildelement.AudioFile, subchildelement.JumpPoints, subchildelement.FilterType, subchildelement.CreatedByUserId, false, subchildelement.NoteflightScoreID, subchildelement.Lyrics, subchildelement.TransLations, subchildelement.LessonQueue, subchildelement.Midi, subchildelement.IsTeacherPlayed, subchildelement.IsStudentPlayed, [], subchildelement.TeacherItemName, subchildelement.StudentItemName));
              subchildCounter = subchildCounter + 1;
            });
          }
          childCounter = childCounter + 1;
        });
      }
      parentCounter = parentCounter + 1;
    });
    return nodeList;
  }

  onUploadOutput(output: UploadOutput): void {
    if (output.file != undefined) {
      this.videoService.file = output.file;

      if (this.videoService.videoURL == "" && this.videoService.inputVideoURL == "" && this.videoService.otherVideoUrl == "") {
        this.startUpload(output.file);
        if (output.type === 'allAddedToQueue') {
        }
        else if (output.type === 'addedToQueue' && typeof output.file !== 'undefined') {
        }
        else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
          const index = this.files.findIndex(file => typeof output.file !== 'undefined' && file.id === output.file.id);
          this.files[index] = output.file;
        }
        else if (output.type === 'removed') {
          this.files = this.files.filter((file: UploadFile) => file !== output.file);
        }
        else if (output.type === 'dragOver') {
          this.dragOver = true;
        }
        else if (output.type === 'dragOut') {
          this.dragOver = false;
        }
        else if (output.type === 'drop') {
          this.dragOver = false;
        }
        else if (output.type === 'rejected' && typeof output.file !== 'undefined') {
          console.log(output.file.name + ' rejected');
        }
        this.files = this.files.filter(file => file.progress.status !== UploadStatus.Done);
      } else {
        this.videoService.isOpenUploadVideo = true;
        const dialogRef = this.dialog.open(ConfirmVideoChangeComponent, {});
      }
    }
  }

  startUpload(fileUpload) {
    //this.loaderService.processloader = true;
    var fileExt = fileUpload.nativeFile.name.substr(fileUpload.nativeFile.name.lastIndexOf('.') + 1);
    if (fileExt == 'mp4' || fileExt == 'webm') {
      this.videoService.post('/planner/GetBlobSasToken?filename=' + fileUpload.nativeFile.name + '&containerName=' + "vl2songs", new HttpParams()).subscribe((response: any) => {
        Config.sas = response;
        if (fileUpload !== null) {
          const baseUrl = this.blob.generateBlobUrl(Config, fileUpload.nativeFile.name);
          this.config = {
            baseUrl: baseUrl,
            sasToken: Config.sas,
            blockSize: 1024 * 64, // OPTIONAL, default value is 1024 * 32
            file: fileUpload.nativeFile,
            complete: () => {
              this.videoService.videoURL = baseUrl;
              this.toastr.success('Transfer completed!!');
            },
            error: () => {
              console.log('Error !');
              this.videoService.videoURL = "";
            },
            progress: (percent) => {
              this.loaderService.percent=percent;
             // this.percent = percent;
               // if (percent < 100)
               // this.loaderService.progressLoader = true
              //else 
              if (percent === 100){
               // this.loaderService.processloader = false;
              }  
            }
          };
          this.blob.upload(this.config);
        }
      });
    } else {
      this.toastr.warning('Please upload mp4/webm video only!');
    }
  }

  checkPreviousVideoChange() {
    if (this.videoService.videoURL != "" || this.videoService.inputVideoURL != "" || this.videoService.otherVideoUrl != "") {
      this.videoService.isOpenRecordVideo = true;
      this.openConfirmVideoChangeModal();
    } else {
      this.openRecordModal();
    }
  }

  openRecordModal(): void {
    const dialogRef = this.dialog.open(RecordVideoComponent, {
    });
  }

  checkVideoChange() {
    if (this.videoService.videoURL != "" || this.videoService.otherVideoUrl != "") {//} && this.videoService.inputVideoURL == "") {
      this.videoService.isOpenVideoURL = true;
      this.openConfirmVideoChangeModal();
    }
  }

  openConfirmVideoChangeModal(): void {
    const dialogRef = this.dialog.open(ConfirmVideoChangeComponent, {
    });
  }

  setVideoURL() {
    if (this.videoService.inputVideoURL.length > 0) {
      this.videoService.inputVideoURL = this.videoService.inputVideoURL.trim();
    } else {
      this.videoService.inputVideoURL = "";
    }
  }

  checkOtherVideoChange() {
    if (this.videoService.videoURL != "" || this.videoService.inputVideoURL != "") {//} && this.videoService.inputVideoURL == "") {
      this.videoService.isOpenOtherVideoUrl = true;
      this.openConfirmVideoChangeModal();
    }
  }

  setOtherUrl() {
    if (this.videoService.otherVideoUrl.length > 0) {
      this.videoService.otherVideoUrl = this.videoService.otherVideoUrl.trim();
    } else {
      this.videoService.otherVideoUrl = "";
    }
  }

  openVideoSubmissionCompleteModal(): void {
    const dialogRef = this.dialog.open(VideoSubmissionCompleteComponent, {
    });
  }

  add(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    // Add Tags
    if ((value || '').trim() && this.videoTags.findIndex(x => x.name === value.trim()) === -1) {
      this.videoTags.push({ name: value.trim() });
    }
    else if (this.videoTags.findIndex(x => x.name === value.trim()) != -1) {
      this.toastr.warning("This tag already exists !")
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(exTags: any): void {
    let index = this.videoTags.indexOf(exTags);
    if (index >= 0) {
      this.videoTags.splice(index, 1);
    }
  }

  restrictWhiteSpace() {
    if (this.videoModel.VideoName.length > 0) {
      this.videoModel.VideoName = this.videoModel.VideoName.trim();
    }
  }

  onAccessChange(value) {
    if (value) {
        this.videoModel.AccessType = "Public";
    }
    else {
        this.videoModel.AccessType = "Private";
    }
  }
}


