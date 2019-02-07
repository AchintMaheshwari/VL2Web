import { Component, OnInit, ViewChild, ViewContainerRef, HostListener, OnDestroy } from '@angular/core';
import { StudentProfileModel } from '../../models/studentProfile.model';
import { SharedModule } from '../../shared/shared.module';
import { StudentService } from '../../services/student.service';
import { studyGoals } from '../../services/student.service';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ImageUploadComponent } from '../../image-upload/image-upload.component';
import { CommonService } from '../../common/common.service';
import { initialState } from 'ngx-bootstrap/timepicker/reducer/timepicker.reducer';
import { BsModalService } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { QuestionnaireService } from '../../services/questionnaire.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-student-profile-edit',
  templateUrl: './student-profile-edit.component.html',
  styleUrls: ['./student-profile-edit.component.scss']
})

export class StudentProfileEditComponent implements OnInit {

  key: string;
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.key = event.key;
  }

  @ViewChild('studentForm') form: any;
  studentProfileId: number = 1;
  vocalTypes: Array<{ type: string }>;
  studentProfile: StudentProfileModel;
  isFormSubmitFlag: boolean = false;
  profileStatusId: string;
  otherStyleFlag: boolean = false;
  schoolLevels: any = [{ "level": "Elementary school" },
  { "level": "Middle school" },
  { "level": "Jr. High school" },
  { "level": "High school" },
  { "level": "Undergraduate" },
  { "level": "Graduate" },
  { "level": "No longer in school" }]

  constructor(private sharedModule: SharedModule, public commonService: CommonService, public studentService: StudentService, private route: Router,
    public modalService: BsModalService, public viewRef: ViewContainerRef, private toastr: ToastrService, private quizService: QuestionnaireService,
    private loaderService: LoaderService
  ) {
    this.vocalTypes = this.sharedModule.vocalTypes;
    this.studentProfile = this.studentService.studentProfileData;
  }

  ngOnInit() {
    if (this.commonService.userProfilePic != null && this.commonService.userProfilePic != ""
      && this.commonService.userProfilePic != undefined && this.commonService.userProfilePic != "null")
      this.commonService.isDefaultImageFlag = false;
    var userData = JSON.parse(localStorage.getItem('userData'));
    this.profileStatusId = userData.StudentProfileStatusId;
    if (this.route.routerState.snapshot.url.indexOf("/student/profile/edit") >= 0) {
      if (userData.StudentProfileId > 0) {
        this.getStudentProfileData(userData.UserId);
      }
      else {
        this.getVocalstyles(userData.UserId);
      }
    }
  }

  private getStudentProfileData(userId: number) {
    this.studentService.getStudentProfile().then((response: any) => {
      this.studentService.broadCast.subscribe(data => { this.studentProfile = data; });
      // if (this.studentProfile.GoalsForStudy & studyGoals.ToneQuality) {
      //   this.studentService.toneQualityFlag = true;
      // }
      // if (this.studentProfile.GoalsForStudy & studyGoals.VocalRange) {
      //   this.studentService.vocalRangeFlag = true;
      // }
      // if (this.studentProfile.GoalsForStudy & studyGoals.NewSkill) {
      //   this.studentService.newSkillFlag = true;
      // }
      // if (this.studentProfile.GoalsForStudy & studyGoals.FriendsFamily) {
      //   this.studentService.friendFamilyFlag = true;
      // }
      // if (this.studentProfile.OtherGoalForStudy != null && this.studentProfile.OtherGoalForStudy != '') {
      //   this.studentService.otherGoalFlag = true;
      // }
      if (this.studentProfile != null) {
        if (this.studentProfile.ModifiedOn === null || this.studentProfile.ModifiedOn === '') {
          this.getVocalstyles(userId);
        }
        else {
          this.studentProfile.StudentStyles = (this.studentProfile.VocalStyles != "" && this.studentProfile.VocalStyles != null) ? this.studentProfile.VocalStyles.split(',') : [];
          this.otherStyleFlag = this.studentProfile.OtherStyle != "" && this.studentProfile.OtherStyle != null ? true : false;
        }
      }
      else
        this.getVocalstyles(userId);
    });
  }

  getVocalstyles(userId: number) {
    this.quizService.getVocalStyles(userId).subscribe((result: any) => {
      if (result != null) {
        this.studentProfile.VocalStyles = result.VocalStyles;
        this.studentProfile.StudentStyles = this.studentProfile.VocalStyles != "" && this.studentProfile.VocalStyles != null ? this.studentProfile.VocalStyles.split(',') : [];
        if (result.OtherStyle != "" && result.OtherStyle != null) {
          this.otherStyleFlag = true;
          this.studentProfile.OtherStyle = result.OtherStyle;
        }
      }
    })
  }

  saveOrUpdateStudentProfile(): void {
    this.isFormSubmitFlag = true;
    // if (this.form.valid && (this.studentProfile.GoalsForStudy > 0 || this.studentProfile.OtherGoalForStudy != '')) {
    if (this.form.valid) {
      this.studentProfile.UserId = JSON.parse(localStorage.getItem('userData')).UserId;
      this.loaderService.processloader = true;
      this.studentService.post("/sProfile/SaveStudentProfileData", this.studentProfile, new HttpParams().set('profileStatusId', this.profileStatusId)).subscribe((response: any) => {
        this.loaderService.processloader = false;
        let userData = JSON.parse(localStorage.getItem('userData'));
        userData.StudentProfileId = response;
        this.toastr.success('Student profile saved successfully!');
        localStorage.setItem('userData', JSON.stringify(userData));
        this.route.navigateByUrl('/student/profile');
      });
    }
  }

  previewChanges() {
    this.studentService.broadCast.next(this.studentProfile);
  }

  onVocalTypeSelection(vocalType) {
    this.studentProfile.VocalType = vocalType;
  }

  onStudentStyleSelection(style) {
    this.studentProfile.VocalStyles = "";
    let index = this.studentProfile.StudentStyles.indexOf(style);
    if (index > -1)
      this.studentProfile.StudentStyles.splice(index, 1);
    else
      this.studentProfile.StudentStyles.push(style);
    if (this.studentProfile.StudentStyles.length > 0) {
      if (this.studentProfile.StudentStyles.length === 1)
        this.studentProfile.VocalStyles = this.studentProfile.StudentStyles[0];
      else {
        this.studentProfile.StudentStyles.forEach(element => {
          if (this.studentProfile.VocalStyles === "")
            this.studentProfile.VocalStyles = element + ',';
          else
            this.studentProfile.VocalStyles = this.studentProfile.VocalStyles + element + ',';
        });
        this.studentProfile.VocalStyles = this.studentProfile.VocalStyles.trim();
        this.studentProfile.VocalStyles = this.studentProfile.VocalStyles.substring(0, this.studentProfile.VocalStyles.length - 1);
      }
    }
  }

  removeOtherStyle() {
    if (this.otherStyleFlag){
      this.studentProfile.OtherStyle = "";
    }
  }

  onGoalSelection(goal) {
    if (this.studentProfile.GoalsForStudy & goal) {
      this.studentProfile.GoalsForStudy &= ~goal;
      if (goal === 1) {
        this.studentService.toneQualityFlag = false;
      } else if (goal === 2) {
        this.studentService.vocalRangeFlag = false;
      } else if (goal === 4) {
        this.studentService.newSkillFlag = false;
      } else if (goal === 8) {
        this.studentService.friendFamilyFlag = false;
      }
    }
    else {
      this.studentProfile.GoalsForStudy |= goal;
      if (goal === 1) {
        this.studentService.toneQualityFlag = true;
      } else if (goal === 2) {
        this.studentService.vocalRangeFlag = true;
      } else if (goal === 4) {
        this.studentService.newSkillFlag = true;
      } else if (goal === 8) {
        this.studentService.friendFamilyFlag = true;
      }
    }
  }

  otherGoalSelection() {
    this.studentService.otherGoalFlag = !this.studentService.otherGoalFlag;
    if (!this.studentService.otherGoalFlag) {
      this.studentProfile.OtherGoalForStudy = "";
    }
  }

  openNewDialog() {
    this.commonService.imageUploadType = "profilePic";
    this.modalService.show(ImageUploadComponent, { initialState, class: 'imageUplodModal' });
  }
}
