import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';
import { StudentService } from '../services/student.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-student-modal-dialog',
  templateUrl: './add-student-modal-dialog.component.html',
  styleUrls: ['./add-student-modal-dialog.component.scss']
})
export class AddStudentModalDialogComponent implements OnInit {

  @ViewChild('addStudentForm') studentForm: any;
  isFormSubmitFlag: boolean = false;
  TeacherInvite: any;
  isInvitationProcessing: boolean = false;

  constructor(public dialogRef: MatDialogRef<AddStudentModalDialogComponent>, private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any, private studentService: StudentService, private router: Router) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.initializeTeacherInvitesData();
  }

  inviteStudent() {
    this.isFormSubmitFlag = true;
    if (this.studentForm.valid) {
      let user = JSON.parse(localStorage.getItem('userData'));
      if (this.TeacherInvite.UserEamil === user.Email) {
        this.toastr.warning("Sorry, you can't use your email to invite a student.");
      }
      else {
        this.isInvitationProcessing = true;
        this.studentService.post('/teacher/InviteStudent', this.TeacherInvite, new HttpParams()).subscribe((response: any) => {
          if (response.status === 200) {
            this.toastr.success("Invite sent successfully.");
            this.isFormSubmitFlag = false;
            this.studentForm.reset();
            this.dialogRef.close();
            if (this.router.url.indexOf('student-list') > -1) {
              this.studentService.getStudentListingData().subscribe(result => {
                this.studentService.studentList = result;
              })
            }
          }
          else if (response.status === 202) {
            this.toastr.warning("You already have this student connection.");
            this.isFormSubmitFlag = false;
            this.studentForm.reset();
          }
          else if (response.status === 400) {
            this.toastr.error("Invite was not successful. Please try again.");
          }
          this.isInvitationProcessing = false;
        });
      }
    }
  }

  initializeTeacherInvitesData() {
    let userData = JSON.parse(localStorage.getItem('userData'));
    var teacherId = userData.Teacher[0].TeacherId;
    this.TeacherInvite = {
      TeacherInviteId: 0,
      TeacherId: teacherId,
      UserFirstName: '',
      UserLastName: '',
      UserEamil: '',
      InviteStatus: '',
      TeacherUserGuid: userData.UserGUID,
      TeacherUserName: userData.FirstName + ' ' + userData.LastName,
      CreatedDate: Date.now,
      ModifiedDate: null
    }
  }
}
