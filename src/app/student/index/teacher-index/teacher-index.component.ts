import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { StudentService } from '../../../services/student.service';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TeacherService } from '../../../services/teacher.service';
import { UserService } from '../../../services/user.service';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../common/common.service';

@Component({
  selector: 'app-teacher-index',
  templateUrl: './teacher-index.component.html',
  styleUrls: ['./teacher-index.component.css']
})
export class TeacherIndexComponent implements OnInit, OnDestroy {
  Interval: any = 1;
  ngOnDestroy(): void {
    if (this.Interval) {
      clearInterval(this.Interval);
    }
  }
  profileIdList: any;
  modalRef: BsModalRef;
  matchingTeachers: any;
  constructor(public studentService: StudentService, private teacherService: TeacherService, private router: Router, private modalService: BsModalService,
    private userService: UserService, private toastr: ToastrService, private commonService: CommonService) { }

  ngOnInit() {
    this.studentService.getTeacherMatchingData(3).subscribe(result => {
      this.matchingTeachers = result; console.log(result.length);
      if (result.length < 1)
        this.toastr.info('We are working on matching you with The Best Voice Teachers. Please check your email for an update when matches have been completed.');
      this.profileIdList = [];
      result.forEach(i => this.profileIdList.push(i.TeacherProfileId));
      this.Interval = setInterval(() => {
        if (this.Interval > 1)
          this.getTeacherActivityStatus();
      }, 3000);
    });
  }

  async getTeacherActivityStatus() {
    this.studentService.post("/user/GetUserActivityStatus", this.profileIdList,
      new HttpParams().set("role", this.userService.userRole)).subscribe(response => {
        response.forEach(x => this.matchingTeachers.
          find(t => t.TeacherProfileId === x.TeacherProfileId).Activity = x.Activity);
      });
  }

  booklesson(LinkGUID, teacherId) {
    this.commonService.associatedTeacherId = teacherId;
    localStorage.setItem("LessonLink", LinkGUID);
    this.router.navigate(['/student/schedule/personalsettings']);
  }

  teacherDetails(profileId, LinkGUID, imageUrl) {
    this.teacherService.profileId = profileId;
    this.teacherService.teacherImageUrl = imageUrl;
    localStorage.setItem("LessonLink", LinkGUID);
    this.router.navigate(['/teacher/profile']);
  }
}
