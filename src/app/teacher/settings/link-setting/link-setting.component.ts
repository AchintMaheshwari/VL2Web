import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { CurrencyPipe } from '@angular/common';
import { TeacherSettingService } from '../../../services/teacher-setting.service';
import { LessonLinksModel } from '../../../models/lessonLinks.model';
import { HttpParams } from '@angular/common/http';
import { RatesModel } from '../../../models/rates.model';
import { SchedulingService } from '../../../services/Scheduling.Service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-link-setting',
  templateUrl: './link-setting.component.html',
  styleUrls: ['./link-setting.component.scss']
})
export class LinkSettingComponent implements OnInit {

  teacherId:number;
  modalRef: BsModalRef;
  links:Array<LessonLinksModel>;
  linkData:LessonLinksModel;
  linkDataLoaded:boolean=false;
  selectedDuration:string;
  selectedBookingType:string;
  selectedLessonType:string;
  referralLinkName:string;
  existingLinkName:string;
  rates:Array<RatesModel>;
  isDefault: number = 0; 
  constructor(private modalService: BsModalService, public settingService:TeacherSettingService,
     private schedulingService:SchedulingService,private toastr: ToastrService) {
    let userData = JSON.parse(localStorage.getItem('userData'));
    this.teacherId = userData.Teacher[0].TeacherId; 
  } 

  ngOnInit() {
    this.linkDataLoaded = false;
    this.settingService.getTeacherLessonLinksData().subscribe(result=>{
      this.links=[];
      this.links=result;
      this.linkDataLoaded=true;
    });
    this.schedulingService.getTeacherLessonRatesData().subscribe(result=>{
      this.rates=[];
      this.rates=result;
    });
  }

  openLinkModal(template: TemplateRef<any>, linkId) {
    if(linkId === 0){
      this.initializeLinkDataModel();
      this.selectedDuration = undefined;
      this.selectedBookingType = undefined;
      this.selectedLessonType = undefined;
      this.referralLinkName = "";
      this.isDefault = 0;
    }
    else{
      this.linkData = this.links.find(i=>i.LessonLinkId === linkId);
      this.selectedDuration = this.linkData.LessonLength.toString()+' Minutes';
      this.selectedBookingType = this.linkData.BookingType;
      this.selectedLessonType = this.linkData.LessonType;
      this.referralLinkName = this.existingLinkName = this.linkData.LinkName;
      this.isDefault = this.linkData.IsDefault;
    }
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'add-new-link' })
    );
  }

  initializeLinkDataModel(){
    this.linkData={ LessonLinkId: 0,
                    TeacherUserId: this.teacherId,
                    LinkGUID:'',
                    LinkName: '',
                    LessonType: '',
                    BookingType: '',
                    LessonLength: 0,
                    LessonPrice: null,
                    CouponId: null,
                    CreatedOn: new Date(Date.now()),
                    ModifiedOn: '',
                    IsDefault : 0
    }
  }

  deleteLessonLink(linkId){
    if(confirm("Are you sure?")){
      this.settingService.post("/setting/DeleteLessonLinkData", null ,new HttpParams().set('linkId', linkId )).subscribe((response: any) => { 
      if(response){
        this.links.splice(this.links.findIndex(i=>i.LessonLinkId === linkId), 1);
        this.toastr.success('Link is deleted successfully.');      
      }
      else{
        this.toastr.warning('Some error occured in deleting the Link. Please try again !');      
      }
    });
    }
  }

  upsertLessonLink(){
    if(this.selectedDuration === undefined){
      this.toastr.info('Please select a duration.');      
    }
    else if(this.selectedBookingType === undefined){
      this.toastr.info('Please select a booking type.');      
    }
    else if(this.selectedLessonType === undefined){
      this.toastr.info('Please select a lesson type.');      
    }
    else if(this.referralLinkName === null || this.referralLinkName === ""){
      this.toastr.info('Please give a name to link.');      
    }
    else{      
      var index = this.links.findIndex(i=>i.LinkName.toLowerCase() === this.referralLinkName.toLowerCase());      
      if(index > -1 && this.linkData.LessonLinkId === 0){
        this.toastr.info('Link Name should be unique.');      
      }
      else{
        this.linkData.LinkName = this.referralLinkName;
        this.linkData.BookingType = this.selectedBookingType;
        this.linkData.LessonType = this.selectedLessonType;
        this.linkData.LessonLength = parseInt(this.selectedDuration.trim().split(' ')[0]);
        this.linkData.LessonPrice = this.rates.find(i=>i.Duration === this.linkData.LessonLength).Price;
        this.linkData.IsDefault = this.isDefault ? 1 : 0;
        this.modalRef.hide();
        this.settingService.post("/setting/UpsertLessonLinkData", 
          this.linkData,new HttpParams()).subscribe((response: any) => { 
          if(response != null || response != undefined){             
            setTimeout(() => this.links = response);
            this.toastr.success('Link saved successfully.');      
          }
          else{
            this.toastr.warning('Some error occured while saving the link. Please try again !');      
          }
        });
      }
    }
  }

  linkCopiedMessage(){
    this.toastr.success('Link copied to clipboard');      
  }

}
