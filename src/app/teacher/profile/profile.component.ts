import { Component, OnInit } from '@angular/core';
import { TeacherService } from '../../services/teacher.service';
import { TeacherProfileModel } from '../../models/teacherProfile.model';
import { Router } from '@angular/router';
import { CommonService } from '../../common/common.service';
import { DomSanitizer, SafeUrl } from '../../../../node_modules/@angular/platform-browser';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-teacher-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class TeacherProfileComponent implements OnInit {
  teacherProfile: TeacherProfileModel;
  trustedDashboardUrl: SafeUrl;
  constructor(public teacherService: TeacherService, private loaderService: LoaderService,
    private router: Router, public commonService: CommonService, private sanitizer: DomSanitizer) {
    this.teacherProfile = this.teacherService.teacherProfileData;
  }

  ngOnInit() {
    var userData = JSON.parse(localStorage.getItem('userData'));
    if (userData.IsTeacher === 1 && userData.Teacher[0].ImageUrl != null) {
      this.commonService.userProfilePic = userData.Teacher[0].ImageUrl;
    }
    else {
      this.commonService.userProfilePic = this.teacherService.imageUrl;
    }
    if (this.commonService.userProfilePic != null && this.commonService.userProfilePic != "" && this.commonService.userProfilePic != undefined
      && this.commonService.userProfilePic != "null")
      this.commonService.isDefaultImageFlag = false;
      
    this.loaderService.processloader = true;
    this.teacherService.getTeacherProfile().then((response: any) => {
      this.teacherService.broadCast.subscribe(data => {
        this.loaderService.processloader = false;
        this.teacherProfile = data;
        if (data.VideoIntroUrl.includes('youtube.com')) {
          this.trustedDashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl((data.VideoIntroUrl).replace("watch?v=", "embed/"));
        }
        else if (data.VideoIntroUrl.includes('vimeo.com')) {
          this.trustedDashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl((data.VideoIntroUrl).replace("vimeo.com", "player.vimeo.com/video"));
        }
        else if (data.VideoIntroUrl.includes('dailymotion.com')) {

          this.trustedDashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl((data.VideoIntroUrl).replace("dailymotion.com/video", "dailymotion.com/embed/video"));
        }
        else {
          this.trustedDashboardUrl = "../assets/images/video-img.jpg";
        }
      });
    });
  }

  booklesson() {
    this.router.navigateByUrl('student/schedule/personalsettings');
  }
}
