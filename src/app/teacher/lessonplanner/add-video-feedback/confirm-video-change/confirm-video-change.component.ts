import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { AddVideoFeedbackComponent } from '../add-video-feedback.component';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BlobService } from 'angular-azure-blob-service';
import { LoaderService } from '../../../../services/loader.service';
import { GuidedvideoService } from '../../../../services/guidedvideo.service';
import { VideoService } from '../../../../services/video.service';
import { AddVideoComponent } from '../../add-video/add-video.component';
import { SharedlibraryService } from '../../../../services/sharedlibrary.service';
import { PlaylistService } from '../../../../services/playlist.service';

@Component({
  selector: 'app-confirm-video-change',
  templateUrl: './confirm-video-change.component.html',
  styleUrls: ['./confirm-video-change.component.scss']
})
export class ConfirmVideoChangeComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ConfirmVideoChangeComponent>, private toastr: ToastrService, private route: Router,
    private blob: BlobService,
    private loaderService: LoaderService, public guidedvideoService: GuidedvideoService, public dialog: MatDialog,
    public videoService: VideoService, public sharedLibrary: SharedlibraryService,public playlistService:PlaylistService) { }

  ngOnInit() {
  }

  proceed() {
    this.dialogRef.close();
    var isVideoSubmitByStudent = this.route.url.includes('guidedvideofeedback');
    if (isVideoSubmitByStudent == true) {
      if (this.guidedvideoService.isOpenUploadVideo == true) {
        this.guidedvideoService.isOpenUploadVideo = false;
        this.guidedvideoService.guidedVideoURL = "";
        this.guidedvideoService.VideoURL = "";
        this.guidedvideoService.otherVideoUrl = "";
        let addVideoFeedbackComponent = new AddVideoFeedbackComponent(this.toastr, this.route, this.blob, this.loaderService, this.guidedvideoService, this.dialog);
        addVideoFeedbackComponent.startUpload(this.guidedvideoService.file);
      } else if (this.guidedvideoService.isOpenRecordVideo == true) {
        this.guidedvideoService.isOpenRecordVideo = false;
        this.guidedvideoService.guidedVideoURL = "";
        this.guidedvideoService.VideoURL = "";
        this.guidedvideoService.otherVideoUrl = "";
        let addVideoFeedbackComponent = new AddVideoFeedbackComponent(this.toastr, this.route, this.blob, this.loaderService, this.guidedvideoService, this.dialog);
        addVideoFeedbackComponent.openRecordModal();
      } else if (this.guidedvideoService.isOpenVideoURL == true) {
        this.guidedvideoService.isOpenVideoURL = false;
        this.guidedvideoService.guidedVideoURL = "";
        this.guidedvideoService.VideoURL = "";
        this.guidedvideoService.otherVideoUrl = "";
      } else if (this.guidedvideoService.isOpenOtherVideoUrl == true) {
        this.guidedvideoService.isOpenOtherVideoUrl = false;
        this.guidedvideoService.VideoURL = "";
        this.guidedvideoService.guidedVideoURL = "";
      }
    } else {
      if (this.videoService.isOpenUploadVideo == true) {
        this.videoService.isOpenUploadVideo = false;
        this.videoService.videoURL = "";
        this.videoService.inputVideoURL = "";
        this.videoService.otherVideoUrl = "";
        let addVideoComponent = new AddVideoComponent(this.toastr, this.route, this.blob, this.loaderService,
          this.videoService, this.dialog, this.sharedLibrary, this.guidedvideoService,this.playlistService);
        addVideoComponent.startUpload(this.videoService.file);
      } else if (this.videoService.isOpenRecordVideo == true) {
        this.videoService.isOpenRecordVideo = false;
        this.videoService.videoURL = "";
        this.videoService.inputVideoURL = "";
        this.videoService.otherVideoUrl = "";
        let addVideoComponent = new AddVideoComponent(this.toastr, this.route, this.blob, this.loaderService,
          this.videoService, this.dialog, this.sharedLibrary, this.guidedvideoService,this.playlistService);
        addVideoComponent.openRecordModal();
      } else if (this.videoService.isOpenVideoURL == true) {
        this.videoService.isOpenVideoURL = false;
        this.videoService.videoURL = "";
        this.videoService.otherVideoUrl = "";
      }
      else if (this.videoService.isOpenOtherVideoUrl == true) {
        this.videoService.isOpenOtherVideoUrl = false;
        this.videoService.videoURL = "";
        this.videoService.inputVideoURL = "";
      }
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
