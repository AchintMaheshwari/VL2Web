import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScheduleLessonComponent } from './schedule-lesson/schedule-lesson.component';
import { ReviewSelectionComponent } from './review-selection/review-selection.component';
import { SelectDatesComponent } from './select-dates/select-dates.component';
import { SelectDateByMonthModule } from './select-date-by-month/select-date-by-month.module';
import { BookingPaymentComponent } from './booking-payment/booking-payment.component';
import { StripeComponent } from '../stripe/stripe.component';
import { PersonalSettingsComponent } from './personal-settings/personal-settings.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { MaterialModule } from '../material/material.module';
import { NgxMaskModule } from 'ngx-mask'
import { ThankYouComponent } from './thank-you/thank-you.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    SelectDateByMonthModule, OwlDateTimeModule, OwlNativeDateTimeModule, MaterialModule,
    NgxMaskModule.forRoot()
  ],
  declarations: [ScheduleLessonComponent, SelectDatesComponent, ReviewSelectionComponent, BookingPaymentComponent, StripeComponent, PersonalSettingsComponent, ThankYouComponent,],
  exports: [ScheduleLessonComponent, SelectDatesComponent, ReviewSelectionComponent
  ],
})
export class StudentSchedulingModule { }
