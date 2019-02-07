import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import * as RecordRTC from 'recordrtc'
import { BlobService, UploadConfig } from 'angular-azure-blob-service'
import { GuidedvideoService } from '../../../../services/guidedvideo.service';
import { Config } from '../../../../models/config.template';
import { LoaderService } from '../../../../services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';
import { CommonService } from '../../../../common/common.service';
import { Router } from '../../../../../../node_modules/@angular/router';
import { VideoService } from '../../../../services/video.service';

@Component({
  selector: 'app-record-video',
  templateUrl: './record-video.component.html',
  styleUrls: ['./record-video.component.scss']
})
export class RecordVideoComponent implements OnInit, AfterViewInit {

  @ViewChild('video') video: any
  private stream: MediaStream;
  private recordRTC: any;
  playbtnStatus: string;
  config: UploadConfig;

  file: File;
  isGuidedvideofeedback: boolean = false;

  constructor(public dialogRef: MatDialogRef<RecordVideoComponent>, private blob: BlobService, public guidedvideoService: GuidedvideoService,
    private loaderService: LoaderService, private toastr: ToastrService, private route: Router, public videoService: VideoService) {
    this.config = null
  }

  ngOnInit() {
  }


  ngAfterViewInit() {
    // set the initial state of the video
    if (this.video != undefined) {
      let video: HTMLVideoElement = this.video.nativeElement;
      video.muted = false;
      video.controls = true;
      video.autoplay = false;
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  toggleControls() {
    let video: HTMLVideoElement = this.video.nativeElement;
    video.muted = !video.muted;
    video.controls = !video.controls;
    video.autoplay = !video.autoplay;
  }

  successCallback(stream: MediaStream) {
    var options = {
      mimeType: 'video/mp4', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 51200000
      //bitsPerSecond: 128000 // if this line is provided, skip above two
    };

    this.stream = stream;
    this.recordRTC = RecordRTC(stream, options);
    this.recordRTC.startRecording();
    let video: HTMLVideoElement = this.video.nativeElement;
    if (navigator.userAgent.indexOf('Firefox') != -1) {
      video.srcObject = stream;
    } else {
      video.src = window.URL.createObjectURL(stream);
    }
    this.toggleControls();
  }

  errorCallback(stream: any) {
    //handle error here
    if (stream.message == 'Requested device not found') {
      this.toastr.warning('Webcam not connected!!');
      this.playbtnStatus = '';
    }
  }

  processVideo(audioVideoWebMURL) {
    let video: HTMLVideoElement = this.video.nativeElement;
    let recordRTC = this.recordRTC;
    video.src = audioVideoWebMURL;
    this.toggleControls();
    var recordedBlob = recordRTC.getBlob();
    recordRTC.getDataURL(function (dataURL) { });
  }

  stopRecording() {
    if (this.recordRTC != undefined) {
      this.playbtnStatus = 'Play';
      let recordRTC = this.recordRTC;
      recordRTC.stopRecording(this.processVideo.bind(this));
      let stream = this.stream;
      stream.getAudioTracks().forEach(track => track.stop());
      stream.getVideoTracks().forEach(track => track.stop());
    }
  }

  pauseRecording() {
    if (this.recordRTC != undefined) {
      let video: HTMLVideoElement = this.video.nativeElement;
      this.playbtnStatus = 'Resume';
      video.pause();
      this.recordRTC.pauseRecording();
    }
  }

  startRecording() {
    if (this.playbtnStatus == 'Resume') {
      this.playbtnStatus = 'Play';
      let video: HTMLVideoElement = this.video.nativeElement;
      this.recordRTC.resumeRecording();
      video.play();
    } else if (this.playbtnStatus == 'Play') {
      if (this.recordRTC != undefined) {
        this.stopRecording();
        this.playbtnStatus = 'Play';
        let mediaConstraints = {
          audio: true,
          video: {
            width: { min: 1920, ideal: 1280, max: 3840 },
            height: { min: 1080, ideal: 720, max: 2160 }
          }
        }
        // let mediaConstraints = { audio: true, video: { width: 1920, height: 1080 } };
        navigator.mediaDevices.getUserMedia(mediaConstraints).then(this.successCallback.bind(this), this.errorCallback.bind(this));
      }
    }
    else {
      this.playbtnStatus = 'Play';
      let mediaConstraints = {
        audio: true,
        video: {
          width: { min: 1920, ideal: 1280, max: 3840 },
          height: { min: 1080, ideal: 720, max: 2160 }
        }
      }
      //let mediaConstraints = { audio: true, video: { width: 1920, height: 1080 } };
      navigator.mediaDevices.getUserMedia(mediaConstraints).then(this.successCallback.bind(this), this.errorCallback.bind(this));
    }
  }

  restartRecording() {
    if (this.recordRTC != undefined) {
      this.stopRecording();
      this.playbtnStatus = 'Play';
      let mediaConstraints = {
        audio: true,
        video: {
          width: { min: 1920, ideal: 1280, max: 3840 },
          height: { min: 1080, ideal: 720, max: 2160 }
        }
        /*  video: {
           width: { min: 1024, ideal: 1280, max: 1920 },
           height: { min: 776, ideal: 720, max: 1080 }
         } */
      }
      //let mediaConstraints = { audio: true, video: { width: 1920, height: 1080 } };
      navigator.mediaDevices.getUserMedia(mediaConstraints).then(this.successCallback.bind(this), this.errorCallback.bind(this));
    }
  }

  download() {
    this.recordRTC.save('video.mp4');
  }

  upload() {
    this.isGuidedvideofeedback = this.route.url.includes('guidedvideofeedback');
    if (this.isGuidedvideofeedback) {
      this.startVideoUpload(this.recordRTC);
    } else {
      this.startVideoUploadInLesson(this.recordRTC)
    }
  }


  startVideoUpload(recordRTC) {
    if (this.recordRTC != undefined) {
      var filename = 'video' + CommonService.getGuid() + '.mp4';

      this.guidedvideoService.post('/planner/GetBlobSasToken?filename=' + filename + '&containerName=' + "vl2songs", new HttpParams()).subscribe((response: any) => {
        Config.sas = response;
        if (recordRTC !== null) {
         // this.loaderService.processloader = true
          this.file = recordRTC.blob;
          const baseUrl = this.blob.generateBlobUrl(Config, filename);
          this.config = {
            baseUrl: baseUrl,
            sasToken: Config.sas,
            blockSize: 1024 * 64, // OPTIONAL, default value is 1024 * 32
            file: this.file,
            complete: () => {
              this.guidedvideoService.guidedVideoURL = baseUrl;
              console.log('URL : ' + baseUrl);
              this.dialogRef.close();
              this.toastr.success('Transfer completed!!');
            },
            error: () => {
              console.log('Error !');
              this.guidedvideoService.guidedVideoURL = "";
            },
            progress: (percent) => {
              this.loaderService.percent=percent;
             /*  if (percent < 100) { }
              // this.loaderService.processloader = true
              else if (percent === 100)
                this.loaderService.processloader = false; */
            }
          };
          this.blob.upload(this.config);
        }
      });
    }
  }

  startVideoUploadInLesson(recordRTC) {
    if (this.recordRTC != undefined) {
      var filename = 'video' + CommonService.getGuid() + '.mp4';

      this.videoService.post('/planner/GetBlobSasToken?filename=' + filename + '&containerName=' + "vl2songs", new HttpParams()).subscribe((response: any) => {
        Config.sas = response;
        if (recordRTC !== null) {
         // this.loaderService.processloader = true
          this.file = recordRTC.blob;
          const baseUrl = this.blob.generateBlobUrl(Config, filename);
          this.config = {
            baseUrl: baseUrl,
            sasToken: Config.sas,
            blockSize: 1024 * 64, // OPTIONAL, default value is 1024 * 32
            file: this.file,
            complete: () => {
              this.videoService.videoURL = baseUrl;
              console.log('URL : ' + baseUrl);
              this.dialogRef.close();
              this.toastr.success('Transfer completed!!');
            },
            error: () => {
              console.log('Error !');
              this.videoService.videoURL = "";
            },
            progress: (percent) => {
              this.loaderService.percent=percent;
             /*  if (percent < 100) { }
              //this.loaderService.processloader = true
              else if (percent === 100)
                this.loaderService.processloader = false; */
            }
          };
          this.blob.upload(this.config);
        }
      });
    }
  }

}
