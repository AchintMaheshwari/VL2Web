import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { TeacherService } from '../../services/teacher.service';
import { TeacherProfileModel } from '../../models/teacherProfile.model';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { TeacherQualificationModel } from '../../models/teacherQualification.model';
import { SharedModule } from '../../shared/shared.module';
import { CommonService } from '../../common/common.service';
import { ImageUploadComponent } from '../../image-upload/image-upload.component';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap';
import { initialState } from 'ngx-bootstrap/timepicker/reducer/timepicker.reducer';

@Component({
  selector: 'app-teacher-profile-edit',
  templateUrl: './teacher-profile-edit.component.html',
  styleUrls: ['./teacher-profile-edit.component.scss']
})

export class TeacherProfileEditComponent implements OnInit {

  objImageUrl: string;
  @ViewChild('teacherForm') form: any;

  teacherProfileId: number = 4;
  teacherProfile: TeacherProfileModel;
  introLength: number = 200;
  shortIntroLength: number = 200;
  isPersonalizedURLNew: boolean = false;
  isAgeRangeInvalid: boolean = false;
  isHTMLTagPresent: boolean = false;
  vocalTypes: Array<{ type: string }>;
  isFormSubmitFlag: boolean = false;
  isFullNameFlag: boolean = false;
  isStudioFlag: boolean = false;
  isShortIntroFlag: boolean = false;
  isURLFlag: boolean = false;
  isFormProcessing: boolean = false;
  isValid: boolean = true;
  userId: number;
  profileStatusId: string;
  constructor(private teacherService: TeacherService, public commonService: CommonService, private route: Router, private sharedModule: SharedModule,
    public modalService: BsModalService, public viewRef: ViewContainerRef, private toastr: ToastrService) {
    this.teacherProfile = this.teacherService.teacherProfileData;
    this.vocalTypes = this.sharedModule.vocalTypes;
  }

  ngOnInit() {
    var userData = JSON.parse(localStorage.getItem('userData'));
    if (this.commonService.userProfilePic != null && this.commonService.userProfilePic != ""
      && this.commonService.userProfilePic != undefined && this.commonService.userProfilePic != "null")
      this.commonService.isDefaultImageFlag = false;
    if (userData == null) {
      this.route.navigateByUrl('');
    } else {
      this.userId = userData.UserId;
      this.profileStatusId = userData.TeacherProfileStatusId;
      this.getTeacherProfileData();
    }
  }

  changeRemainingCharacterLengthAndCheckTags(shortIntro) {
    this.shortIntroLength = this.introLength - shortIntro;
    if (this.shortIntroLength < 200) {
      let reg = /<(.|\n)*?>/g;
      if (reg.test(this.teacherProfile.ShortIntroduction) == true) {
        this.isHTMLTagPresent = true;
      }
      else {
        this.isHTMLTagPresent = false;
      }
    }
  }

  previewChanges() {
    this.commonService.isStudentUser = false;
    this.teacherService.broadCast.next(this.teacherProfile);
  }

  addQualification() {
    let qualification: TeacherQualificationModel = {
      TeacherQualificationId: 0,
      TeacherProfileId: this.teacherProfile.TeacherProfileId,
      Date: null,
      Description: null,
      UserId: this.userId,
      Created: new Date(),
      Modified: new Date()
    };
    this.teacherProfile.TeacherQualifications.push(qualification);
  }

  saveOrUpdateTeacherProfile(): void {
    this.isFormSubmitFlag = true;
    if ((this.teacherProfile.PersonalizedUrl != '') && (this.teacherProfile.PersonalizedUrl === this.teacherService.personalizedURL)) {
      this.isPersonalizedURLNew = true;
    }
    if (this.form.valid && !(this.isHTMLTagPresent && this.isAgeRangeInvalid) &&
      this.isPersonalizedURLNew) {
      this.isFormProcessing = true;
      this.teacherService.personalizedURL = this.teacherProfile.PersonalizedUrl;
      this.teacherProfile.UserId = this.userId;
      this.teacherService.post("/tProfile/SaveTeacherProfileData", this.teacherProfile,
        new HttpParams().set('profileStatusId', this.profileStatusId)).subscribe((response: any) => {
          let userData = JSON.parse(localStorage.getItem('userData'));
          userData.TeacherProfileId = response;
          this.toastr.success('Published successfully!');
          localStorage.setItem('userData', JSON.stringify(userData));
          this.route.navigateByUrl('/teacher/profile');
        });
    }
  }

  private getTeacherProfileData() {
    this.teacherService.getTeacherProfile().then((response: any) => {
      this.teacherService.broadCast.subscribe(data => {
        this.teacherProfile = data;
        this.shortIntroLength = this.introLength - data.ShortIntroduction.length;
        if (data.TeacherQualifications.length === 0) {
          this.addQualification();
        }
      });
    });
  }

  checkUrlAvailability() {
    if (this.teacherProfile.PersonalizedUrl != '') {
      if (this.teacherProfile.PersonalizedUrl != this.teacherService.personalizedURL) {
        this.teacherService.get("/tProfile/CheckPersonalizedUrlAvailability",
          new HttpParams().set('url', this.teacherProfile.PersonalizedUrl)).subscribe((response: any) => {
            this.isPersonalizedURLNew = response;
          });
      } else {
        this.isPersonalizedURLNew = true;
      }
    } else {
      this.isPersonalizedURLNew = false;
    }
  }
  validateAge() {
    if (this.teacherProfile.AcceptingAgeLow != null && Number(this.teacherProfile.AcceptingAgeLow) >= 0
      && this.teacherProfile.AcceptingAgeHigh != null && Number(this.teacherProfile.AcceptingAgeHigh) >= 0) {
      if (Number(this.teacherProfile.AcceptingAgeLow) > Number(this.teacherProfile.AcceptingAgeHigh)) {
        this.isAgeRangeInvalid = true;
      } else {
        this.isAgeRangeInvalid = false;
      }
    } else {
      this.isAgeRangeInvalid = false;
    }
  }
  
  clickEvent() {
  }

  openNewDialog() {
    this.commonService.imageUploadType = "profilePic"; 
    this.modalService.show(ImageUploadComponent, { initialState, class: 'imageUplodModal' });
  }
}
