import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeacherCoursesComponent } from './profile/teacher-courses/teacher-courses.component';
import { TeacherProfileComponent } from './profile/profile.component';
import { TeacherReviewsComponent } from './profile/teacher-reviews/teacher-reviews.component';
import { TeacherProfileEditComponent } from './teacher-profile-edit/teacher-profile-edit.component';
import { OnlyNumber } from '../directives/onlynumber.directive';
import { NumberWithSymbols } from '../directives/numberwithsymbols.directive';
import { SafePipe } from '../directives/safe.directive';
import { TeacherDashboardComponent } from './dashboard/teacher-dashboard/teacher-dashboard.component';
import { RouterModule } from '@angular/router';
import { TeacherCalendarModule } from './teacherCalendar/teacherCalendar.module';
import { AccountSettingsComponent } from './settings/account-settings/account-settings.component';
import { SettingsMenuComponent } from './settings/settings-menu/settings-menu.component';
import { RatesComponent } from './settings/rates/rates.component';
import { RateSettingComponent } from './settings/rate-setting/rate-setting.component';
import { LinksComponent } from './settings/links/links.component';
import { LinkSettingComponent } from './settings/link-setting/link-setting.component';
import { PaymentComponent } from './settings/payment/payment.component';
import { PaymentNotReceivedComponent } from './settings/payment-not-received/payment-not-received.component';
import { PaymentHistoryComponent } from './settings/payment-history/payment-history.component';
import { BsDatepickerModule, TooltipModule, ModalModule, BsModalService, AccordionModule, TabsModule, AccordionConfig, BsDropdownModule, CollapseModule } from 'ngx-bootstrap';
import { PaymentFromStudentComponent } from './settings/payment-from-student/payment-from-student.component';
import { StripeConnectingComponent } from './settings/stripe-connecting/stripe-connecting.component';
import { PersonalSettingsComponent } from './settings/personal-settings/personal-settings.component';
import { StripeConnectService } from '../services/stripe-connect.service';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ClipboardModule } from 'ngx-clipboard';
import { FilterPipe } from '../filter/filter.pipe';
import { FilterlibraryPipe } from '../filter/filterlibrary.pipe';
import { ImageCropperModule } from 'ng2-img-cropper';
import { ModalDialogModule } from 'ngx-modal-dialog';
import { LobbyComponent } from './lobby/lobby.component';
import { DisconnectedComponent } from './lobby/disconnected/disconnected.component';
import { ConnectedComponent } from './lobby/connected/connected.component';
import { OwlModule } from 'angular-owl-carousel';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { LobbyService } from '../services/lobby.service';
import { MaterialModule } from '../material/material.module';
import { LessonplannerComponent } from './lessonplanner/lessonplanner.component';
import { FileDropModule } from 'ngx-file-drop';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AddSongComponent } from './lessonplanner/add-song/add-song.component';
import { MatStepperModule } from '@angular/material';
import { LibraryComponent } from './lessonplanner/library/library.component';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { EditExiistingSongComponent } from './lessonplanner/edit-exiisting-song/edit-exiisting-song.component';
import { ExerciseLibraryComponent } from './exercise-library/exercise-library.component';
import { SongLibraryComponent } from './exercise-library/song-library/song-library.component';
import { LessonLibraryComponent } from './exercise-library/lesson-library/lesson-library.component';
import { DndModule } from 'ng2-dnd';
import { TreeView } from './tree-view/tree-view';
import { AddExerciseComponent } from './lessonplanner/add-exercise/add-exercise.component';
import { NgxUploaderModule } from 'ngx-uploader';
import { CreateLessonDialogComponent } from './exercise-library/lesson-library/create-lesson-dialog/create-lesson-dialog.component';
import { AddStudentDialogComponent } from './exercise-library/lesson-library/add-student-dialog/add-student-dialog.component';
import { FilterStudentlibraryPipe } from '../filter/filter-studentlibrary.pipe';
import { DragLessonDialogComponent } from './drag-lesson-dialog/drag-lesson-dialog.component';
import { FilterDashboardlibraryPipe } from '../filter/filter-dashboardlibrary.pipe';
import { LibrarylistComponent } from './lessonplanner/librarylist/librarylist.component';
import { LessonQueueComponent } from './lessonplanner/lesson-queue/lesson-queue.component';
import { TeacherListingComponent } from './teacher-listing/teacher-listing.component';
import { ConfirmDeleteLessonComponent } from './confirm-delete-lesson/confirm-delete-lesson.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FilterSongLibraryPipe } from '../filter/filter-songlibrary.pipe';
import { FilterExerciseLibraryPipe } from '../filter/filter-Exerciselibrary.pipe';
import { ConfirmDeleteExcerciseComponent } from './confirm-delete-excercise/confirm-delete-excercise.component';
import { InputTrimModule } from 'ng2-trim-directive';
import { ConfirmDeleteSongComponent } from './confirm-delete-song/confirm-delete-song.component';
import { ExerciseComponent } from './lessonplanner/exercise/exercise.component';
import { SongComponent } from './lessonplanner/song/song.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GuidedvideoComponent } from './guidedvideo/guidedvideo.component';
import { GuidedvideoLessonPlannerComponent } from './guidedvideo/guidedvideo-lesson-planner/guidedvideo-lesson-planner.component';
import { GuidedvideoLessonQueueComponent } from './guidedvideo/guidedvideo-lesson-queue/guidedvideo-lesson-queue.component';
import { GuidedvideoTreeViewComponent } from './guidedvideo/guidedvideo-tree-view/guidedvideo-tree-view.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MobileLessonPlayerComponent } from './mobile-lessonplayer/mobile-lessonplayer.component';
import { MobileLobbyComponent } from './mobile-lobby/mobile-lobby.component';
import { AddVideoFeedbackComponent } from './lessonplanner/add-video-feedback/add-video-feedback.component';
import { QuizresultComponent } from './guidedvideo/quizresult/quizresult.component';
import { AddVideoComponent } from './lessonplanner/add-video/add-video.component';
import { VideoComponent } from './lessonplanner/video/video.component';
import { FeedbackCompletedComponent } from './guidedvideo/feedback-completed/feedback-completed.component';
import { GuidedVideoPlayerComponent } from './guided-video-player/guided-video-player.component';
import { StarRatingModule } from 'angular-star-rating';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { ModuleItrBuilderComponent } from './module-itr-builder/module-itr-builder.component';
import { VideoLibraryComponent } from './exercise-library/video-library/video-library.component';
import { ConfirmDeleteVideoComponent } from './confirm-delete-video/confirm-delete-video.component';
import { FilterVideoLibraryPipe } from '../filter/filter-videolibrary.pipe';
import { VideoFeedbackTreeViewComponent } from './lessonplanner/add-video-feedback/video-feedback-tree-view/video-feedback-tree-view.component';
import { AddVideoLessonQueueComponent } from './lessonplanner/add-video-feedback/add-video-lesson-queue/add-video-lesson-queue.component';
import { GvlPaymentComponent } from './gvl-payment/gvl-payment.component';
import { MobileGuidedVideoPlayerComponent } from './mobile-guided-video-player/mobile-guided-video-player.component';
import { ShareComponent } from './share/share.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClientJsonpModule } from '../../../node_modules/@angular/common/http';
import { ShareModule } from '@ngx-share/core';
import { ProgressBarModule } from "angular-progress-bar"
import { PlaylistComponent } from './playlist/playlist.component';
import { PlaylistLessonQueueComponent } from './playlist/playlist-lesson-queue/playlist-lesson-queue.component';
import { PlaylistTreeViewComponent } from './playlist/playlist-tree-view/playlist-tree-view.component';
import { PlaylistLibraryComponent } from './exercise-library/playlist-library/playlist-library.component';
import { CreatePlaylistDialogComponent } from './exercise-library/playlist-library/create-playlist-dialog/create-playlist-dialog.component';

@NgModule({

  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TeacherCalendarModule,
    BsDatepickerModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule,
    AccordionModule.forRoot(),
    OwlDateTimeModule, OwlNativeDateTimeModule,
    ClipboardModule,
    ImageCropperModule,
    ModalDialogModule.forRoot(),
    OwlModule,
    UiSwitchModule,
    AccordionModule.forRoot(),
    MaterialModule,
    FileDropModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    MatStepperModule,
    MalihuScrollbarModule.forRoot(),
    DndModule,
    NgxUploaderModule,
    NgMultiSelectDropDownModule.forRoot(),
    InputTrimModule,
    NgbModule.forRoot(),
    StarRatingModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    HttpClientModule,
    HttpClientJsonpModule,
    FontAwesomeModule,
    ShareModule.forRoot(),
  ],

  declarations: [OnlyNumber, NumberWithSymbols, SafePipe, TeacherCoursesComponent, TeacherReviewsComponent,
    TeacherProfileComponent, TeacherProfileEditComponent, TeacherDashboardComponent, AccountSettingsComponent, SettingsMenuComponent,
    PersonalSettingsComponent, RatesComponent, RateSettingComponent, LinksComponent, LinkSettingComponent, PaymentComponent,
    PaymentNotReceivedComponent, PaymentHistoryComponent, PaymentFromStudentComponent, StripeConnectingComponent, FilterPipe, LobbyComponent,
    DisconnectedComponent, ConnectedComponent, LessonplannerComponent, AddSongComponent, LibraryComponent,
    EditExiistingSongComponent, ExerciseLibraryComponent, SongLibraryComponent, LessonLibraryComponent, TreeView, AddExerciseComponent,
    LessonQueueComponent,
    LibrarylistComponent,
    FilterlibraryPipe,
    CreateLessonDialogComponent,
    AddStudentDialogComponent,
    ConfirmDeleteSongComponent,
    FilterStudentlibraryPipe,
    DragLessonDialogComponent,
    FilterDashboardlibraryPipe,
    FilterSongLibraryPipe,
    LibrarylistComponent,
    LessonQueueComponent,
    TeacherListingComponent,
    ConfirmDeleteLessonComponent,
    FilterExerciseLibraryPipe,
    ConfirmDeleteExcerciseComponent,
    ExerciseComponent,
    SongComponent,
    GuidedvideoComponent,
    GuidedvideoLessonPlannerComponent,
    GuidedvideoLessonQueueComponent,
    GuidedvideoTreeViewComponent,
    MobileLessonPlayerComponent,
    MobileLobbyComponent,
    AddVideoFeedbackComponent,
    QuizresultComponent,
    AddVideoComponent,
    VideoComponent,
    FeedbackCompletedComponent,
    GuidedVideoPlayerComponent, ModuleItrBuilderComponent, VideoLibraryComponent, ConfirmDeleteVideoComponent,
    FilterVideoLibraryPipe,
    VideoFeedbackTreeViewComponent,
    AddVideoLessonQueueComponent,
    GvlPaymentComponent,
    MobileGuidedVideoPlayerComponent,
    ShareComponent,
    PlaylistComponent,
    PlaylistLessonQueueComponent,
    PlaylistTreeViewComponent,
    PlaylistLibraryComponent,
    CreatePlaylistDialogComponent,
  ],
  exports: [OnlyNumber, NumberWithSymbols, SafePipe, TeacherCoursesComponent, TeacherReviewsComponent, PersonalSettingsComponent,
    TeacherProfileComponent, TeacherProfileEditComponent, ReactiveFormsModule, TreeView, NgxUploaderModule
  ],
  providers: [
    BsModalService, StripeConnectService, AccordionConfig, LobbyService
  ],
  entryComponents: [CreateLessonDialogComponent, CreatePlaylistDialogComponent],
})
export class TeacherModule { }
