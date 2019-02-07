import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../common/common.service';
import { ActivatedRoute } from '@angular/router';
import { StripeConnectService } from '../../../services/stripe-connect.service';

@Component({
  selector: 'app-stripe-connecting',
  templateUrl: './stripe-connecting.component.html',
  styleUrls: ['./stripe-connecting.component.scss']
})

export class StripeConnectingComponent implements OnInit {

  constructor(public commonServe : CommonService){}
  ngOnInit() {}
}
