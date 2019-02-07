import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LessonsService } from '../../services/lessons.service';
import { LessonLibraryComponent } from '../exercise-library/lesson-library/lesson-library.component';
import { CommonService } from '../../common/common.service';

@Component({
  selector: 'app-confirm-delete-lesson',
  templateUrl: './confirm-delete-lesson.component.html',
  styleUrls: ['./confirm-delete-lesson.component.scss']
})
export class ConfirmDeleteLessonComponent implements OnInit {

  toastr: any;
  crudService: any;
  dialog: any;
  constructor(public dialogRef: MatDialogRef<ConfirmDeleteLessonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public lessonSer: LessonsService, public commonService: CommonService) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onDeleteLesson() {
    this.lessonSer.IsDeleted = true;
    this.lessonSer.deleteLessson().subscribe((response: any) => {
      this.dialogRef.close();
      this.toastr.success(this.lessonSer.currentLessonName + ' has been deleted from your library.');
      let refreshlibrary = new LessonLibraryComponent(this.dialog, this.lessonSer, this.toastr, null, this.commonService);
      refreshlibrary.getLessonLibraries();
    });
  }

  ngOnInit() {
  }

}
