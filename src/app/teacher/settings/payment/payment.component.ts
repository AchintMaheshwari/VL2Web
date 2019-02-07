import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../common/common.service';
import { StripeConnectService } from '../../../services/stripe-connect.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  stripeConnected: boolean;
  constructor(private commonServe: CommonService, private stripeConnect: StripeConnectService, private activatedRoute: ActivatedRoute) {
    this.stripeConnected = false;
  }

  ngOnInit() {
    var userData = CommonService.getUser();
    if (userData.Teacher[0].StripeUserId == null) {
      this.activatedRoute.queryParams.subscribe(parms => {
        debugger;
        if (parms.code != undefined) {
          this.stripeConnect.stripeConnecting(parms.code).subscribe(p => {
            this.stripeConnected = true;
          });
        }
      });
    }
    else
      this.stripeConnected = true;
  }
}