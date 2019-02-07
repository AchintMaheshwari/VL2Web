import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { TeacherModule } from './teacher/teacher.module';
import { StudentModule } from './student/student.module';
import { TeacherService } from './services/teacher.service';
import { StudentService } from './services/student.service';
import { CommonService } from './common/common.service';
import { CrudService } from './services/crud.service';
import { FormsModule } from '@angular/forms';
import { UserService } from './services/user.service';
import { TeacherSettingService } from './services/teacher-setting.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CalendarService } from './services/calendar.service';
import { StudentSchedulingModule } from './student-scheduling/studentscheduling.module';
import { SchedulingService } from './services/Scheduling.Service';
import { BsDropdownModule, TabsModule, CollapseModule } from 'ngx-bootstrap';
import * as $ from 'jquery';
import { NgxStripeModule } from 'ngx-stripe';
import { LoginComponent } from './login/login.component';
import { ImageCropperModule } from 'ng2-img-cropper';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { DndModule } from 'ng2-dnd';
import { SharedlibraryService } from './services/sharedlibrary.service';
import { RateTeacherService } from './services/rate-teacher.service';
import {
    AuthService,
    SocialLoginModule,
    AuthServiceConfig,
    GoogleLoginProvider,
    FacebookLoginProvider,
    LinkedinLoginProvider,
} from "angular5-social-login";
import { Oauth2callbackComponent } from './oauth2callback/oauth2callback.component';
import { OwlModule } from 'angular-owl-carousel';
import { MalihuScrollbarService, MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { MaterialModule } from './material/material.module';
import { NotFoundComponent } from './not-found/not-found.component';
import { SongsService } from './services/song.service';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NoBrowserComponent } from './no-browser/no-browser.component';
import { ExerciseLibraryService } from './services/exercise-library.service'
import { NgxUploaderModule } from 'ngx-uploader';
import { BlobModule } from 'angular-azure-blob-service';
import { AddStudentDialogComponent } from './teacher/exercise-library/lesson-library/add-student-dialog/add-student-dialog.component';
import { LessonsService } from './services/lessons.service';
import { AddStudentModalDialogComponent } from './add-student-modal-dialog/add-student-modal-dialog.component';
import { MediaFileUploadService } from './services/media-file-upload.service';
import { DragLessonDialogComponent } from './teacher/drag-lesson-dialog/drag-lesson-dialog.component';
import { ConfirmDeleteLessonComponent } from './teacher/confirm-delete-lesson/confirm-delete-lesson.component';
import { UserRoleSelectionComponent } from './user-role-selection/user-role-selection.component';
import { CountryService } from './services/country.service';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { ConfirmDeleteExcerciseComponent } from './teacher/confirm-delete-excercise/confirm-delete-excercise.component';
import { ConfirmDeleteSongComponent } from './teacher/confirm-delete-song/confirm-delete-song.component';
import { LoaderService } from './services/loader.service';
import { AdvancedSearchDialogComponent } from './advanced-search-dialog/advanced-search-dialog.component';
import { GuidedvideoService } from './services/guidedvideo.service';
import { StripeCheckoutModule } from 'ng-stripe-checkout';
import { RecordVideoComponent } from './teacher/lessonplanner/add-video-feedback/record-video/record-video.component';
import { ConfirmVideoChangeComponent } from './teacher/lessonplanner/add-video-feedback/confirm-video-change/confirm-video-change.component';
import { VideoSubmissionCompleteComponent } from './teacher/lessonplanner/add-video-feedback/video-submission-complete/video-submission-complete.component';
import { VideoService } from './services/video.service';
import { AssignExistingLessonComponent } from './assign-existing-lesson/assign-existing-lesson.component';
import { FilterLessonPipe } from './filter/filter-lesson.pipe';
import { UserTermOfServiceComponent } from './user-term-of-service/user-term-of-service.component';
import { QuestionnaireService } from './services/questionnaire.service';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmDeleteVideoComponent } from './teacher/confirm-delete-video/confirm-delete-video.component';
import { NgChatModule } from './ng-chat/ng-chat.module';
import { VlauthGuardServiceService } from './services/vlauth-guard-service.service';
import { TwitterService } from './services/twitter.service';
import { ShareComponent } from './teacher/share/share.component';
import { BackGaurdService } from './services/back-gaurd.service';
import { PlaylistService } from './services/playlist.service';
import {ProgressBarModule} from "angular-progress-bar"

const config = new AuthServiceConfig([
    {
        id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider('720081367695-0pjsbd4cdq48npsl4iuqptmlura6bgde.apps.googleusercontent.com')
    },
    {
        id: FacebookLoginProvider.PROVIDER_ID,
        provider: new FacebookLoginProvider('511195319232188')
    },
    {
        id: LinkedinLoginProvider.PROVIDER_ID,
        provider: new LinkedinLoginProvider("86glkk3tc3v48l")
    }
]);

export function provideConfig() {
    return config;
}

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        ImageUploadComponent,
        Oauth2callbackComponent,
        NotFoundComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        NoBrowserComponent,
        AddStudentModalDialogComponent,
        UserRoleSelectionComponent,
        ConfirmEmailComponent,
        AdvancedSearchDialogComponent,
        RecordVideoComponent,
        ConfirmVideoChangeComponent,
        VideoSubmissionCompleteComponent,
        AssignExistingLessonComponent,
        FilterLessonPipe,
        UserTermOfServiceComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        SharedModule,
        CoreModule,
        TeacherModule,
        StudentModule,
        AppRoutingModule,
        StudentSchedulingModule,
        BsDropdownModule.forRoot(),
        NgxStripeModule.forRoot('pk_test_JweiR2MIbJKbu5ZLUQB57wIa'),
        ImageCropperModule,
        TabsModule.forRoot(),
        NgChatModule,
        SocialLoginModule,
        OwlModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        MaterialModule,
        DndModule.forRoot(),
        NgxUploaderModule, BlobModule.forRoot(),
        CollapseModule.forRoot(),
        MalihuScrollbarModule.forRoot(),
        StripeCheckoutModule,
    ProgressBarModule
    ],
    exports: [DndModule],
    bootstrap: [AppComponent],
    providers: [TeacherService, TeacherSettingService, CommonService, CrudService, StudentService, UserService,
        CalendarService, SchedulingService, AuthService, MalihuScrollbarService, SongsService, ExerciseLibraryService, SharedlibraryService,
        LessonsService, MediaFileUploadService, CountryService, LoaderService, GuidedvideoService, RateTeacherService,
        QuestionnaireService, VideoService, CookieService, PlaylistService,
        {
            provide: AuthServiceConfig,
            useFactory: provideConfig
        },
        VlauthGuardServiceService,
        BackGaurdService,
        TwitterService,
    ],
    entryComponents: [AdvancedSearchDialogComponent, ImageUploadComponent, AddStudentModalDialogComponent,
        AddStudentDialogComponent, DragLessonDialogComponent, ConfirmDeleteSongComponent, ConfirmDeleteLessonComponent,
        UserRoleSelectionComponent, ConfirmDeleteExcerciseComponent, RecordVideoComponent, ConfirmVideoChangeComponent,
        AssignExistingLessonComponent, ConfirmDeleteVideoComponent, ShareComponent],
})
export class AppModule { }

