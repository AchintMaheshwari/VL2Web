import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { NgbTimeStruct, NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { SchedulingService } from '../../services/Scheduling.Service';
import { Router } from '@angular/router';
import { CommonService } from '../../common/common.service';
import { ToastrService } from 'ngx-toastr';
import { CountryService } from '../../services/country.service';

@Component({
  selector: 'app-personal-settings',
  templateUrl: './personal-settings.component.html',
  styleUrls: ['./personal-settings.component.scss']
})
export class PersonalSettingsComponent implements OnInit {
  @ViewChild('settingForm') form: any;
  timeZones: any;
  userData: any;
  TimeZone: string = "";
  isFormSubmitFlag: boolean = false;
  isFormProcessing: boolean = false;
  countryList:any;
  ISDCode: string;
  CountryId:string="";
  CountryName: string="";
  City:string="";
  ISD:string;

  constructor(private schedulingService: SchedulingService, private route: Router, 
    private toastr: ToastrService,private countryService: CountryService) {
    this.timeZones = CommonService.timeZoneList;
    this.getCountryList();
  }

  ngOnInit() {
    this.schedulingService.isInitialDataLoaded = false;
    this.userData = JSON.parse(localStorage.getItem('userData'));
    if (this.userData.DOB != "") {
      this.userData.DOB = new Date(this.userData.DOB);
    }
    this.TimeZone = this.userData.TimeZone;
    this.City=this.userData.City;
    if (localStorage.getItem('LessonLink') != null) {
      this.schedulingService.get("/setting/GetLessonLinkReferralData", new HttpParams().set('linkId', localStorage.getItem('LessonLink'))).subscribe((response: any) => {
        this.schedulingService.linkData = response;
      });
    }
  }

  updateStudentPersonalInfo() {
    this.isFormSubmitFlag = true;
    if (this.form.valid) {
      if (this.userData.FirstName.trim().toLowerCase() === this.userData.LastName.trim().toLowerCase()) {
        this.toastr.info('First name and Last name should be different!');
      }
      else if (new Date(this.userData.DOB) >= new Date()) {
        this.toastr.error('First name and Last name should be different!');
      }
      else {
        this.isFormProcessing = true;
        if (this.form.touched) {
          this.userData.TimeZone = this.TimeZone;
          this.userData.City=this.City;
          this.schedulingService.post("/user/UpdateUserAccountData", this.userData, new HttpParams()).subscribe((response: any) => {
            localStorage.setItem('userData', JSON.stringify(response));
            this.toastr.success('Account Setting saved successfully!');
            this.route.navigate(['/student/schedule']);
          });
        }
        else {
          this.route.navigate(['/student/schedule']);
        }
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

  getCountryList(){
    this.countryService.getCountryList().subscribe(result => {
      this.countryList = result;
      this.CountryId=this.userData.CountryId;
      this.userData.ISD = '+' + this.countryList.filter(x => x.CountryId == this.userData.CountryId)[0].ISDCode;
      if(this.CountryId=='0')
      this.CountryId="";
    })
  }

  getISDCode(event){
    this.userData.CountryId=event.value;
  /*   if(this.userData.Mobile =='' || this.userData.Mobile==null ||  this.userData.Mobile.length<5){
      this.userData.Mobile='(' + this.countryList.filter(x=>x.CountryId==this.userData.CountryId)[0].ISDCode;
    }  */
    this.userData.ISD = '+' + this.countryList.filter(x => x.CountryId == this.userData.CountryId)[0].ISDCode;
  }

  mobileChange(value){
    if(value ==''){
      this.userData.Mobile='(' + this.countryList.filter(x=>x.CountryId==this.userData.CountryId)[0].ISDCode;
    } 
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
