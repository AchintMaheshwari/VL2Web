import { Component, OnInit, NgModule, ViewChild } from '@angular/core';
import { TeacherService } from '../../../services/teacher.service';
import { HttpParams } from '@angular/common/http';
import { NgbTimeStruct, NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { CommonService } from '../../../common/common.service';
import { ToastrService } from 'ngx-toastr';
import { CountryService } from '../../../services/country.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-personal-settings',
  templateUrl: './personal-settings.component.html',
  styleUrls: ['./personal-settings.component.scss']
})
export class PersonalSettingsComponent implements OnInit {

  @ViewChild('settingForm') form: any;
  userData: any;
  isFormSubmitFlag: boolean = false;
  isFormProcessing: boolean = false;
  timeZones: any;
  TimeZone: string = "";
  countryList: any;
  ISDCode: string;
  CountryId: string = "";
  CountryName: string = "";
  City: string = "";
  ISD: string;

  @ViewChild('passwordForm') formPassword: any;
  password: string;
  repeatPassword: string;
  isRPSubmitFlag: boolean = false;
  isRPProcessing: boolean = false;
  isPwdMismatch: boolean = false;
  pwdType: string = "password";
  rptPwdType: string = "password";
  exisitingpassword: string = "password";
  isVisiblePswd: boolean = false;

  constructor(private teacherService: TeacherService, private toastr: ToastrService,private countryService: CountryService,
    private userService: UserService) {
    this.timeZones = CommonService.timeZoneList;
    this.getCountryList();
  }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('userData'));
    if (this.userData.DOB != "") {
      this.userData.DOB = new Date(this.userData.DOB);
    }
    if (this.userData.UserGUID.includes('auth2')) {
      this.isVisiblePswd = true;
    }
    this.TimeZone = this.userData.TimeZone;
  }

  updateTeacherAccountSetings() {
    this.isFormSubmitFlag = true;
    if (this.form.valid) {
      if (this.userData.FirstName.trim().toLowerCase() === this.userData.LastName.trim().toLowerCase()) {
        this.toastr.info('First name and Last name should be different');
      }
      else if (new Date(this.userData.DOB) >= new Date()) {
        this.toastr.warning('DOB cannot be a future date');
      }
      else {
        this.isFormProcessing = true;
        this.userData.TimeZone = this.TimeZone;
        this.teacherService.post("/user/UpdateUserAccountData", this.userData, new HttpParams()).subscribe((response: any) => {
            localStorage.setItem('userData', JSON.stringify(response));
            CommonService.userZone = response.TimeZone;
            this.toastr.success('Account Setting saved successfully!');
            this.isFormProcessing = false;
          });
      }
    }
  }

  OnTimeZoneChange() {
    if (this.userData.TimeZone != "") {
      if (confirm("Are you sure ?")) {
        this.userData.TimeZone = this.TimeZone;
      }
      else {
        setTimeout(() => this.TimeZone = this.userData.TimeZone, 0);
      }
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  getCountryList() {
    this.countryService.getCountryList().subscribe(result => {
      this.countryList = result;
      this.CountryId = this.userData.CountryId;
      this.userData.ISD = '+' + this.countryList.filter(x => x.CountryId == this.userData.CountryId)[0].ISDCode;
      if (this.CountryId == '0')
        this.CountryId = "";
    })
  }

  getISDCode(event) {
    this.userData.CountryId = event.value;
    this.userData.ISD = '+' + this.countryList.filter(x => x.CountryId == this.userData.CountryId)[0].ISDCode;
  }

  verifyPassword() {
    this.isPwdMismatch = false;
    if (this.password === "") {
      this.pwdType = "password";
    }
    if (this.repeatPassword === "") {
      this.rptPwdType = "password";
    }
    if (this.password != "" && this.repeatPassword != "" && this.password != this.repeatPassword) {
      this.isPwdMismatch = true;
    }
    else {
      this.isPwdMismatch = false;
    }
  }

  showPassword(type) {
    if (this.password != "") {
      if (type === "password") {
        this.pwdType = "text";
      }
      else {
        this.pwdType = "password";
      }
    }
  }

  showRptPassword(type) {
    if (this.repeatPassword != "") {
      if (type === "password") {
        this.rptPwdType = "text";
      }
      else {
        this.rptPwdType = "password";
      }
    }
  }

  resetPassword() {
    if (!this.isPwdMismatch) {
      this.isRPSubmitFlag = true;
      if (this.formPassword.valid) {
        this.isRPProcessing = true;
        this.userService.get('/user/CheckPassword', new HttpParams().set('userGuid', this.userData.UserGUID).set("password", this.exisitingpassword))
          .subscribe((response: any) => {
            if (response) {
              this.userService.post('/user/ResetPassword', null, new HttpParams().set('userGuid', this.userData.UserGUID).
                set("password", this.password)).subscribe((response: any) => {
                  this.toastr.success("Password reset successfully.").onHidden;
                  this.formPassword.reset();
                })
            }
            else {
              this.toastr.error("Existing password not found in records!!");
            }
            this.isRPSubmitFlag = false;
            this.isRPProcessing = false;
          })
      }
    }
  }
}
