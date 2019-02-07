import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { SchedulingService } from '../../../services/Scheduling.Service';
import { RatesModel } from '../../../models/rates.model';
import { HttpParams } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { TeacherSettingService } from '../../../services/teacher-setting.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rate-setting',
  templateUrl: './rate-setting.component.html',
  styleUrls: ['./rate-setting.component.scss']
})

export class RateSettingComponent implements OnInit {
  modalRef: BsModalRef;
  rates: Array<RatesModel>;
  rateData: RatesModel;
  ratesDataLoaded: boolean = false;
  teacherId: number;
  selectedDuration: string;
  priceValue: number;
  isDurationDisabled: boolean = false;
  constructor(private modalService: BsModalService, private schedulingService: SchedulingService,
    public settingService: TeacherSettingService, private toastr: ToastrService) {
    let userData = JSON.parse(localStorage.getItem('userData'));
    this.teacherId = userData.Teacher[0].TeacherId;
  }

  ngOnInit() {
    this.ratesDataLoaded = false;
    this.schedulingService.getTeacherLessonRatesData().subscribe(result => {
      this.rates = [];
      this.rates = result;
      this.ratesDataLoaded = true;
    });
  }

  initializeRateDataModel() {
    this.rateData = {
      RateId: 0,
      TeacherUserId: this.teacherId,
      Duration: 0,
      Price: null,
      CreatedOn: new Date(Date.now()),
      ModifiedOn: ''
    }
  }

  openRatesModel(template: TemplateRef<any>, rateId) {
    if (rateId === 0) {
      this.initializeRateDataModel();
      this.selectedDuration = undefined;
      this.priceValue = null;
      this.isDurationDisabled = false;
    }
    else {
      this.rateData = this.rates.find(i => i.RateId === rateId);
      this.selectedDuration = this.rateData.Duration.toString() + ' Minutes';
      this.priceValue = this.rateData.Price;
      this.isDurationDisabled = true;
    }
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'addNewLesson' })
    );
  }

  upsertRates() {
    if (this.selectedDuration === undefined) {
      this.toastr.info('Please select a duration.');
    }
    else if (this.priceValue === null || this.priceValue.toString() === "") {
      this.toastr.info('Please specify some price.');
    }
    else if (this.priceValue < 5) {
      this.toastr.info('Minimum price for a lesson is $5 !');
    }
    else {
      this.modalRef.hide();
      this.rateData.Duration = parseInt(this.selectedDuration.trim().split(' ')[0]);
      var index = this.rates.findIndex(i => i.Duration === this.rateData.Duration);
      if (index > -1) {
        this.rateData = this.rates[index];
      }
      this.rateData.Price = this.priceValue;
      this.schedulingService.post("/setting/UpsertRatesData",
        this.rateData, new HttpParams()).subscribe((response: any) => {
          if (response != null || response != undefined) {
            if (index === -1) {
              this.rates.push(response);
            }
            else {
              this.rates[index] = response;
            }
            this.toastr.success('Rate saved successfully.');
          }
          else {
            this.toastr.warning('Some error occured while saving the rate. Please try again !');
          }
        });
    }
  }

  deleteRates(rateId) {
    if (confirm("Are you sure?")) {
      this.schedulingService.post("/setting/DeleteRatesData", null, new HttpParams().set('rateId', rateId)).subscribe((response: any) => {
        if (response) {
          this.rates.splice(this.rates.findIndex(i => i.RateId === rateId), 1);
          this.toastr.success('Rate is deleted !');
        }
        else {
          this.toastr.warning('Some error occured in deleting the rate. Please try again !');
        }
      });
    }
  }
}
