import { Component, OnInit, OnDestroy } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { StudentProfileModel } from '../../models/studentProfile.model';
import { studyGoals } from '../../services/student.service';
import { CommonService } from '../../common/common.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-student-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class StudentProfileComponent implements OnInit {

  studentProfile: StudentProfileModel;
  studentImageUrl: string = '';
  constructor(public studentService: StudentService, public commonService: CommonService, private userService: UserService) {
    this.studentProfile = this.studentService.studentProfileData;
  }

  ngOnInit() {
    if (this.userService.userRole === "Student") {
      this.studentService.getStudentProfile().then((response: any) => {
        this.studentService.broadCast.subscribe(data => { this.studentProfile = data; });
        this.studentProfile.StudentStyles = this.studentProfile.VocalStyles != "" && this.studentProfile.VocalStyles != null ? this.studentProfile.VocalStyles.split(',') : [];
        //this.setStudyGoals(); 
        this.studentImageUrl = this.commonService.userProfilePic;
      });
    }
    else {
      this.studentService.getAssociatedStudentProfile().then((response: any) => {
        this.studentService.broadCast.subscribe(data => { this.studentProfile = data; });
        //this.setStudyGoals();   
        this.studentProfile.StudentStyles = this.studentProfile.VocalStyles != "" && this.studentProfile.VocalStyles != null ? this.studentProfile.VocalStyles.split(',') : [];
        this.studentImageUrl = this.studentService.imageUrl;
      });
    }
    if (this.studentImageUrl != null && this.studentImageUrl != "" && this.studentImageUrl != undefined
      && this.studentImageUrl != "null")
      this.commonService.isDefaultImageFlag = false;
  }

  setStudyGoals() {
    if (this.studentProfile.GoalsForStudy & studyGoals.ToneQuality) {
      this.studentService.toneQualityFlag = true;
    }
    if (this.studentProfile.GoalsForStudy & studyGoals.VocalRange) {
      this.studentService.vocalRangeFlag = true;
    }
    if (this.studentProfile.GoalsForStudy & studyGoals.NewSkill) {
      this.studentService.newSkillFlag = true;
    }
    if (this.studentProfile.GoalsForStudy & studyGoals.FriendsFamily) {
      this.studentService.friendFamilyFlag = true;
    }
    if (this.studentProfile.OtherGoalForStudy != null && this.studentProfile.OtherGoalForStudy != '') {
      this.studentService.otherGoalFlag = true;
    }
  }
}