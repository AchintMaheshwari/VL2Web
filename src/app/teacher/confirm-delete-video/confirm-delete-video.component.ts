import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { VideoService } from '../../services/video.service';
import { VideoLibraryComponent } from '../exercise-library/video-library/video-library.component';
import { ToastrService } from 'ngx-toastr';
import { SharedlibraryService } from '../../services/sharedlibrary.service';
import { CommonService } from '../../common/common.service';

@Component({
  selector: 'app-confirm-delete-video',
  templateUrl: './confirm-delete-video.component.html',
  styleUrls: ['./confirm-delete-video.component.scss']
})
export class ConfirmDeleteVideoComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ConfirmDeleteVideoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public videoService: VideoService, private toastr: ToastrService,
    private sharedService: SharedlibraryService, public commonService: CommonService) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onDeleteVideo() {
    this.videoService.deleteVideo().subscribe((response: any) => {
      this.dialogRef.close();
      this.toastr.success(this.videoService.currentVideoName + ' has been deleted from your library.');
      this.videoService.videosList.splice(this.videoService.videosList.findIndex(i => i.VideoId === this.videoService.currentVideoId), 1);
      this.videoService.unfilteredVideoList = this.videoService.videosList;
      let videoLib = new VideoLibraryComponent(this.videoService, null, null, null, this.sharedService, this.toastr, null, this.commonService);
      videoLib.getVideoLibraries();
    });
  }

  ngOnInit() {
  }

}

