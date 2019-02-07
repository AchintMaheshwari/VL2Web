import { Component, OnInit } from '@angular/core';
import { StripeCheckoutLoader, StripeCheckoutHandler } from 'ng-stripe-checkout';
import { LoaderService } from '../../services/loader.service';
import { GuidedvideoService } from '../../services/guidedvideo.service';
import { SchedulingService } from '../../services/Scheduling.Service';
import { CommonService } from '../../common/common.service';
import { VideoSubmissionsModel } from '../../models/videoSubmissions.model';

@Component({
  selector: 'app-gvl-payment',
  templateUrl: './gvl-payment.component.html',
  styleUrls: ['./gvl-payment.component.scss']
})
export class GvlPaymentComponent implements OnInit {
  private stripeCheckoutHandler: StripeCheckoutHandler;
  PaymentAccount: any;
  TransactionData: any;
  Chargedetails: any = {};
  studentId: number = 0;
  amountChargable: any;
  videoSubmissionsModel: VideoSubmissionsModel;

  constructor(private stripeCheckoutLoader: StripeCheckoutLoader, private schedulingService: SchedulingService,
    private loaderService: LoaderService, private guidedvideoService: GuidedvideoService) { }

  ngOnInit() {
    let userData = CommonService.getUser();
    if (userData.IsStudent === 1) {
      this.studentId = userData.Student[0].StudentId;
      this.amountChargable = this.guidedvideoService.Price;
    }
  }

  public ngAfterViewInit() {
    this.stripeCheckoutLoader.createHandler({
      key: 'pk_test_JweiR2MIbJKbu5ZLUQB57wIa',
      image: 'https://vlapp2.azurewebsites.net/assets/images/VL-logo.png',
      token: (token) => {
        // Do something with the token...
        console.log('Payment successful!', token);
      }
    }).then((handler: StripeCheckoutHandler) => {
      this.stripeCheckoutHandler = handler;
    });
  }

  public onClickBuy() {
    // this.amountChargable = amount;
    this.stripeCheckoutHandler.open({
      name: 'voicelessons.com',
      amount: this.amountChargable * 100,
      currency: 'USD',
    }).then((token) => {
      if (token) {
        this.Chargedetails = {
          token: token.id,
          amount: this.amountChargable,
        }
        this.chargeCard();
      }
    }).catch((err) => {
      // Payment failed or was canceled by user...
      if (err !== 'stripe_closed') {
        throw err;
      }
    });
  }

  public onClickCancel() {
    // If the window has been opened, this is how you can close it:
    this.stripeCheckoutHandler.close();
  }

  chargeCard() {
    this.schedulingService.post('/payment/StripePayment', this.Chargedetails, null).subscribe((response: any) => {
      if (response.status === "succeeded") {
        this.initializePaymentAccount(response);
        this.schedulingService.post('/payment/UpsertPaymentAccountData', this.PaymentAccount, null).subscribe((accountResult: any) => {
          this.PaymentAccount = accountResult;
          if (this.guidedvideoService.PaymentTime == 'PayBeforeSubmission') {
            this.initialiseVideoSubmissionData();
            let userId = CommonService.getUser().UserId;
            this.videoSubmissionsModel.UserId = userId;
            this.videoSubmissionsModel.VideoUrl = '';
            this.videoSubmissionsModel.Source='VLAPP';
            this.guidedvideoService.post('/guidedVideo/UpsertGuidedVideoSubmissionByStudent', this.videoSubmissionsModel, null).subscribe((videoSubmissionResult: any) => {
              this.guidedvideoService.videoSubmissionData = videoSubmissionResult.result;
              this.guidedvideoService.videoSubmissionId=this.guidedvideoService.videoSubmissionData.VideoSubmissionId;
              this.initializeTransactionData(response);
              this.schedulingService.post('/payment/UpsertTransactionData', this.TransactionData, null).subscribe((transactionResult: any) => {
                this.loaderService.processloader = false;
                this.guidedvideoService.IsPaid = true;
                this.guidedvideoService.Price = 0;
              });
            });
          }

          else {
            this.initializeTransactionData(response);
            this.schedulingService.post('/payment/UpsertTransactionData', this.TransactionData, null).subscribe((transactionResult: any) => {
              this.loaderService.processloader = false;
              this.guidedvideoService.IsPaid = true;
              this.guidedvideoService.Price = 0;
              if (this.guidedvideoService.PaymentTime == 'PayBeforeSubmission') {
                localStorage.setItem('GVLTransactionId', transactionResult.TransactionId);
              }
            });
          }
        });
      }
    });
  }

  public initialiseVideoSubmissionData() {
    this.videoSubmissionsModel = {
      VideoSubmissionId: 0,
      UserId: 0,
      Source: "VLAPP",
      RawJson: "",
      ExternalUserId: "",
      Name: "",
      Email: "",
      VideoUrl: "",
      Created: new Date(),
      ClaimedCount: 0,
      ReviewedCount: 0,
      Location: "",
      FormattedAddress: "",
      Country: "",
      PostalCode: "",
      IsPaid:true,
      OtherVideoUrl:"",
    }
  }

  initializePaymentAccount(response) {
    this.PaymentAccount = {
      PaymentAccountId: 0,
      StudentUserId: this.studentId,
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
      StudentUserId: this.studentId,
      Amount: this.amountChargable,
      TransactionDate: new Date(),
      TransactionType: JSON.parse(response.StripeResponse.ResponseJson).balance_transaction.type,
      LessonId: null,
      PaymentId: null,
      VideoSubmissionId: this.guidedvideoService.videoSubmissionId,
      FeeId: null,
      EarningId: null,
      PaymentAccountId: this.PaymentAccount.PaymentAccountId,
      StripeCustomerId: '',
      StripeCardId: response.source.Card.id,
      StripeChargeId: response.id,
      StripeTransactionId: response.BalanceTransactionId,
      StripeResponse: response.StripeResponse.ResponseJson,
      IsRefund: 0
    }
  }
}
