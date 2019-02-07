import { Component, OnInit } from '@angular/core';
import { TeacherSettingService } from '../../../services/teacher-setting.service';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-from-student',
  templateUrl: './payment-from-student.component.html',
  styleUrls: ['./payment-from-student.component.scss']
})
export class PaymentFromStudentComponent implements OnInit {
  bookingDates: string[] = [];
  monthNames: any = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  constructor(public settingService: TeacherSettingService, private toastr: ToastrService) { }

  ngOnInit() {
    this.bookingDates = [];
    this.settingService.getCalendarEvents(this.settingService.paymentBreakup.BookingId).subscribe(result => {
      result.forEach(schedule => {
        this.bookingDates.push(this.monthNames[new Date(schedule.EventStartDate).getMonth()] + " " + new Date(schedule.EventStartDate).getDate() + ", " +
          new Date(schedule.EventStartDate).getFullYear());
      });
    });
  }

  hidePaymentBreakup() {
    this.settingService.showPaymentBreakup = false;
  }

  refundAmount(paymentDetails: any) {
    if (paymentDetails.StripeChargeId != "") {
      let paymentRefundData = {
        chargeID: paymentDetails.StripeChargeId,
        amount: paymentDetails.Amount,
        reason: "Refunding the amount"
      }
      this.settingService.post('/payment/StripeRefund', paymentRefundData, new HttpParams).subscribe(result => {
        if (result) {
          var index = this.settingService.paymentHistoryArr.findIndex(p => p.PaymentId == paymentDetails.PaymentId);
          this.settingService.paymentHistoryArr[index].Status = 'refund';
          this.settingService.paymentBreakup.Status = 'refund';
          this.toastr.success("Amount refunded successfully");
        }
        else
          this.toastr.error("Amount refund failed. Please try again.")
      });
    }
  }
}
