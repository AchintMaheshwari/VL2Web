import { Component, OnInit } from '@angular/core';
import { TeacherModule } from '../../teacher.module';
import { TeacherSettingService } from '../../../services/teacher-setting.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit { 
  userData : any;
  searchText:any;
  constructor(public settingService:TeacherSettingService, private route :Router ) { 
   }
  ngOnInit() { 
    this.settingService.showPaymentBreakup = false;
    this.userData = JSON.parse(localStorage.getItem('userData'));
    this.settingService.getPaymentHistory().subscribe(result=>{
      this.settingService.paymentHistoryArr=result;
    });
  }

  showPaymentBreakup(paymentData){
    this.settingService.paymentBreakup = paymentData;
    this.settingService.showPaymentBreakup = true;
  }
}
