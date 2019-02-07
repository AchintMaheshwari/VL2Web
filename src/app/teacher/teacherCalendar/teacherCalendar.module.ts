import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleModule } from 'primeng/components/schedule/schedule';
import { DialogModule } from 'primeng/components/dialog/dialog';
import { InputTextModule } from 'primeng/components/inputtext/inputtext';
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { CheckboxModule } from 'primeng/components/checkbox/checkbox';
import { ButtonModule } from 'primeng/components/button/button';
import { TabViewModule } from 'primeng/components/tabview/tabview';
import { CodeHighlighterModule } from 'primeng/components/codehighlighter/codehighlighter';
import { TeacherCalendar } from './teacherCalendar';
import { jqxCalendarComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxcalendar';
import { TeacherCalendarMenuComponent } from '../teacher-calendar-menu/teacher-calendar-menu.component';
import { CalendarSyncComponent } from '../../calendar-sync/calendar-sync.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TeacherAvailibiltyComponent } from '../teacher-availibilty/teacher-availibilty.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { CalendarValidationDirective } from '../../directives/calendar-validation.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ScheduleModule,
        DialogModule,
        InputTextModule,
        CalendarModule,
        CheckboxModule,
        ButtonModule,
        TabViewModule,
        CodeHighlighterModule,
        NgbModule.forRoot(),
        NoopAnimationsModule,
        OwlDateTimeModule, OwlNativeDateTimeModule

    ],
    declarations: [
        jqxCalendarComponent,
        TeacherCalendarMenuComponent,
        TeacherCalendar,
        CalendarSyncComponent,
        TeacherAvailibiltyComponent, CalendarValidationDirective
    ],
})
export class TeacherCalendarModule { }
