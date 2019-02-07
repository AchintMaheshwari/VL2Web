import { Component, OnInit, ViewChild } from '@angular/core';
import { RateTeacherService } from '../../services/rate-teacher.service';
import { Router } from '../../../../node_modules/@angular/router';
import { SharedlibraryService } from '../../services/sharedlibrary.service';
import { MatDialogRef } from '../../../../node_modules/@angular/material';
import { CommonService } from '../../common/common.service';
import { HttpParams } from '../../../../node_modules/@angular/common/http';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { IStarRatingOnClickEvent, IStarRatingOnRatingChangeEven } from '../../../../node_modules/angular-star-rating/dist/src/star-rating-struct';

@Component({
  selector: 'app-rate-teacher-dialog',
  templateUrl: './rate-teacher-dialog.component.html',
  styleUrls: ['./rate-teacher-dialog.component.scss']
})
export class RateTeacherDialogComponent implements OnInit {

  @ViewChild('reviewForm') form: any;
  isFormSubmitFlag: boolean = false;
  isFormProcessing: boolean = false;
  onClickResult: IStarRatingOnClickEvent;
  //onHoverRatingChangeResult:OnHoverRatingChangeEvent;
  onRatingChangeResult: IStarRatingOnRatingChangeEven;
  isHalfStar: any;

  teacherName: string;
  imageURL: string;
  isLesson: boolean = false;

  constructor(public rateTeacherService: RateTeacherService, private router: Router, public sharedLibrary: SharedlibraryService,
    public dialogRef: MatDialogRef<RateTeacherDialogComponent>, private toastr: ToastrService) {
    this.isLesson = this.router.url.includes('videoConnected');
    if (this.isLesson==true) {
      this.rateTeacherService.initialiseTeacherReviewModel();
    }
  }


  ngOnInit() {
    this.rateTeacherService.TeacherReviewModel.Rating = 0;
    if (this.isLesson==true) {
      this.getTeacherProfileImageAndName(this.sharedLibrary.LessonModel.TeacherId);
    } else {
      this.getTeacherProfileImageAndName(this.rateTeacherService.TeacherReviewModel.TeacherUserId);
      this.rateTeacherService.TeacherReviewModel.Comment = '';
      let userData = CommonService.getUser();
      this.rateTeacherService.TeacherReviewModel.StudentUserId=userData.Student[0].StudentId;;
    }
  }

  getTeacherProfileImageAndName(teacherId) {
    this.rateTeacherService.getTeacherProfileImageAndName(teacherId).subscribe((response: any) => {
      var data = response.split(',');
      this.teacherName = data[0];
      this.imageURL = data[1];
      this.imageURL = this.imageURL.split('?')[0];
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  upsertReview() {
    this.isFormSubmitFlag = true;
    if (this.rateTeacherService.TeacherReviewModel.Rating != 0) {
      if (this.form.valid) {
        let userData = CommonService.getUser();
        if (this.isLesson==true) {
          this.rateTeacherService.TeacherReviewModel.StudentUserId = userData.Student[0].StudentId;
          this.rateTeacherService.TeacherReviewModel.TeacherUserId = this.sharedLibrary.LessonModel.TeacherId;
          this.rateTeacherService.TeacherReviewModel.LessonId = this.sharedLibrary.LessonModel.LessonId;
        }
        this.rateTeacherService.TeacherReviewModel.IsApproved = 0;
        this.rateTeacherService.post('/tProfile/UpsertReview', this.rateTeacherService.TeacherReviewModel, new HttpParams()).subscribe((response: any) => {
          this.dialogRef.close();
          var isLobby = this.router.url.includes('lobby');
          if (this.isLesson == true) {
            this.router.navigate(['/student/dashboard']);
          } else if(isLobby==true) {
            this.router.navigate(['/student/lobby']);
          }
        });
      }
    } else {
      this.toastr.warning("Please provide the rating of teacher!!!");
    }
  }

  ratingComponentClick(clickObj: any): void {
    console.log(clickObj);
    var starClass = clickObj.path[4].className;
    if (starClass.includes('1')) {
      this.rateTeacherService.TeacherReviewModel.Rating = 1;
    }
    else if (starClass.includes('2')) {
      this.rateTeacherService.TeacherReviewModel.Rating = 2;
    }
    else if (starClass.includes('3')) {
      this.rateTeacherService.TeacherReviewModel.Rating = 3;
    }
    else if (starClass.includes('4')) {
      this.rateTeacherService.TeacherReviewModel.Rating = 4;
    }
    else if (starClass.includes('5')) {
      this.rateTeacherService.TeacherReviewModel.Rating = 5;
    }
  }

  clickRating(clickObj: any): void {
    if (clickObj.offsetX < 16) {
      this.isHalfStar = true;
      this.rateTeacherService.TeacherReviewModel.Rating = parseFloat(this.rateTeacherService.TeacherReviewModel.Rating) - 0.5;
    } else {
      this.isHalfStar = false;
    }
  }

  onClickRating = ($event) => {
    this.rateTeacherService.TeacherReviewModel.Rating = $event.rating;
  };

}
