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
import { SelectDateByMonthComponent } from './select-date-by-month.component';

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
        CodeHighlighterModule
    ],
    declarations: [
        SelectDateByMonthComponent
    ],
    exports: [SelectDateByMonthComponent]
})
export class SelectDateByMonthModule { }
