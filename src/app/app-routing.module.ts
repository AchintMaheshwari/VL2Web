import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './core/home/home.component';
import { TeacherProfileEditComponent } from './teacher/teacher-profile-edit/teacher-profile-edit.component';
import { StudentProfileEditComponent } from './student/student-profile-edit/student-profile-edit.component';
import { StudentProfileComponent } from './student/profile/profile.component';
import { TeacherProfileComponent } from './teacher/profile/profile.component';
import { StudentDashboardComponent } from './student/dashboard/student-dashboard/student-dashboard.component';
import { TeacherDashboardComponent } from './teacher/dashboard/teacher-dashboard/teacher-dashboard.component';
import { CalendarSyncComponent } from './calendar-sync/calendar-sync.component';
import { BrowserModule } from '@angular/platform-browser';
import { ScheduleLessonComponent } from './student-scheduling/schedule-lesson/schedule-lesson.component';
import { SelectDatesComponent } from './student-scheduling/select-dates/select-dates.component';
import { ReviewSelectionComponent } from './student-scheduling/review-selection/review-selection.component';
import { SelectDateByMonthComponent } from './student-scheduling/select-date-by-month/select-date-by-month.component';
import { TeacherCalendar } from './teacher/teacherCalendar/teacherCalendar';
import { AccountSettingsComponent } from './teacher/settings/account-settings/account-settings.component';
import { RatesComponent } from './teacher/settings/rates/rates.component';
import { LinksComponent } from './teacher/settings/links/links.component';
import { PaymentComponent } from './teacher/settings/payment/payment.component';
import { PersonalInfoComponent } from './student/settings/personal-info/personal-info.component';
import { BookingPaymentComponent } from './student-scheduling/booking-payment/booking-payment.component';
import { LoginComponent } from './login/login.component';
import { PersonalSettingsComponent } from './student-scheduling/personal-settings/personal-settings.component';
import { Oauth2callbackComponent } from './oauth2callback/oauth2callback.component';
import { LobbyComponent } from './teacher/lobby/lobby.component';
import { TeacherIndexComponent } from './student/index/teacher-index/teacher-index.component';
import { StudentListingComponent } from './student/student-listing/student-listing.component';
import { LessonplannerComponent } from './teacher/lessonplanner/lessonplanner.component';
import { LibraryComponent } from './teacher/lessonplanner/library/library.component';
import { EditExiistingSongComponent } from './teacher/lessonplanner/edit-exiisting-song/edit-exiisting-song.component';
import { ExerciseLibraryComponent } from './teacher/exercise-library/exercise-library.component';
import { SongLibraryComponent } from './teacher/exercise-library/song-library/song-library.component';
import { LessonLibraryComponent } from './teacher/exercise-library/lesson-library/lesson-library.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ConnectedComponent } from './teacher/lobby/connected/connected.component';
import { NoBrowserComponent } from './no-browser/no-browser.component';
import { AddStudentComponent } from './student/add-student/add-student.component';
import { TeacherListingComponent } from './teacher/teacher-listing/teacher-listing.component';
import { HistoryComponent } from './student/student-lesson-module/history/history.component';
import { UserRoleSelectionComponent } from './user-role-selection/user-role-selection.component';
import { ExerciseComponent } from './teacher/lessonplanner/exercise/exercise.component';
import { SongComponent } from './teacher/lessonplanner/song/song.component';
import { GuidedvideoComponent } from './teacher/guidedvideo/guidedvideo.component';
import { GuidedvideoLessonPlannerComponent } from './teacher/guidedvideo/guidedvideo-lesson-planner/guidedvideo-lesson-planner.component';
import { HistoryAccordionComponent } from './student/student-lesson-module/history/history-accordion/history-accordion.component';
import { MobileLessonPlayerComponent } from './teacher/mobile-lessonplayer/mobile-lessonplayer.component';
import { MobileLobbyComponent } from './teacher/mobile-lobby/mobile-lobby.component';
import { GuidedVideoFeedbackComponent } from './student/guided-video-feedback/guided-video-feedback.component';
import { MobileFavoritesComponent } from './student/student-lesson-module/history/mobile-favorites/mobile-favorites.component';
import { AddVideoFeedbackComponent } from './teacher/lessonplanner/add-video-feedback/add-video-feedback.component';
import { VideoComponent } from './teacher/lessonplanner/video/video.component';
import { FeedbackCompletedComponent } from './teacher/guidedvideo/feedback-completed/feedback-completed.component';
import { GuidedVideoPlayerComponent } from './teacher/guided-video-player/guided-video-player.component';
import { VideoSubmissionCompleteComponent } from './teacher/lessonplanner/add-video-feedback/video-submission-complete/video-submission-complete.component';
import { UserTermOfServiceComponent } from './user-term-of-service/user-term-of-service.component';
import { QuestionnaireComponent } from './student/questionnaire/questionnaire.component';
import { ModuleItrBuilderComponent } from './teacher/module-itr-builder/module-itr-builder.component';
import { VideoLibraryComponent } from './teacher/exercise-library/video-library/video-library.component';
import { VlauthGuardServiceService } from './services/vlauth-guard-service.service';
import { GvlPaymentComponent } from './teacher/gvl-payment/gvl-payment.component';
import { MobileGuidedVideoPlayerComponent } from './teacher/mobile-guided-video-player/mobile-guided-video-player.component';
import { PlaylistComponent } from './teacher/playlist/playlist.component';
import { ThankYouComponent } from './student-scheduling/thank-you/thank-you.component';
import { PlaylistLibraryComponent } from './teacher/exercise-library/playlist-library/playlist-library.component';


const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'studentscheduling/:linkId', component: HomeComponent },
    { path: 'student/teacher-invite/:userId', component: HomeComponent },
    { path: 'student/gvFeedback/:lessonGuid', component: HomeComponent },
    { path: 'room/:roomKey', component: HomeComponent },
    { path: 'user/lesson-share/:lessonId', component: HomeComponent },
    { path: 'user/song-share/:songId', component: HomeComponent },
    { path: 'user/video-share/:videoId', component: HomeComponent },
    { path: 'confirm-account/:userId', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: LoginComponent },
    { path: 'login/:mobile', component: LoginComponent },
    { path: 'select-type', component: UserRoleSelectionComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'term-of-service', component: UserTermOfServiceComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'term-of-service/:mobile', component: UserTermOfServiceComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'not-found', component: NotFoundComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'no-browser', component: NoBrowserComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'resetpassword/:userGuid', component: ResetPasswordComponent },
    { path: 'oauth2callback', component: Oauth2callbackComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/dashboard', component: TeacherDashboardComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/profile', component: TeacherProfileComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/profile/edit', component: TeacherProfileEditComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/calendarsync', component: CalendarSyncComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/calendar', component: TeacherCalendar, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/settings', component: AccountSettingsComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/rate-settings', component: RatesComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/link-setting', component: LinksComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/payment', component: PaymentComponent },
    { path: 'teacher/lobby', component: LobbyComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/student-list', component: StudentListingComponent, canActivate: [VlauthGuardServiceService] },    
    { path: 'teacher/lesson-planner', component: LessonplannerComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/lesson-planner/add-song', component: SongComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/lesson-planner/add-exercise', component: ExerciseComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/lesson-planner/library', component: LibraryComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/lesson-planner/edit-existing-song', component: EditExiistingSongComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/exercise-library', component: ExerciseLibraryComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/song-library', component: SongLibraryComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/lesson-library', component: LessonLibraryComponent, canActivate: [VlauthGuardServiceService] },    
    { path: 'teacher/lesson-history', component: HistoryComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/guidedvideo', component: GuidedvideoComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/guidedvideo-lessonplanner', component: GuidedvideoLessonPlannerComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/guidedvideo-lessonplanner/add-exercise', component: ExerciseComponent, canActivate: [VlauthGuardServiceService] },    
    { path: 'teacher/videoConnected', component: ConnectedComponent, canActivate: [VlauthGuardServiceService] },    
    { path: 'teacher/guidedvideo-lessonplanner/add-song', component: SongComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/lesson-planner/add-video', component: VideoComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/guidedvideo-lessonplanner/add-video', component: VideoComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/module-itr-builder', component: ModuleItrBuilderComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/video-library', component: VideoLibraryComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'teacher/guidedvideo-lessonplanner/feedbackcomplete', component: FeedbackCompletedComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/dashboard', component: StudentDashboardComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/teacher-list', component: TeacherListingComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/lobby', component: LobbyComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/add-student', component: AddStudentComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/profile/edit', component: StudentProfileEditComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/profile/create', component: StudentProfileEditComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/profile', component: StudentProfileComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/schedule', component: ScheduleLessonComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/schedule/selectdates', component: SelectDatesComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/schedule/reviewselection', component: ReviewSelectionComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/schedule/personalsettings', component: PersonalSettingsComponent },
    { path: 'student/schedule/singleandmultiple', component: SelectDateByMonthComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/personal-info', component: PersonalInfoComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/schedule/payment', component: BookingPaymentComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/videoConnected', component: ConnectedComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/index', component: TeacherIndexComponent, canActivate: [VlauthGuardServiceService] },    
    { path: 'student/lesson-history', component: HistoryComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/questionnaire', component: QuestionnaireComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/videofeedback', component: GuidedVideoFeedbackComponent, canActivate: [VlauthGuardServiceService] },   
    { path: 'student/guidedvideofeedback/add-video', component: AddVideoFeedbackComponent, canActivate: [VlauthGuardServiceService] },   
    { path: 'student/guidedvideofeedback', component: GuidedVideoPlayerComponent, canActivate: [VlauthGuardServiceService] },    
    { path: 'student/videoSubmissionComplete', component: VideoSubmissionCompleteComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/guidedvideofeedback/:lessonId', component: GuidedVideoPlayerComponent },    
    { path: 'student/gvl-payment', component: GvlPaymentComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'mobile-lobby', component: MobileLobbyComponent },
    { path: 'mobile/student/guidedvideofeedback', component: MobileGuidedVideoPlayerComponent  },
    { path: 'mobile/favorites', component: MobileFavoritesComponent  },
    { path: 'mobile-lesson-player', component: MobileLessonPlayerComponent },
    { path: 'mobile/history-accordion', component: HistoryAccordionComponent },
    { path: 'student/socialshare/:userGuid', component: HomeComponent },
    { path: 'user/exercise-invite/:exerciseGuid', component: HomeComponent },
    { path: 'student/playlist', component: PlaylistComponent },
    { path: 'student/playlist/add-exercise', component: ExerciseComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/playlist/add-video', component: VideoComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/playlist/add-song', component: SongComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/song-library', component: SongLibraryComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/lesson-library', component: LessonLibraryComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/exercise-library', component: ExerciseLibraryComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/video-library', component: VideoLibraryComponent, canActivate: [VlauthGuardServiceService] },
    { path: 'student/playlist-library', component: PlaylistLibraryComponent },
    { path: 'student/thankyou', component: ThankYouComponent },
    { path: 'user/exercise-share/:exerciseGuid', component: HomeComponent },
];

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(appRoutes, { useHash: true })
    ],
    exports: [RouterModule]
})

export class AppRoutingModule {
    constructor() {

    }
}
