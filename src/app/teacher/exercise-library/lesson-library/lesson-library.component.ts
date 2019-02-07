import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '../../../../../node_modules/@angular/material';
import { CreateLessonDialogComponent } from './create-lesson-dialog/create-lesson-dialog.component';
import { LessonsService } from '../../../services/lessons.service';
import { CommonService } from '../../../common/common.service';
import { ConfirmDeleteLessonComponent } from '../../confirm-delete-lesson/confirm-delete-lesson.component';
import { ToastrService } from '../../../../../node_modules/ngx-toastr';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-lesson-library',
  templateUrl: './lesson-library.component.html',
  styleUrls: ['./lesson-library.component.scss']
})
export class LessonLibraryComponent implements OnInit {

  panelOpenState: boolean = false;
  filterDashboard: any;
  userId: number;
  userType: string;
  constructor(public dialog: MatDialog, public lessonService: LessonsService, private toastr: ToastrService,
    private loaderService: LoaderService, public commonService: CommonService) {
    CommonService.isEditLessonQueueLoaded = false;
    localStorage.setItem("EditLesson", "");
    this.userType = localStorage.getItem("UserType");
  }

  openCreateDialog(): void {
    this.lessonService.dialogTitle = "Create a New Lesson";
    this.lessonService.isShowEditModel = false;
    this.lessonService.isShowCreateModel = true;
    const dialogRef = this.dialog.open(CreateLessonDialogComponent, {
      maxHeight: '80vh'
    });
  }

  openEditDialog(): void {
    this.lessonService.dialogTitle = "Edit Lesson";
    this.lessonService.isShowEditModel = true;
    this.lessonService.isShowCreateModel = false;
    const dialogRef = this.dialog.open(CreateLessonDialogComponent, {
      maxHeight: '80vh'
    });
  }

  openCopyDialog(): void {
    this.lessonService.dialogTitle = "Copy Lesson";
    this.lessonService.isShowEditModel = true;
    this.lessonService.isShowCreateModel = false;
    const dialogRef = this.dialog.open(CreateLessonDialogComponent, {
      maxHeight: '80vh'
    });
  }

  ngOnInit() {
    this.getLessonLibraries();
    this.userId = CommonService.getUser().UserId;
  }

  getLessonLibraries() {
    this.loaderService.processloader = true;
    this.lessonService.getLessonLibraries().subscribe((response: any) => {
      this.loaderService.processloader = false;
      this.lessonService.lessonsList = response;
      this.lessonService.unmodifiedLessonsList = response;
    })
  }

  onChange(val) {
    let result = this.lessonService.unmodifiedLessonsList;
    if (val == 'Purchased' || val == 'Free') {
      this.lessonService.lessonsList = result.filter(x => x.SourceType == val)
    }
    else if (val == 'Made by me') {
      this.lessonService.lessonsList = result.filter(x => x.CreatedBy === this.userId);
    }
    if (val == 'All') {
      this.lessonService.lessonsList = result;
    }
  }

  GetIndivisualLessondata(lessonId, lessonName, tags, Users, Action) {
    this.lessonService.getLessonUserMapByLessonId(lessonId).subscribe((response: any) => {
      this.lessonService.currentLessonStudent = response[0].Users;
    });
    this.lessonService.currentLessonId = lessonId;
    this.lessonService.currentLessonTags = tags;
    this.lessonService.currentLessonStudent = Users;
    this.lessonService.lessonNameEdit = lessonName;
    if (Action == "Edit") {
      this.openEditDialog();
    }
    else {
      this.openCopyDialog();
    }
  }

  opendeleteDialog(lessonDelId, lessonName): void {
    this.lessonService.currentLessonId = lessonDelId;
    this.lessonService.currentLessonName = lessonName
    this.dialog.open(ConfirmDeleteLessonComponent, {});
  }

  linkCopiedMessage() {
    this.toastr.success('Successfully Cloned!!! Enjoy the musical journey!!!');
  }
}
