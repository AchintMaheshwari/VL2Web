import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentNotReceivedComponent } from './payment-not-received.component';

describe('PaymentNotReceivedComponent', () => {
  let component: PaymentNotReceivedComponent;
  let fixture: ComponentFixture<PaymentNotReceivedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentNotReceivedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentNotReceivedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
