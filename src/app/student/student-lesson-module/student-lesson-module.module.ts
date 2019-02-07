import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history/history.component';
import { TabsModule, AccordionModule, BsDropdownModule } from '../../../../node_modules/ngx-bootstrap';
import { OwlModule } from '../../../../node_modules/angular-owl-carousel';
import { MatExpansionModule } from '../../../../node_modules/@angular/material';
import { MalihuScrollbarService, MalihuScrollbarModule } from '../../../../node_modules/ngx-malihu-scrollbar';
import { StudentLessonHistoryService } from '../../services/student-lesson-history.service';
import { LessonChatComponent } from './lesson-chat/lesson-chat.component';
import { HistoryAccordionComponent } from './history/history-accordion/history-accordion.component';
import { MobileFavoritesComponent } from './history/mobile-favorites/mobile-favorites.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TabsModule.forRoot(),
    OwlModule,
    AccordionModule.forRoot(),
    MatExpansionModule,
    MalihuScrollbarModule.forRoot(),
    BsDropdownModule.forRoot()
  ],
  declarations: [HistoryComponent, LessonChatComponent, HistoryAccordionComponent, MobileFavoritesComponent],
  providers: [
    MalihuScrollbarService,
    StudentLessonHistoryService
  ]
})
export class StudentLessonModule { }
