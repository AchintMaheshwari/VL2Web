import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from "ngx-stripe";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CrudService } from '../services/crud.service'
import { LoaderService } from '../services/loader.service';

@Component({
    selector: 'app-stripe',
    templateUrl: './stripe.component.html',
    styleUrls: ['./stripe.component.scss']
})
export class StripeComponent implements OnInit {
    elements: Elements;
    card: StripeElement;
    amount: any;
    headers = null;
    Chargedetails: any = {};
    paymentRefund: any = {};
    elementsOptions: ElementsOptions = {
        locale: 'es',
    };

    stripeform: FormGroup;
    constructor(private fb: FormBuilder, private stripeService: StripeService, private crudService: CrudService,
        private loaderService: LoaderService) {
    }

    ngOnInit() {
        this.stripeform = this.fb.group({
            name: ['', [Validators.required]]
        });
        this.stripeService.elements(this.elementsOptions)
            .subscribe(elements => {
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
                    //  registerElements([this.card], '#card-element');
                }
            });
    }
    getPaymentToken() {
        const name = this.stripeform.get('name').value;
        this.stripeService
            .createToken(this.card, { name })
            .subscribe(token => {
                if (token) {
                    this.chargeCard(token.token.id);
                    // Use the token to create a charge or a customer
                } else if (token.error) {
                    // Error creating the token
                    console.log(token.error.message);
                    this.loaderService.processloader = false;
                }
            });
    }
    chargeCard(token: string) {
        this.loaderService.processloader = true;
        console.log(token);
        this.Chargedetails = {
            token: token,
            amount: 10,
        }
        this.crudService.post('/payment/StripePayment', this.Chargedetails, new HttpParams()).subscribe((response: any) => {
            this.loaderService.processloader = false;
            console.log(response);
        });
    }
    funpaymentRefund() {
        this.paymentRefund
            = {
                chargeID: 'ch_1CufRPBoHD1wIJhCgNnVs2q7',
                amount: 50,
                reason: 'want to cancel Payment'
            }
        this.crudService.post('/payment/SprintRefund', this.paymentRefund, new HttpParams()).subscribe((response: any) => {
            // this.app.processloader=false;
            console.log(response);
        });
    }
}
