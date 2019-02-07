import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SongsService } from '../../services/song.service';
import { SongLibraryComponent } from '../exercise-library/song-library/song-library.component';
import { ToastrService } from 'ngx-toastr';
import { SharedlibraryService } from '../../services/sharedlibrary.service';
import { CommonService } from '../../common/common.service';

@Component({
  selector: 'app-confirm-delete-song',
  templateUrl: './confirm-delete-song.component.html',
  styleUrls: ['./confirm-delete-song.component.scss']
})
export class ConfirmDeleteSongComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ConfirmDeleteSongComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public songService: SongsService, private toastr: ToastrService,
    private sharedService: SharedlibraryService, public commonService: CommonService) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onDeleteSong() {
    this.songService.deleteSong().subscribe((response: any) => {
      this.dialogRef.close();
      this.toastr.success(this.songService.currentSongName + ' has been deleted from your library.');
      this.songService.songsList.splice(this.songService.songsList.findIndex(i => i.SongId === this.songService.currentSongId), 1);
      this.songService.unfilteredSongList = this.songService.songsList;
      let songLib = new SongLibraryComponent(this.songService, null, null, null, this.sharedService, this.toastr, null, this.commonService);
      songLib.searchSong();
    });
  }

  ngOnInit() {
  }

}
