import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { LessonsService } from '../../../services/lessons.service';
import { CommonService } from '../../../common/common.service';
import { ConfirmDeleteLessonComponent } from '../../confirm-delete-lesson/confirm-delete-lesson.component';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../../services/loader.service';
import { CreatePlaylistDialogComponent } from './create-playlist-dialog/create-playlist-dialog.component';
import { PlaylistService } from '../../../services/playlist.service';

@Component({
  selector: 'app-playlist-library',
  templateUrl: './playlist-library.component.html',
  styleUrls: ['./playlist-library.component.scss']
})
export class PlaylistLibraryComponent implements OnInit {
  panelOpenState: boolean = false;
  filterDashboard: any;
  userId: number;
  userType: string;
  constructor(public dialog: MatDialog, public lessonService: LessonsService, private toastr: ToastrService,
    private loaderService: LoaderService, public commonService: CommonService,
    public playlistService: PlaylistService) {
    CommonService.isEditLessonQueueLoaded = false;
    localStorage.setItem("EditLesson", "");
    this.userType = localStorage.getItem("UserType");
  }

  openCreateDialog(): void {
    this.lessonService.playlistDialogTitle = "Create a New Playlist";
    this.lessonService.isShowEditModel = false;
    this.lessonService.isShowCreateModel = true;
    const dialogRef = this.dialog.open(CreatePlaylistDialogComponent, {
      maxHeight: '80vh'
    });
  }

  openEditDialog(): void {
    this.lessonService.playlistDialogTitle = "Edit Playlist";
    this.lessonService.isShowEditModel = true;
    this.lessonService.isShowCreateModel = false;
    const dialogRef = this.dialog.open(CreatePlaylistDialogComponent, {
      maxHeight: '80vh'
    });
  }

  openCopyDialog(): void {
    this.lessonService.playlistDialogTitle = "Copy Playlist";
    this.lessonService.isShowEditModel = true;
    this.lessonService.isShowCreateModel = false;
    const dialogRef = this.dialog.open(CreatePlaylistDialogComponent, {
      maxHeight: '80vh'
    });
  }

  ngOnInit() {
    this.getPlaylistLibraries();
    this.userId = CommonService.getUser().UserId;
  }

  getPlaylistLibraries() {
    this.loaderService.processloader = true;
    this.playlistService.getPlaylistLibraries().subscribe((response: any) => {
      this.loaderService.processloader = false;
      this.lessonService.lessonsList = response;
    })
  }

  GetIndivisualPlaylistdata(lessonId, lessonName, tags, Users, Action) {
    this.lessonService.currentLessonId = lessonId;
    this.lessonService.currentLessonTags = tags;
    this.lessonService.lessonNameEdit = lessonName;
    if (Action == "Edit") {
      this.openEditDialog();
    }
    else {
      this.openCopyDialog();
    }
  }

  opendeleteDialog(lessonId, lessonName): void {
    this.lessonService.currentLessonId = lessonId;
    this.lessonService.currentLessonName = lessonName;
    this.dialog.open(ConfirmDeleteLessonComponent, {});
  }

  linkCopiedMessage() {
    this.toastr.success('Successfully Cloned!!! Enjoy the musical journey!!!');
  }
}
