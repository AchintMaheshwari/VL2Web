import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { StudentProfileEditComponent } from './student-profile-edit/student-profile-edit.component';
import { StudentProfileComponent } from './profile/profile.component';
import { StudentDashboardComponent } from './dashboard/student-dashboard/student-dashboard.component';
import { AllowOnlyNumber } from '../directives/allowonlynumber.directive';
import { StudentSettingsMenuComponent } from './settings/student-settings-menu/student-settings-menu.component';
import { PersonalInfoComponent } from './settings/personal-info/personal-info.component';
import { PersonalInfoSettingComponent } from './settings/personal-info-setting/personal-info-setting.component';
import { BsDatepickerModule, TooltipModule, ModalModule, BsModalService, AccordionModule, BsDropdownModule } from 'ngx-bootstrap';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { TeacherIndexComponent } from './index/teacher-index/teacher-index.component';
import { StarRatingModule } from 'angular-star-rating';
import { MaterialModule } from '../material/material.module';
import { StudentListingComponent } from './student-listing/student-listing.component';
import { AddStudentComponent } from './add-student/add-student.component';
import { NgxMaskModule } from 'ngx-mask'
import { StudentLessonModule } from './student-lesson-module/student-lesson-module.module';
import { RateTeacherDialogComponent } from './rate-teacher-dialog/rate-teacher-dialog.component';
import { GuidedVideoFeedbackComponent } from './guided-video-feedback/guided-video-feedback.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ShareButtonModule } from '@ngx-share/button';
import { HttpClientModule } from '../../../node_modules/@angular/common/http';
import { ClipboardModule } from 'ngx-clipboard';


@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule ,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule,
    BsDropdownModule.forRoot(),
    AccordionModule.forRoot(),
    OwlDateTimeModule, OwlNativeDateTimeModule,
    StarRatingModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    MaterialModule,
    StudentLessonModule,
    NgxMaskModule.forRoot(),
    ShareButtonModule.forRoot(),
    FontAwesomeModule,
    ClipboardModule,
  ],
  declarations: [AllowOnlyNumber, StudentProfileEditComponent, StudentProfileComponent, StudentDashboardComponent, StudentSettingsMenuComponent,
    PersonalInfoComponent, PersonalInfoSettingComponent, TeacherIndexComponent, StudentListingComponent, AddStudentComponent, QuestionnaireComponent,
    RateTeacherDialogComponent,
    GuidedVideoFeedbackComponent],
  exports: [AllowOnlyNumber, StudentProfileEditComponent, NgxMaskModule],
  providers: [
    BsModalService,
  ],
  entryComponents: [RateTeacherDialogComponent]
})
export class StudentModule { }
