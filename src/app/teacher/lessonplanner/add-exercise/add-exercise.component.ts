import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { MatChipInputEvent } from '@angular/material';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { ExerciseModel } from '../../../models/exercise.model';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ExerciseLibraryService } from '../../../services/exercise-library.service';
import { CommonService } from '../../../common/common.service';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes, UploaderOptions, UploadStatus } from 'ngx-uploader';
import { BlobService, UploadConfig } from 'angular-azure-blob-service'
import { Config } from '../../../models/config.template';
import { Node } from '../../tree-view/node';
import { LessonsService } from '../../../services/lessons.service';
import { SharedlibraryService } from '../../../services/sharedlibrary.service';
import { LoaderService } from '../../../services/loader.service';
import { GuidedvideoService } from '../../../services/guidedvideo.service';
import { PlaylistService } from '../../../services/playlist.service';

export interface Skills {
  value: number;
  skill: string;
}

@Component({
  selector: 'app-add-exercise',
  templateUrl: './add-exercise.component.html',
  styleUrls: ['./add-exercise.component.scss']
})

export class AddExerciseComponent implements OnInit {
  sasToken: any;
  ReadFile: void;
  exerciseModel: ExerciseModel;
  addOnBlur: boolean = true;
  isDropup = true;
  removable = true;
  isAddExFlag: boolean = false;
  nodes: Array<Node>;
  @ViewChild('addExs') form: any;
  separatorKeysCodes = [ENTER, COMMA];
  options: UploaderOptions;
  formData: FormData;
  files: UploadFile[];
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;
  config: UploadConfig;
  exerciseTags = [];
  jsonObj: any;
  selectedVocal: any;
  selectedKey: any;
  skillLevel: any;
  copyParentExerciseId: number;
  window: any;
  isGuidedVideoLesson: boolean = false;
  isPlaylist:boolean=false;

  add(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    // Add Tags
    if ((value || '').trim() && this.exerciseTags.findIndex(x => x.name === value.trim()) === -1) {
      this.exerciseTags.push({ name: value.trim() });
    }
    else if (this.exerciseTags.findIndex(x => x.name === value.trim()) != -1) {
      this.toastr.warning("This tag already exists !")
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(exTags: any): void {
    let index = this.exerciseTags.indexOf(exTags);

    if (index >= 0) {
      this.exerciseTags.splice(index, 1);
    }
  }

  constructor(private toastr: ToastrService, private route: Router, public exerciseService: ExerciseLibraryService,
    private blob: BlobService, public lessonSer: LessonsService, public sharedLibrary: SharedlibraryService,
    private loaderService: LoaderService, public guidedvideoService: GuidedvideoService,public playlistService:PlaylistService) {
    this.config = null
    this.options = { concurrency: 1, maxUploads: 3 };
    this.files = []; // local uploading files array
    this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes;
    this.isGuidedVideoLesson = this.route.url.includes('guidedvideo-lessonplanner');
    this.isPlaylist = this.route.url.includes('playlist');
  }

  upsertExerciseData() {
    if (this.exerciseTags.length === 0) {
      this.toastr.warning("Tags required.");
    } else {
      if (this.form.valid) {
        if (this.exerciseModel.Midi != null && this.exerciseModel.Midi != '') {
          let userId = CommonService.getUser().UserId;
          this.exerciseModel.Tags = "";
          this.exerciseTags.forEach(element => {
            this.exerciseModel.Tags = this.exerciseModel.Tags + element.name + ',';
          });
          this.exerciseModel.Tags = this.exerciseModel.Tags.substr(0, this.exerciseModel.Tags.length - 1);
          this.exerciseModel.CreatedByUserId = userId;
          this.exerciseModel.IsDeleted = false;
          this.exerciseService.post('/planner/UpsertExercise', this.exerciseModel, new HttpParams()).subscribe((response: any) => {
            this.form.reset();
            this.exerciseTags = [];
            var newAddedExer = response;
            //-------------if exercise added in an lesson--------------------------------------------------------------------
            if (!this.isGuidedVideoLesson &&  !this.isPlaylist && (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "")) {
              this.addExerciseInLiveLesson(newAddedExer);
            }
            else if (this.isGuidedVideoLesson && !this.isPlaylist) {
              this.addExerciseInGuidedVideoLesson(newAddedExer);
            }
            else if (!this.isGuidedVideoLesson && this.isPlaylist) {
              this.addExerciseInPlaylistLesson(newAddedExer);
            }
            //------------------------------------------------------------------------------------------------------------
            else {
              if (this.exerciseModel.ExerciseId > 0) {
                this.exerciseService.exerciseId = 0;
                this.exerciseService.exerciseTags = null;
                this.toastr.success('An Exercise Updated!!');
                if (this.sharedLibrary.saveItemSource === "library") {
                  this.route.navigateByUrl('/teacher/exercise-library');
                }
              }
              else if (this.exerciseService.IsAddedFromLibrary == true) {
                this.exerciseService.IsAddedFromLibrary = false;
                this.toastr.success('A New Exercise Added in Library!!');
                if (this.sharedLibrary.saveItemSource === "library") {
                  this.route.navigateByUrl('/teacher/exercise-library');
                }
              }
              else {
                this.toastr.success('A New Exercise Added in Queue!!');
                if (this.sharedLibrary.saveItemSource === "library") {
                  this.route.navigate(['/teacher/lesson-planner/library']);
                }
              }
            }
          });
        }
        else {
          this.toastr.error('Please upload an exercise midi file or add using keys app!');
        }
      } else {
        this.toastr.warning('Please Fill Required Fields!');
      }
    }
  }

  addExerciseInLiveLesson(newAddedExer) {
    this.sharedLibrary.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
    this.nodes = [];
    if (this.sharedLibrary.LessonModel.LessonQueue != "") {
      var Queue = JSON.parse(this.sharedLibrary.LessonModel.LessonQueue);
      var nodes = this.addLiveLessonQueue(Queue, newAddedExer);
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
      this.nodes.push(new Node(newAddedExer.ExerciseId, CommonService.getGuid(), newAddedExer.ExerciseName, '', newAddedExer.VideoURL, '', '', 'Exercise', newAddedExer.CreatedByUserId, false, '', '', '', '', newAddedExer.Midi, false, false, [], undefined, undefined))
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

  addExerciseInGuidedVideoLesson(newAddedExer) {
    this.guidedvideoService.LessonModel = JSON.parse(localStorage.getItem('GVLesson'));
    this.nodes = [];
    if (this.guidedvideoService.LessonModel.LessonQueue != "") {
      var Queue = JSON.parse(this.guidedvideoService.LessonModel.LessonQueue);
      var nodes = this.addLiveLessonQueue(Queue, newAddedExer);
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
      this.nodes.push(new Node(newAddedExer.ExerciseId, CommonService.getGuid(), newAddedExer.ExerciseName, '', newAddedExer.VideoURL, '', '', 'Exercise', newAddedExer.CreatedByUserId, false, '', '', '', '', newAddedExer.Midi, false, false, [], undefined, undefined))
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
      CommonService.isGVLessonQueueLoaded = false;
      this.route.navigate(['teacher/guidedvideo-lessonplanner']);
    });
  }

  addExerciseInPlaylistLesson(newAddedExer) {
    this.playlistService.LessonModel = JSON.parse(localStorage.getItem('Playlist'));
    this.nodes = [];
    if (this.playlistService.LessonModel.LessonQueue != "") {
      var Queue = JSON.parse(this.playlistService.LessonModel.LessonQueue);
      var nodes = this.addLiveLessonQueue(Queue, newAddedExer);
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
      this.nodes.push(new Node(newAddedExer.ExerciseId, CommonService.getGuid(), newAddedExer.ExerciseName, '', newAddedExer.VideoURL, '', '', 'Exercise', newAddedExer.CreatedByUserId, false, '', '', '', '', newAddedExer.Midi, false, false, [], undefined, undefined))
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
      this.exerciseService.exerciseId = 0;
      this.exerciseService.exerciseTags = "";
      this.route.navigate(['student/playlist']);
    });
  }

  addLiveLessonQueue(lessonQueue, newAddedExercise) {
    this.nodes = [];
    this.nodes.push(new Node(CommonService.getGuid(), CommonService.getGuid(), 'Drag Here!...', null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null));
    if (lessonQueue != "") {
      var nodelist: any;
      nodelist = this.convertLessonToNodes(lessonQueue);
      for (var i = 0; i < nodelist.length; i++) {
        this.nodes.push(new Node(nodelist[i].SongId, CommonService.getGuid(), nodelist[i].LabelName, nodelist[i].Artist, nodelist[i].VideoUrl, nodelist[i].AudioFile, nodelist[i].JumpPoints, nodelist[i].FilterType, nodelist[i].CreatedByUserId, false, nodelist[i].NoteflightScoreID, nodelist[0].Lyrics, nodelist[i].TransLations, nodelist[i].LessonQueue, nodelist[i].Midi, nodelist[i].IsTeacherPlayed, nodelist[i].IsStudentPlayed, nodelist[i].nodes, nodelist[i].TeacherItemName, nodelist[i].StudentItemName));
      }
      this.nodes.push(new Node(newAddedExercise.ExerciseId, CommonService.getGuid(), newAddedExercise.ExerciseName, '', newAddedExercise.VideoURL, '', '', 'Exercise', newAddedExercise.CreatedByUserId, false, '', '', '', '', newAddedExercise.Midi, false, false, [], undefined, undefined))
    } else {
      this.nodes.push(new Node(newAddedExercise.ExerciseId, CommonService.getGuid(), newAddedExercise.ExerciseName, '', newAddedExercise.VideoURL, '', '', 'Exercise', newAddedExercise.CreatedByUserId, false, '', '', '', '', newAddedExercise.Midi, false, false, [], undefined, undefined))
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


  ngOnInit() {
    this.window = window;
    this.initialiseExerciseData();
    this.skillLevel = 0;
    this.lessonSer.getDropDownKeySetting();
    this.lessonSer.getDropDownSetting();

    if (this.exerciseService.exerciseId > 0) {
      this.lessonSer.getExerciseDataById(this.exerciseService.exerciseId).subscribe((response: any) => {
        this.exerciseModel = response;
        this.exerciseModel.Tags = this.exerciseService.exerciseTags;
        this.exerciseService.exerciseId = 0;
        this.exerciseService.exerciseTags = null;
        if (this.exerciseModel.Tags == "") {
          this.exerciseModel.Tags = null;
        }
        this.skillLevel = this.exerciseModel.skillLevel;
        if (this.exerciseModel.Tags != null) {
          this.exerciseModel.Tags.split(',').forEach(x => {
            this.exerciseTags.push({ name: x.trim() });
          });
        }
        if (this.exerciseModel.VocalType != null && this.exerciseModel.VocalType != "") {
          var vocals = this.exerciseModel.VocalType.split(',');
          this.selectedVocal = [];
          vocals.forEach(element => {
            var vocalItem = this.lessonSer.vocalList.filter(x => x.item_id == parseInt(element))[0].item_text;
            var savedVocalType = {
              "item_id": parseInt(element),
              "item_text": vocalItem
            }
            this.selectedVocal.push(savedVocalType);
          });
        }
        if (this.exerciseModel.Keys != null && this.exerciseModel.Keys != "") {
          var keys = this.exerciseModel.Keys.split(',');
          this.selectedKey = [];
          keys.forEach(element => {
            var keyItem = this.lessonSer.keyList.filter(x => x.item_id == parseInt(element))[0].item_text;
            var savedKeys = {
              "item_id": parseInt(element),
              "item_text": keyItem
            }
            this.selectedKey.push(savedKeys);
          });
        }
      })
    }
  }

  public initialiseExerciseData() {
    this.exerciseModel = {
      ExerciseId: 0,
      ExerciseGuid: "994c10bb-bc59-46e5-b721-cd934bdfc486",
      ExerciseName: "",
      TrackId: null,
      SeqId: null,
      CreatedOn: new Date(),
      ModifiedOn: null,
      CreatedByUserId: 0,
      IsCopy: false,
      OriginalExerciseId: null,
      IsPaid: false,
      LibraryType: 0,
      Tags: "",
      VideoURL: "",
      Midi: "",
      VocalType: "",
      skillLevel: 0,
      IsDeleted: false,
      Keys: "",
      FileType: "",
      AccessType: "Private"
    }
  }

  onUploadOutput(output: UploadOutput): void {
    if (output.file != undefined) {
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
    }
  }

  startUpload(fileUpload) {
    this.exerciseService.post('/planner/GetBlobSasToken?filename=' + fileUpload.nativeFile.name + '&containerName=' + "vl2songs", new HttpParams()).subscribe((response: any) => {
      Config.sas = response;
      if (fileUpload !== null) {
        const baseUrl = this.blob.generateBlobUrl(Config, fileUpload.nativeFile.name);
        this.config = {
          baseUrl: baseUrl,
          sasToken: Config.sas,
          blockSize: 1024 * 64, // OPTIONAL, default value is 1024 * 32
          file: fileUpload.nativeFile,
          complete: () => {
            this.exerciseModel.Midi = baseUrl;
            this.exerciseModel.FileType = fileUpload.nativeFile.name.substr(fileUpload.nativeFile.name.lastIndexOf('.') + 1);;
            this.toastr.success('Transfer completed!!');
          },
          error: () => {
            console.log('Error !');
            this.exerciseModel.Midi = null;
          },
          progress: (percent) => {
            this.loaderService.percent=percent;
            // if (percent < 100)
            //   this.loaderService.processloader = true
            // else if (percent === 100)
            //   this.loaderService.processloader = false;
          }
        };
        this.blob.upload(this.config);
      }
    });
  }

  onSelect(item: any, type: String) {
    if (type == 'Vocal') {
      if (this.exerciseModel.VocalType == "" || this.exerciseModel.VocalType == null) {
        this.exerciseModel.VocalType = item.item_id;
      }
      else {
        this.exerciseModel.VocalType = this.exerciseModel.VocalType + ',' + item.item_id;
      }
    }
    else {
      if (this.exerciseModel.Keys == "" || this.exerciseModel.Keys == null) {
        this.exerciseModel.Keys = item.item_id.toString();
      }
      else {
        this.exerciseModel.Keys = this.exerciseModel.Keys + ',' + item.item_id;
      }
    }
  }

  onSelectAll(items: any, type: String) {
    if (type == 'Vocal') {
      this.exerciseModel.VocalType = "";
      items.forEach(element => {
        if (this.exerciseModel.VocalType == "" || this.exerciseModel.VocalType == null) {
          this.exerciseModel.VocalType = element.item_id;
        }
        else {
          this.exerciseModel.VocalType = this.exerciseModel.VocalType + ',' + element.item_id;
        }
      });
    }
    else {
      this.exerciseModel.Keys = "";
      items.forEach(element => {
        if (this.exerciseModel.Keys == "" || this.exerciseModel.Keys == null) {
          this.exerciseModel.Keys = element.item_id.toString();
        }
        else {
          this.exerciseModel.Keys = this.exerciseModel.Keys + ',' + element.item_id;
        }
      });
    }
  }

  onDeSelect(item: any, type: String) {
    if (type == 'Vocal') {
      if (this.exerciseModel.VocalType.includes(item.item_id)) {
        var n = this.exerciseModel.VocalType.lastIndexOf(item.item_id);
        var length = this.exerciseModel.VocalType.length - 1;
        if (length == 0) {
          this.exerciseModel.VocalType = this.exerciseModel.VocalType.replace(item.item_id, '');
        }
        else if (n == length) {
          this.exerciseModel.VocalType = this.exerciseModel.VocalType.replace(',' + item.item_id, '');
        }
        else {
          this.exerciseModel.VocalType = this.exerciseModel.VocalType.replace(item.item_id + ',', '');
        }
      }
    }
    else {
      if (this.exerciseModel.Keys.includes(item.item_id)) {
        var n = this.exerciseModel.Keys.lastIndexOf(item.item_id);
        var length = 0;
        if (n == 0) {
          var Keyarray = this.exerciseModel.Keys.split(',');
          if (Keyarray.length == 1) {
            length = 0;
          } else {
            length = this.exerciseModel.Keys.length - 1;
          }
        } else {
          length = this.exerciseModel.Keys.length - 1;
        }
        if (length == 0) {
          this.exerciseModel.Keys = this.exerciseModel.Keys.replace(item.item_id, '');
        }
        else if (n == length) {
          this.exerciseModel.Keys = this.exerciseModel.Keys.replace(',' + item.item_id, '');
        }
        else {
          this.exerciseModel.Keys = this.exerciseModel.Keys.replace(item.item_id + ',', '');
        }
      }
    }
  }

  clearAll(items: any, type: String) {
    if (type == 'Vocal') {
      this.exerciseModel.VocalType = "";
    }
    else {
      this.exerciseModel.Keys = "";
    }
  }

  skillSelection(event) {
    this.skillLevel = event;
    this.exerciseModel.skillLevel = this.skillLevel;
  }

  restrictWhiteSpace() {
    if (this.exerciseModel.ExerciseName.length > 0) {
      this.exerciseModel.ExerciseName = this.exerciseModel.ExerciseName.trim();
    }
  }

  onAccessChange(value) {
    if (value) {
      this.exerciseModel.AccessType = "Public";
    }
    else {
      this.exerciseModel.AccessType = "Private";
    }
  }
}


