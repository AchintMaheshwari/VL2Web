import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonService } from '../../../common/common.service';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes, UploaderOptions, UploadStatus } from 'ngx-uploader';
import { BlobService, UploadConfig } from 'angular-azure-blob-service'
import { Config } from '../../../models/config.template';
import { Node } from '../../tree-view/node';
import { LoaderService } from '../../../services/loader.service';
import { GuidedvideoService } from '../../../services/guidedvideo.service';
import { RecordVideoComponent } from './record-video/record-video.component';
import { VideoSubmissionsModel } from '../../../models/videoSubmissions.model';
import { ConfirmVideoChangeComponent } from './confirm-video-change/confirm-video-change.component';
// import { VideoSubmissionCompleteComponent } from './video-submission-complete/video-submission-complete.component';

@Component({
  selector: 'app-add-video-feedback',
  templateUrl: './add-video-feedback.component.html',
  styleUrls: ['./add-video-feedback.component.scss']
})
export class AddVideoFeedbackComponent implements OnInit {
  sasToken: any;
  ReadFile: void;
  videoSubmissionsModel: VideoSubmissionsModel;
  addOnBlur: boolean = true;
  isDropup = true;
  removable = true;
  isAddExFlag: boolean = false;
  nodes: Array<Node>;
  @ViewChild('addVideo') form: any;

  options: UploaderOptions;
  formData: FormData;
  files: UploadFile[];
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;
  config: UploadConfig;
  exerciseTags = [];
  jsonObj: any;

  window: any;
  VideoURL: string = "";

  @ViewChild('video') video: any
  private stream: MediaStream;
  private recordRTC: any;
  playbtnStatus: string = 'Play';

  constructor(private toastr: ToastrService, private route: Router, private blob: BlobService,
    private loaderService: LoaderService, public guidedvideoService: GuidedvideoService, public dialog: MatDialog) {
    this.config = null
    this.options = { concurrency: 1, maxUploads: 3 };
    this.files = []; // local uploading files array
    this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    this.humanizeBytes = humanizeBytes;
  }

  ngOnInit() {
    this.window = window;
    this.initialiseVideoSubmissionData();
    //if (localStorage.getItem('GVLTransactionId') == null) {
      this.getPaymentBeforeSubmissionDetailsbyUserSourceCode();
    //}
  }

  public initialiseVideoSubmissionData() {
    this.videoSubmissionsModel = {
      VideoSubmissionId: 0,
      UserId: 0,
      Source: "VLAPP",
      RawJson: "",
      ExternalUserId: "",
      Name: "",
      Email: "",
      VideoUrl: "",
      Created: new Date(),
      ClaimedCount: 0,
      ReviewedCount: 0,
      Location: "",
      FormattedAddress: "",
      Country: "",
      PostalCode: "",
      IsPaid:false,
      OtherVideoUrl:"",
    }
  }

  getPaymentBeforeSubmissionDetailsbyUserSourceCode() {
    this.guidedvideoService.getPaymentBeforeSubmissionDetailsbyUserSourceCode().subscribe((response: any) => {
      if (response != null) {
        if (response.result.IsPayBeforeSubmission == true) {
          this.guidedvideoService.PaymentTime = 'PayBeforeSubmission';
          this.guidedvideoService.Price = response.result.Cost;
        } else {
          this.guidedvideoService.PaymentTime = '';
          this.guidedvideoService.Price = 0;
        }
      }
    });
  }

  upserVideoSubmissionData() {
    if (this.form.valid) {
      if (this.guidedvideoService.VideoURL == "" && this.guidedvideoService.guidedVideoURL == "" && this.guidedvideoService.otherVideoUrl == "") {
        this.toastr.warning('You must provide a submission using recording, uploading, or a pasting a link');
      } else {
        let userId = CommonService.getUser().UserId;
        this.videoSubmissionsModel.UserId = userId;
        if (this.guidedvideoService.guidedVideoURL.includes('vldevstoragefuncapp')) {
          this.videoSubmissionsModel.VideoUrl = this.guidedvideoService.guidedVideoURL.toString();
          this.videoSubmissionsModel.OtherVideoUrl="";
        }else if(this.guidedvideoService.otherVideoUrl!="") {
          this.videoSubmissionsModel.OtherVideoUrl = this.guidedvideoService.otherVideoUrl;
          this.videoSubmissionsModel.VideoUrl ="";
        } else {
          this.videoSubmissionsModel.VideoUrl = this.guidedvideoService.VideoURL;
          this.videoSubmissionsModel.OtherVideoUrl="";
        }
        this.videoSubmissionsModel.Source='VLAPP';
        if(this.guidedvideoService.videoSubmissionData!=null && this.guidedvideoService.videoSubmissionData!=undefined){
          this.videoSubmissionsModel.VideoSubmissionId=this.guidedvideoService.videoSubmissionData.VideoSubmissionId;
        }
        this.guidedvideoService.post('/guidedVideo/UpsertGuidedVideoSubmissionByStudent', this.videoSubmissionsModel, new HttpParams()).subscribe((response: any) => {
            this.form.reset();
            this.guidedvideoService.videoSubmissionData=null;
            this.route.navigate(['/student/videoSubmissionComplete']);
        });
      }
    } else {
      this.toastr.warning('Please Fill Required Fields!');
    }
  }


  onUploadOutput(output: UploadOutput): void {
    if (output.file != undefined) {
      this.guidedvideoService.file = output.file;

      if (this.guidedvideoService.guidedVideoURL == "" && this.guidedvideoService.VideoURL == "" && this.guidedvideoService.otherVideoUrl=="") {
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
        this.guidedvideoService.isOpenUploadVideo = true;
        const dialogRef = this.dialog.open(ConfirmVideoChangeComponent, {});
      }
    }
  }

  startUpload(fileUpload) {
    var fileExt = fileUpload.nativeFile.name.substr(fileUpload.nativeFile.name.lastIndexOf('.') + 1);
    if (fileExt == 'mp4' || fileExt == 'webm') {
      this.guidedvideoService.post('/planner/GetBlobSasToken?filename=' + fileUpload.nativeFile.name + '&containerName=' + "vl2songs", new HttpParams()).subscribe((response: any) => {
        Config.sas = response;
        if (fileUpload !== null) {
         // this.loaderService.processloader = true;
          const baseUrl = this.blob.generateBlobUrl(Config, fileUpload.nativeFile.name);
          this.config = {
            baseUrl: baseUrl,
            sasToken: Config.sas,
            blockSize: 1024 * 64, // OPTIONAL, default value is 1024 * 32
            file: fileUpload.nativeFile,
            complete: () => {
              this.guidedvideoService.guidedVideoURL = baseUrl;
              this.toastr.success('Transfer completed!!');
            },
            error: () => {
              console.log('Error !');
            },
            progress: (percent) => {
              this.loaderService.percent=percent;
           /*    if (percent < 100) { }
              // this.loaderService.processloader = true
              else if (percent === 100)
                this.loaderService.processloader = false; */
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
    if (this.guidedvideoService.guidedVideoURL != "" || this.guidedvideoService.VideoURL != "" || this.guidedvideoService.otherVideoUrl!="") {
      this.guidedvideoService.isOpenRecordVideo = true;
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
    if (this.guidedvideoService.guidedVideoURL != "" || this.guidedvideoService.otherVideoUrl!="") {//} && this.guidedvideoService.VideoURL == "") {
      this.guidedvideoService.isOpenVideoURL = true;
      this.openConfirmVideoChangeModal();
    }
  }

  openConfirmVideoChangeModal(): void {
    const dialogRef = this.dialog.open(ConfirmVideoChangeComponent, {
    });
  }

  setVideoURL() {
    if (this.guidedvideoService.VideoURL.length > 0) {
      this.guidedvideoService.VideoURL = this.guidedvideoService.VideoURL.trim();
      // this.guidedvideoService.guidedVideoURL = this.guidedvideoService.VideoURL.trim();
    }
    else {
      this.guidedvideoService.VideoURL = "";
      //this.guidedvideoService.guidedVideoURL = "";
    }
  }

  checkOtherVideoChange() {
    if (this.guidedvideoService.VideoURL != "" || this.guidedvideoService.guidedVideoURL != "") {//} && this.videoService.inputVideoURL == "") {
      this.guidedvideoService.isOpenOtherVideoUrl = true;
      this.openConfirmVideoChangeModal();
    }
  }

  setOtherUrl() {
    if (this.guidedvideoService.otherVideoUrl.length > 0) {
      this.guidedvideoService.otherVideoUrl = this.guidedvideoService.otherVideoUrl.trim();
    } else {
      this.guidedvideoService.otherVideoUrl = "";
    }
  }
}



