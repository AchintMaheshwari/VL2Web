import { Component, OnInit, ViewChild } from '@angular/core';
import { CropperSettings, ImageCropperComponent } from 'ng2-img-cropper';
import { HttpParams } from '@angular/common/http';
import { CrudService } from '../services/crud.service';
import { CommonService } from '../common/common.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ToastrService } from 'ngx-toastr';
import { MediaFileUploadService } from '../services/media-file-upload.service';
import { BsModalService } from '../../../node_modules/ngx-bootstrap';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {
  [x: string]: any;
  userType: string = "";
  id: number;
  pimgForm: FormGroup;
  loading = false;
  modalRef: BsModalRef;
  file: any;
  ngOnInit(): void {
    this.userType = localStorage.getItem('UserType');
    var userData = CommonService.getUser();
    if (this.userType === "Teacher") {
      this.id = userData.Teacher[0].TeacherId;
    }
    else if (this.userType === "Student"){
      this.id = userData.Student[0].StudentId;
    }
  }
  data: any;
  @ViewChild('cropper', undefined)
  cropper: ImageCropperComponent;
  cropperSettings: CropperSettings;
  objImagedata: any = {};
  userProfilePic: any;

  constructor(private commonService: CommonService, private crudService: CrudService, private fb: FormBuilder,
    public modalService: BsModalService, private toastr: ToastrService, private mediafileDirectUpload: MediaFileUploadService) {
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.noFileInput = true;
    this.cropperSettings.width = 100;
    this.cropperSettings.height = 100;
    this.cropperSettings.croppedWidth = 305;
    this.cropperSettings.croppedHeight = 305;
    this.cropperSettings.canvasWidth = 305;
    this.cropperSettings.canvasHeight = 305;
    this.data = {};
    this.createForm();
  }

  fileChangeListener($event) {
    var image: any = new Image();
    this.file = File = $event.target.files[0];
    var myReader: FileReader = new FileReader();
    var that = this;
    myReader.onloadend = function (loadEvent: any) {
      image.src = loadEvent.target.result;
      that.cropper.setImage(image);
    };
    myReader.readAsDataURL(this.file);
    this.uploadImage(that.cropper, this.file);
    //const formModel = this.pimgForm.value;
  }

  createForm() {
    this.pimgForm = this.fb.group({
    });
  }

  uploadImage(file, filedata) {
    this.objImagedata = {
      lastModifiedDate: filedata.lastModified,
      name: filedata.name,
      size: filedata.size,
      type: filedata.type,
      webkitRelativePath: filedata.webkitRelativePath,
      image: (file).substring(23),
      userType: this.userType,
      id: this.id
    }
    this.loading = true;
    this.crudService.post('/user/UploadUserProfileImage', this.objImagedata, new HttpParams()).subscribe((response: any) => {
      this.commonService.userProfilePic = response;
      localStorage.setItem("userImageUrl", response);
      let userData = JSON.parse(localStorage.getItem('userData'));
      if (userData.IsTeacher) {
        userData.Teacher[0].ImageUrl = response;
      }
      else if (userData.IsStudent) {
        userData.Student[0].ImageUrl = response;
      }
      localStorage.setItem('userData', JSON.stringify(userData));
      this.commonService.isDefaultImageFlag = false;
      this.loading = false;
      this.toastr.success('Profile pic is Uploaded Successfully!');
      this.modalService._hideModal(1);
    });
  }

  fileupload() {
    if (this.commonService.imageUploadType != "" && this.commonService.imageUploadType === "profilePic") {
      const formModel = this.pimgForm.value;
      formModel.data = this.data.image;
      this.uploadImage(formModel.data, this.file);
    }
    else if (this.commonService.imageUploadType != "" && this.commonService.imageUploadType === "lessonPic"){
      if (File != undefined) {
        this.mediafileDirectUpload.startUpload(File, "ImageUpload");
      }
    }
  }

  closeFileUpload() {
    this.modalService._hideModal(1);
  }

  azureBlobUpload($event) {
    var image: any = new Image();
    this.file = File = $event.target.files[0];
  }
}
