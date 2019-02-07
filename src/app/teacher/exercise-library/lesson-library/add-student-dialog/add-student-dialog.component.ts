import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '../../../../../../node_modules/@angular/material';
import { MalihuScrollbarService } from '../../../../../../node_modules/ngx-malihu-scrollbar';
import { LessonsService } from '../../../../services/lessons.service';
import { ToastrService } from 'ngx-toastr';
import { SharedlibraryService } from '../../../../services/sharedlibrary.service';

export interface DialogData {
}

@Component({
  selector: 'app-add-student-dialog',
  templateUrl: './add-student-dialog.component.html',
  styleUrls: ['./add-student-dialog.component.scss']
})
export class AddStudentDialogComponent implements OnInit {
  AssociatedStudent: any;
  filterStudents: any;
  constructor(private mScrollbarService: MalihuScrollbarService, public dialogRef: MatDialogRef<AddStudentDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData
    , private lessonSer: LessonsService, private toastr: ToastrService, public sharedService: SharedlibraryService) {
    this.lessonSer.getAssociatedStudents().subscribe(result => {
      this.AssociatedStudent = result;
    });
  }

  ngAfterViewInit() {
    this.mScrollbarService.initScrollbar('#divOne', { axis: 'y', theme: 'dark-thick', scrollButtons: { enable: true } });
    this.mScrollbarService.initScrollbar('#divTwo', { axis: 'y', theme: 'dark-thick', scrollButtons: { enable: true } });
    this.mScrollbarService.initScrollbar('#divThree', { axis: 'y', theme: 'dark-thick', scrollButtons: { enable: true } });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

  selectStudent(student: any) {
    this.lessonSer.isStudentAdded = true;
    if (this.sharedService.LessonModel.Student != null && this.sharedService.LessonModel.Student.length > 0 && this.sharedService.LessonModel.Student.
      find(x => x.UserId === student.UserId) != undefined) {
      this.toastr.warning("This Student already exists !");
    }
    else {
      this.sharedService.LessonModel.Student.push(student);
      this.dialogRef.close();
    }
  }
  hideModel() {
    this.dialogRef.close();
  }

}
