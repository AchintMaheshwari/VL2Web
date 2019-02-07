import { Component, OnInit } from '@angular/core';
import { Router } from '../../../../node_modules/@angular/router';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { TeacherService } from '../../services/teacher.service';
import { CommonService } from '../../common/common.service';


declare var LivePlayer: any;

@Component({
  selector: 'app-teacher-listing',
  templateUrl: './teacher-listing.component.html',
  styleUrls: ['./teacher-listing.component.scss']
})
export class TeacherListingComponent implements OnInit {

  constructor(public teacherService: TeacherService, private router: Router, private commonService: CommonService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.teacherService.getTeachertListData().subscribe(result => {
      this.teacherService.teacherList = result;
    })
  }

  getTeacherProfile(profileId, imageURL) {
    this.commonService.isStudentUser = true;
    if (profileId === 0) {
      this.toastr.warning("Teacher has not completed the profile.");
    }
    else {
      this.teacherService.teacherProfileId = profileId;
      this.teacherService.imageUrl = imageURL;
      this.router.navigateByUrl('/teacher/profile');
    }
  }

  lessonScheduling(teacherId: string, teacherName: string) {
    this.commonService.associatedTeacherId = teacherId;
    this.commonService.associatedTeacherName = teacherName;
    this.router.navigate(['/student/schedule/personalsettings']);
  }

  startLobbyLesson(teacherId: string, displayName: string) {
    localStorage.setItem('lobbyTeacherId', teacherId);
    localStorage.setItem('lobbyTeacherDisplayName', displayName);
    LivePlayer.livePlayerHasInit = false;
    this.router.navigate(['/student/lobby']);
  }
}
