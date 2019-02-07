import { Component, OnInit, ViewChild } from '@angular/core';
import { jqxCalendarComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxcalendar';
import { CalendarService } from '../../services/calendar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'teacher-calendar-menu',
  templateUrl: './teacher-calendar-menu.component.html'
})
export class TeacherCalendarMenuComponent implements OnInit {
  teacherId: any;
  @ViewChild('vlCalendar') vlCalendar: jqxCalendarComponent;
  restrictedDates: Date[] = new Array();
  min: Date = new Date(2015, 0, 1);
  max: Date = new Date(2030, 11, 31);
  constructor(private calendarService: CalendarService, private route: Router) {
    let userData = JSON.parse(localStorage.getItem('userData'));
    this.teacherId = userData.Teacher[0].TeacherId;
  }

  ngOnInit() {
    this.calendarService.getTeacherCalendar().subscribe(eventList => {
      eventList.forEach(calElement => {
        if (calElement.CalendarSyncResult == null) return;
        JSON.parse(calElement.CalendarSyncResult).forEach(element => {
          var start = element.Start.DateTimeOffset;
          this.restrictedDates.push(new Date(start));
        });
        this.vlCalendar.refresh();
      });
    });
  }

  navigateCalendarSync() {
    this.route.navigateByUrl('/teacher/calendarsync');
  }

  updateAvailability() {
    this.calendarService.isAvailabilitySetting = true;
  }
}