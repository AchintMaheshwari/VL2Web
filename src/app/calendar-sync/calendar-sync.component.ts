import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarSyncModel } from '../models/calendarSync.model';
import { CalendarService } from '../services/calendar.service';
import { HttpParams } from '@angular/common/http';
import { CommonService } from '../common/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-calendar-sync',
  templateUrl: './calendar-sync.component.html'
})
export class CalendarSyncComponent implements OnInit {

  teacherId : null;
  teacherCalArray:Array<CalendarSyncModel>=null;
  // for google calendar
  googleSetting:CalendarSyncModel;
  isShowGoogle:boolean=false; 
  // for google calendar

  // for exchange calendar
  exchangeSetting:CalendarSyncModel;
  isShowExchange:boolean;
  // for exchange calendar

  // for Icloud calendar
  iCloudSetting:CalendarSyncModel;
  isShowIcloud:boolean;
  // for Icloud calendar
  constructor(private router: Router, private calendarService:CalendarService,
   public commonService:CommonService,private toastr: ToastrService) {
    // this.googleSetting = this.calendarService.calendarData;     
  }

  
  ngOnInit() : void {
    let userData = JSON.parse(localStorage.getItem('userData'));
    this.teacherId = userData.Teacher[0].TeacherId; 
    this.calendarService.getTeacherCalendarSettings().subscribe(result=>  { 
    this.teacherCalArray =  result;
     // for google calendar
    this.googleSetting= this.teacherCalArray.filter(item=>item.CalendaryType==='google')[0];
    if(this.googleSetting!=null)
    {
    this.isShowGoogle=true;
    }
    else
    {
      this.isShowGoogle=false;
    }
    // for google calendar

    // for exchange calendar
    this.exchangeSetting=this.teacherCalArray.filter(item=>item.CalendaryType==='exchange')[0];
    if(this.exchangeSetting!=null)
    {
      this.isShowExchange=true;
    }
    else{
      this.isShowExchange=false;
    }
    // for exchange calendar

    // for Icloud calendar
    this.iCloudSetting=this.teacherCalArray.filter(item=>item.CalendaryType==='apple')[0];
    if(this.iCloudSetting!=null)
    {
    this.isShowIcloud=true;
    }
    else{
    this.isShowIcloud=false;
    }
    // for Icloud calendar
  });    
}

changeTwoWaySyncSetting(settingFlag, type){
  if(settingFlag)
  {
    if(type == "google")
    {
      if(this.iCloudSetting != undefined && this.iCloudSetting.AddNewAppointments){
      this.toastr.info('We already have this setting for iCloud calendar.');
        setTimeout(() => this.googleSetting.AddNewAppointments=false, 0);
      }
      else if(this.exchangeSetting != undefined && this.exchangeSetting.AddNewAppointments){
      this.toastr.info('We already have this setting for Exchange calendar.');
        setTimeout(() => this.googleSetting.AddNewAppointments=false, 0);
      }
    }
    else if(type == "iCloud")
    {
      if(this.googleSetting != undefined && this.googleSetting.AddNewAppointments){
       this.toastr.info('We already have this setting for Exchange calendar.');
        setTimeout(() => this.iCloudSetting.AddNewAppointments=false, 0);
      }
      else if(this.exchangeSetting != undefined && this.exchangeSetting.AddNewAppointments){
        this.toastr.info('We already have this setting for Exchange calendar.');
        this.iCloudSetting.AddNewAppointments=false;
        setTimeout(() => this.iCloudSetting.AddNewAppointments=false, 0);
      }
    }
    else if(type == "exchange")
    {
      if(this.googleSetting != undefined && this.googleSetting.AddNewAppointments){
       this.toastr.info('We already have this setting for Google calendar.');
        setTimeout(() => this.exchangeSetting.AddNewAppointments=false, 0);
      }
      else if(this.iCloudSetting != undefined && this.iCloudSetting.AddNewAppointments){
       this.toastr.info('We already have this setting for iCloud calendar.');
        setTimeout(() => this.exchangeSetting.AddNewAppointments=false, 0);
      }
    }
  }
}

  changeGoogleReminderSettings()
  {
    this.googleSetting.DoNotSetReminders = true;
    this.googleSetting.ReminderBeforeMinutes=null;
  }

  changeiCloudReminderSettings()
  {
    this.iCloudSetting.DoNotSetReminders = true;
    this.iCloudSetting.ReminderBeforeMinutes=null;
  }

  changeExchangeReminderSettings()
  {
    this.exchangeSetting.DoNotSetReminders = true;
    this.exchangeSetting.ReminderBeforeMinutes=null;
  }

  updateGoogleSetting()
  {
    if(this.googleSetting.ReminderBeforeMinutes!=null && this.googleSetting.ReminderBeforeMinutes>0)
    {
      this.googleSetting.DoNotSetReminders = false;
    }
    this.calendarService.post("/calendar/UpdateCalendarSettingsData", this.googleSetting,new HttpParams()).subscribe((response: any) => {
     this.toastr.success('Google calendar sync settings saved successfully.');
    }); 
  }

  updateiCloudSetting()
  {
    if(this.iCloudSetting.ReminderBeforeMinutes!=null && this.iCloudSetting.ReminderBeforeMinutes>0)
    {
      this.iCloudSetting.DoNotSetReminders = false;
    }
    this.calendarService.post("/calendar/UpdateCalendarSettingsData", this.iCloudSetting,new HttpParams()).subscribe((response: any) => {
      this.toastr.success('iCloud calendar sync settings saved successfully');
    });
  }

  updateExchangeSetting()
  {
    if(this.exchangeSetting.ReminderBeforeMinutes!=null && this.exchangeSetting.ReminderBeforeMinutes>0)
    {
      this.exchangeSetting.DoNotSetReminders = false;
    }
    this.calendarService.post("/calendar/UpdateCalendarSettingsData", this.exchangeSetting,new HttpParams()).subscribe((response: any) => {
    this.toastr.success('Exchange calendar sync settings saved successfully.');
    });
  }
 
  onBack(){
    this.router.navigateByUrl('/teacher/calendar');
  }
}
