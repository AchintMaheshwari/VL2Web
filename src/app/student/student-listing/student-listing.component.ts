import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '../../../../node_modules/@angular/material';
import { AddStudentModalDialogComponent } from '../../add-student-modal-dialog/add-student-modal-dialog.component';
import { LessonsService } from '../../services/lessons.service';
import { CreateLessonDialogComponent } from '../../teacher/exercise-library/lesson-library/create-lesson-dialog/create-lesson-dialog.component';
import { CommonService } from '../../common/common.service';

declare var LivePlayer: any;
@Component({
  selector: 'app-student-listing',
  templateUrl: './student-listing.component.html',
  styleUrls: ['./student-listing.component.scss']
})
export class StudentListingComponent implements OnInit {

  constructor(public studentService: StudentService, private router: Router, private toastr: ToastrService, public dialog: MatDialog,
    private lessonService: LessonsService, public commonService: CommonService) { }

  openDialog(): void {
    let dialogRef = this.dialog.open(AddStudentModalDialogComponent, {
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  ngOnInit() {
    this.studentService.getStudentListingData().subscribe(result => {
      this.studentService.studentList = result;
    })
  }

  openCreateDialog(student: any): void {
    this.lessonService.selectedStudent = student;
    this.lessonService.dialogTitle = "Create a New Lesson";
    this.lessonService.isShowEditModel = false;
    this.lessonService.isShowCreateModel = true;
    const dialogRef = this.dialog.open(CreateLessonDialogComponent, {
      maxHeight: '80vh'
    });
  }

  getStudentProfile(profileId, imageURL) {
    if (profileId === 0) {
      this.toastr.warning("Student has not completed the profile.");
    }
    else {
      this.studentService.studentProfileId = profileId;
      this.studentService.imageUrl = imageURL;
      this.router.navigateByUrl('/student/profile');
    }
  }

  startLobbyLesson(studentId: string, displayName: string) {
    localStorage.setItem('lobbyStudentDisplayName', displayName);
    localStorage.setItem('lobbyStudentId', studentId);
    LivePlayer.livePlayerHasInit = false;
    this.router.navigate(['/teacher/lobby'])
  }

  resendInvite(studentId: string) {
    let studentdata = this.studentService.studentList.find(s => s.StudentId === studentId);
    this.studentService.resendTeacherInvite(studentdata).subscribe((response: any) => {
      if (response.status === 200) {
        this.toastr.success("Invite sent successfully.");
      }
      else if (response.status === 202) {
        this.toastr.warning("You already have this student connection.");
      }
      else if (response.status === 400) {
        this.toastr.error("Invite could not be sent. Please try again.");
      }
    });
  }

  linkCopiedMessage() {
    this.toastr.success('Link copied to clipboard');
  }

  sendLinkToStudent(displayName: string, roomkey: string, email: string, cellPhone: string) {
    let user = CommonService.getUser();
    let studentData = {
      TeacherName: user.FirstName + " " + user.LastName,
      StudentName: displayName,
      Roomkey: roomkey,
      StudentCellNumber: cellPhone,
      UserEamil: email
    }
    this.studentService.post('/student/SendPersistantRoomLink', studentData, null).subscribe(result => {
      if (result) {
        this.toastr.success("Room link successfully mailed to student.");
      }
      else {
        this.toastr.error("Room link could not be sent. Please try again.");
      }
    })
  }
}
