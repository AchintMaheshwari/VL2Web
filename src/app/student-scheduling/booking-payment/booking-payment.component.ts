import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from "ngx-stripe";
import { HttpParams } from '@angular/common/http';
import { SchedulingService } from '../../services/Scheduling.Service';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-booking-payment',
  templateUrl: './booking-payment.component.html',
  styleUrls: ['./booking-payment.component.scss']
})
export class BookingPaymentComponent implements OnInit {
  elements: Elements;
  card: StripeElement;
  amount: any;
  headers = null;
  Chargedetails: any = {};
  PaymentAccount: any;
  TransactionData: any;
  isPaymentDone: boolean = false;
  elementsOptions: ElementsOptions = {
    locale: 'auto',
  };

  stripeform: FormGroup;
  constructor(private _location: Location, private fb: FormBuilder, private stripeService: StripeService,
    public schedulingService: SchedulingService, private toastr: ToastrService, private loaderService: LoaderService) {
    this.loaderService.processloader = false;
  }

  ngOnInit() {
    this.stripeform = this.fb.group({
      name: ['', [Validators.required]]
    });
    this.stripeService.elements(this.elementsOptions).subscribe(elements => {
      this.elements = elements;
      // Only mount the element the first time
      if (!this.card) {
        this.card = this.elements.create('card', {
          iconStyle: 'solid',

          style: {
            base: {
              iconColor: '#dfbfe4',
              color: '#fff',
              fontWeight: 500,
              fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
              fontSize: '16px',
              fontSmoothing: 'antialiased',
              ':-webkit-autofill': {
                color: '#fff',
              },
              '::placeholder': {
                color: '#fff',
              },
            },
            invalid: {
              iconColor: '#FFC7EE',
              color: '#ff159b',
            },
          },
        });
        this.card.mount('#card-element');
      }
    });
  }

  onBack() {
    this._location.back();
  }

  getPaymentToken() {
    this.loaderService.processloader = true;
    const name = this.stripeform.get('name').value;
    this.stripeService.createToken(this.card, { name }).subscribe(token => {
      if (token.token) {
        this.Chargedetails = {
          token: token.token.id,
          amount: this.schedulingService.lessonPayableAmount,
        }
        this.chargeCard();
        // Use the token to create a charge or a customer
      } else if (token.error) {
        // Error creating the token
        console.log(token.error.message);
        this.toastr.warning('Please enter valid card details.');
        this.loaderService.processloader = false;
      }
    });
  }

  chargeCard() {
    this.schedulingService.post('/payment/StripePayment', this.Chargedetails, new HttpParams()).subscribe((response: any) => {
      this.schedulingService.Payment.Status = response.status;
      this.initializePaymentAccount(response);
      this.schedulingService.post('/payment/UpsertScheduleLessonPaymentData', this.schedulingService.Payment, new HttpParams()).subscribe((paymentResult: any) => {
        this.schedulingService.Payment = paymentResult;
        this.schedulingService.post('/payment/UpsertPaymentAccountData', this.PaymentAccount, new HttpParams()).subscribe((accountResult: any) => {
          this.PaymentAccount = accountResult;
          this.initializeTransactionData(response);
          this.schedulingService.post('/payment/UpsertTransactionData', this.TransactionData, new HttpParams()).subscribe((transactionResult: any) => {
            this.loaderService.processloader = false;
            this.isPaymentDone = true;
          });
        });
      });
    });
  }

  initializePaymentAccount(response) {
    this.PaymentAccount = {
      PaymentAccountId: 0,
      StudentUserId: this.schedulingService.Payment.StudentUserId,
      Last4Digits: response.source.Card.last4,
      ExpirationMonth: response.source.Card.exp_month,
      ExpirationYear: response.source.Card.exp_year,
      RoutingNumber: null,
      AccountNumber: response.source.Account,
      PaymentAccountType: response.source.Type,
      StripeToken: this.Chargedetails.token,
      IsDeleted: 0

    }
  }

  initializeTransactionData(response) {
    this.TransactionData = {
      TransactionId: 0,
      StudentUserId: this.schedulingService.Payment.StudentUserId,
      Amount: this.schedulingService.lessonPayableAmount,
      TransactionDate: new Date(),
      TransactionType: JSON.parse(response.StripeResponse.ResponseJson).balance_transaction.type,
      LessonId: null,
      PaymentId: this.schedulingService.Payment.PaymentId,
      FeeId: null,
      EarningId: null,
      PaymentAccountId: this.PaymentAccount.PaymentAccountId,
      VideoSubmissionId: null,
      StripeCustomerId: '',
      StripeCardId: response.source.Card.id,
      StripeChargeId: response.id,
      StripeTransactionId: response.BalanceTransactionId,
      StripeResponse: response.StripeResponse.ResponseJson,
      IsRefund: false,
    }
  }
}