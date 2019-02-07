import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ExerciseLibraryService } from '../../services/exercise-library.service';
import { ExerciseLibraryComponent } from '../exercise-library/exercise-library.component';
import { ToastrService } from 'ngx-toastr';
import { SharedlibraryService } from '../../services/sharedlibrary.service';

@Component({
  selector: 'app-confirm-delete-excercise',
  templateUrl: './confirm-delete-excercise.component.html',
  styleUrls: ['./confirm-delete-excercise.component.scss']
})
export class ConfirmDeleteExcerciseComponent implements OnInit {
  exerciseLibraryReference: any = window;
  lessonService: any;
  exerciseLibraryService: any;
  dialog: any;
  constructor(public dialogRef: MatDialogRef<ConfirmDeleteExcerciseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public exerciseSer: ExerciseLibraryService,
    private toastr: ToastrService, private sharedService: SharedlibraryService) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onDeleteExercise() {
    this.exerciseSer.deleteExercise().subscribe((response: any) => {
      this.dialogRef.close();
      this.toastr.success(this.exerciseSer.currentExerciseName + ' has been deleted from your library.');
      this.exerciseSer.exerciseList.splice(this.exerciseSer.exerciseList.findIndex(i => i.ExerciseId === this.exerciseSer.currentexerciseId), 1)
      this.exerciseSer.unfilteredExerciseList = this.exerciseSer.exerciseList;
      let exLib = new ExerciseLibraryComponent(this.exerciseSer, null, null, null, this.toastr, this.sharedService, null);
      exLib.searchExercise();
    });
  }

  ngOnInit() {
  }

}
