import { Component, OnInit, Inject, ViewContainerRef, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatChipInputEvent } from '@angular/material';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { LessonsService } from '../../../../services/lessons.service';
import { ImageUploadComponent } from '../../../../image-upload/image-upload.component';
import { BsModalService } from 'ngx-bootstrap';
import { initialState } from 'ngx-bootstrap/timepicker/reducer/timepicker.reducer';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';
import { CommonService } from '../../../../common/common.service';
import { CrudService } from '../../../../services/crud.service';
import { Router } from '@angular/router';
import { SharedlibraryService } from '../../../../services/sharedlibrary.service';
import { LoaderService } from '../../../../services/loader.service';
import { PlaylistLibraryComponent } from '../playlist-library.component';
import { PlaylistService } from '../../../../services/playlist.service';

export interface DialogData {
}

@Component({
  selector: 'app-create-playlist-dialog',
  templateUrl: './create-playlist-dialog.component.html',
  styleUrls: ['./create-playlist-dialog.component.scss']
})
export class CreatePlaylistDialogComponent implements OnInit {
  selectedVocal: any;
  jsonObj: any;

  TitleCheck: any = false;
  visible: boolean = true;
  @ViewChild('createPlaylistForm') playlistForm: any;
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;
  separatorKeysCodes = [ENTER, COMMA];
  isFormSubmitFlag: boolean = false;
  isDescriptionRequired: boolean = false;
  isPriceRequired: boolean = false;
  lessonTags = [];
  isShowCreateLessonModel: boolean;
  isShowEditLessonModel: boolean;
  copyParentLessonId: number;
  vocalData: string;
  skillLevel: any = 0;
  isDateValid: boolean = false;
  saveReadyFlag: boolean = false;

  constructor(public modalService: BsModalService, public viewRef: ViewContainerRef, public dialogRef: MatDialogRef<CreatePlaylistDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, public dialog: MatDialog
    , public lessonSer: LessonsService, private toastr: ToastrService, public sharedService: SharedlibraryService,
    private commonService: CommonService, private crudService: CrudService, private router: Router, private loaderService: LoaderService,
    public playlistService: PlaylistService) {
    this.sharedService.initialiseLessonModel();    
  }

  onNoClick(): void {
    this.dialogRef.close();
    this.playlistForm.reset();
  }

  ngOnInit() {
    this.lessonSer.getDropDownSetting();
    this.loaderService.processloader = true;
    if (this.lessonSer.currentLessonId > 0 && (this.lessonSer.playlistDialogTitle == "Edit Playlist" || this.lessonSer.playlistDialogTitle == "Copy Playlist")) {
      this.lessonSer.getLessonData(this.lessonSer.currentLessonId).subscribe((response: any) => {
        this.loaderService.processloader = false;
        this.saveReadyFlag = false;
        this.sharedService.LessonModel = response;
        this.sharedService.LessonModel.Logo = response.Logo === null ? "default" : response.Logo;
        if (this.sharedService.LessonModel.Price > 0) {
          this.isPriceRequired = this.isDescriptionRequired = true;
        }
        this.skillLevel = this.sharedService.LessonModel.skillLevel;
        if (this.skillLevel == null) {
          this.skillLevel = 0;
          this.sharedService.LessonModel.skillLevel = 0;
        }
        if (this.lessonSer.playlistDialogTitle == "Copy Playlist") {
          this.sharedService.LessonModel.Logo = "default";
          this.sharedService.LessonModel.LessonName = "";
          this.getParentLessonId(this.sharedService.LessonModel.LessonId);
          this.copyParentLessonId = this.sharedService.LessonModel.LessonId;
          this.sharedService.LessonModel.LessonId = 0;
        }
        this.sharedService.LessonModel.Tags = this.lessonSer.currentLessonTags.trim();
        if (this.lessonSer.currentLessonTags.trim() != "") {
          this.lessonSer.currentLessonTags.trim().split(',').forEach(x => {
            this.lessonTags.push({ name: x.trim() });
          });
        }
        if (this.sharedService.LessonModel.VocalType != null) {
          var selectedVocal = this.sharedService.LessonModel.VocalType.split(',');
          this.selectedVocal = [];
          selectedVocal.forEach(element => {
            var vocalItem = this.lessonSer.vocalList.filter(x => x.item_id == parseInt(element))[0].item_text;
            this.jsonObj = [];
            var newRole = {
              "item_id": parseInt(element),
              "item_text": vocalItem
            }
            this.selectedVocal.push(newRole);
          });
        }
      })
    }
    else {
      this.loaderService.processloader = false;
    }
    this.isShowCreateLessonModel = this.lessonSer.isShowCreateModel;
    this.isShowEditLessonModel = this.lessonSer.isShowEditModel;
  }

  getParentLessonId(lessonId) {
    this.crudService.get('/lesson/GetCopyLessonName', new HttpParams().set("lessonId", lessonId)).subscribe((resultData: any) => {
      this.sharedService.LessonModel.LessonName = resultData;
    });
  }

  onAccessChange(value) {
    if (value) {
      this.sharedService.LessonModel.LessonAccessType = "Public";
    }
    else {
      this.sharedService.LessonModel.LessonAccessType = "Private";
    }
  }

  lessonTitleValidate() {
    this.saveReadyFlag = true;
    if (this.sharedService.LessonModel.LessonName != null && this.sharedService.LessonModel.LessonName != "") {
      this.sharedService.LessonModel.LessonName = this.sharedService.LessonModel.LessonName.trim();
      if (this.lessonSer.lessonNameEdit === this.sharedService.LessonModel.LessonName) {
        this.TitleCheck = false;
        this.saveReadyFlag = false;
      }
      else {
        if (this.sharedService.LessonModel.LessonName != '') {
          this.lessonSer.checkLessonTitle(this.sharedService.LessonModel.LessonName).subscribe(result => {
            if (result) {
              this.TitleCheck = result;
              this.sharedService.LessonModel.LessonName = '';
              this.toastr.error('Title Already Exist!!');
              this.saveReadyFlag = true;
            }
            else {
              this.TitleCheck = result;
              this.saveReadyFlag = false;
            }
          });
        }
      }
    }
  }

  openNewDialog() {
    this.commonService.imageUploadType = "lessonPic";
    this.modalService.show(ImageUploadComponent, { initialState, class: 'imageUplodModal' });
  }

  add(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    if ((value || '').trim() && this.lessonTags.findIndex(x => x.name === value.trim()) === -1) {
      this.lessonTags.push({ name: value.trim() });
    }
    else if (value === "") {
      this.toastr.error("Please enter a valid tag.")
    }
    else if (this.lessonTags.findIndex(x => x.name === value.trim()) != -1) {
      this.toastr.error("This tag already exists !")
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(tags: any): void {
    let index = this.lessonTags.indexOf(tags);

    if (index >= 0) {
      this.lessonTags.splice(index, 1);
    }
  }

  saveLessonData(addItems) {
    this.isFormSubmitFlag = true;
    if (this.lessonTags.length === 0) {
      this.toastr.error("Tags required.");
    }
    else {
      if (this.playlistForm.valid) {
        let userData = CommonService.getUser();
        if (this.sharedService.LessonModel.LessonId > 0 && userData != 'undefined') {
          this.sharedService.LessonModel.CreatedByUserId = userData.UserId;
          this.sharedService.LessonModel.Tags = "";
          this.sharedService.LessonModel.Users = "";
        }
        else if (this.sharedService.LessonModel.LessonId === 0) {
          this.sharedService.LessonModel.CreatedByUserId = userData.UserId;
          this.sharedService.LessonModel.StudentId = userData.Student[0].StudentId;
        }
        if (this.lessonSer.playlistDialogTitle == "Copy Playlist") {
          this.sharedService.LessonModel.Tags = null;
          this.sharedService.LessonModel.Users = null;
        }
        this.lessonTags.forEach(element => {
          if (this.sharedService.LessonModel.Tags == null) {
            this.sharedService.LessonModel.Tags = element.name + ',';
          }
          else {
            this.sharedService.LessonModel.Tags = this.sharedService.LessonModel.Tags + element.name + ',';
          }
        });
        this.sharedService.LessonModel.Tags = this.sharedService.LessonModel.Tags.substr(0, this.sharedService.LessonModel.Tags.length - 1);
        this.lessonSer.currentLessonTags = this.sharedService.LessonModel.Tags;

        if (this.sharedService.LessonModel.Student != undefined) {
          this.sharedService.LessonModel.Student.forEach(element => {
            if (this.sharedService.LessonModel.Users == null)
              this.sharedService.LessonModel.Users = element.UserId + ',';
            else
              this.sharedService.LessonModel.Users = this.sharedService.LessonModel.Users + element.UserId + ',';
          });
        }

        if (this.lessonSer.playlistDialogTitle == "Copy Playlist") {
          this.sharedService.LessonModel.LessonId = this.copyParentLessonId;
          this.crudService.post('/lesson/CreateDuplicateLesson', this.sharedService.LessonModel, new HttpParams()).subscribe((response: any) => {
            this.sharedService.LessonModel = response;
            if (addItems != "GoToPlanner") {
              this.toastr.success("Lesson saved successfully.");
              let refreshlibrary = new PlaylistLibraryComponent(this.dialog, this.lessonSer, this.toastr, 
                this.loaderService, this.commonService, this.playlistService);
              refreshlibrary.getPlaylistLibraries();
              this.sharedService.LessonModel.Users = null;
            }
            else {
              localStorage.setItem("EditLesson", JSON.stringify(this.sharedService.LessonModel));
              this.router.navigate(['/student/playlist']);
            }
            this.dialogRef.close();
            this.playlistForm.reset();
            this.sharedService.LessonModel.LessonName = response.lessonName;
          });
        }
        else {
          this.saveReadyFlag = true;
          if (this.lessonSer.LessonQueueFromHistory != null && this.lessonSer.LessonQueueFromHistory != "") {
            this.sharedService.LessonModel.LessonQueue = this.lessonSer.LessonQueueFromHistory;
          }
          if (this.sharedService.LessonModel.Started != null)
            this.sharedService.LessonModel.Started = CommonService.convertToUTCDate((this.sharedService.LessonModel.Started).toString());
          this.loaderService.processloader = true;
          this.crudService.post('/lesson/UpsertLesson', this.sharedService.LessonModel, new HttpParams()).subscribe((response: any) => {
            this.loaderService.processloader = false;
            this.sharedService.LessonModel = response;
            if (addItems != "GoToPlanner") {
              this.toastr.success("Lesson saved successfully.");
              this.dialog.closeAll();
              let refreshlibrary = new PlaylistLibraryComponent(this.dialog, this.lessonSer, this.toastr, 
                this.loaderService, this.commonService, this.playlistService);
              refreshlibrary.getPlaylistLibraries();
              this.sharedService.LessonModel.Users = null;
            }
            else {
              localStorage.setItem("EditLesson", JSON.stringify(this.sharedService.LessonModel));
              this.router.navigate(['/student/playlist']);
            }
            this.saveReadyFlag = false;
            this.dialogRef.close();
            this.playlistForm.reset();
          });
        }
      }
    }
  }

  validateDescAndlogo() {
    if (this.sharedService.LessonModel.Price > 0) {
      this.isDescriptionRequired = true;
      this.isPriceRequired = true;
    }
    else {
      this.isDescriptionRequired = false;
      this.isPriceRequired = false;
    }
  }
  removeStudent(student: any) {
    let index = this.sharedService.LessonModel.Student.indexOf(student);
    if (index >= 0) {
      this.sharedService.LessonModel.Student.splice(index, 1);
    }
  }

  onVocalSelect(item: any) {
    if (this.sharedService.LessonModel.VocalType == "" || this.sharedService.LessonModel.VocalType == null) {
      this.sharedService.LessonModel.VocalType = item.item_id;
    }
    else {
      this.sharedService.LessonModel.VocalType = this.sharedService.LessonModel.VocalType + ',' + item.item_id;
    }
  }

  onVocalSelectAll(items: any) {
    this.sharedService.LessonModel.VocalType = "";
    items.forEach(element => {
      if (this.sharedService.LessonModel.VocalType == "" || this.sharedService.LessonModel.VocalType == null) {
        this.sharedService.LessonModel.VocalType = element.item_id;
      }
      else {
        this.sharedService.LessonModel.VocalType = this.sharedService.LessonModel.VocalType + ',' + element.item_id;
      }
    });
  }

  onVocalDeSelect(item: any) {
    if (this.sharedService.LessonModel.VocalType.includes(item.item_id)) {
      var n = this.sharedService.LessonModel.VocalType.lastIndexOf(item.item_id);
      var length = this.sharedService.LessonModel.VocalType.length - 1;
      if (length == 0) {
        this.sharedService.LessonModel.VocalType = this.sharedService.LessonModel.VocalType.replace(item.item_id, '');
      }
      else if (n == length) {
        this.sharedService.LessonModel.VocalType = this.sharedService.LessonModel.VocalType.replace(',' + item.item_id, '');
      }
      else {
        this.sharedService.LessonModel.VocalType = this.sharedService.LessonModel.VocalType.replace(item.item_id + ',', '');
      }
    }
  }

  clearAllVocal(items: any) {
    this.sharedService.LessonModel.VocalType = "";
  }

  skillSelection(event) {
    this.skillLevel = event;
    this.sharedService.LessonModel.skillLevel = this.skillLevel;
  }

  redirectToPlaylistPlanner() {
    localStorage.setItem("EditLesson", JSON.stringify(this.sharedService.LessonModel));
    this.saveLessonData('GoToPlanner');
  }
}
