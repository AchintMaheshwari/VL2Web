import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EventModel } from '../../models/event.model';
import { SchedulingService } from '../../services/Scheduling.Service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from '../../common/common.service';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-select-date-by-month',
  templateUrl: './select-date-by-month.component.html',
  styles: [`
  .ui-grid-row div {
    padding: 4px 10px
  }
  
  .ui-grid-row div label {
    font-weight: bold;
  }
`],
  providers: [DatePipe]
})
export class SelectDateByMonthComponent implements OnInit {
  timeSlot: string = '';
  selectedCell: object;
  selectDateVal: string = '';
  selectedDateObject: any;
  className: string;
  isTimeSlotUnselected: boolean = true;
  isTimeSelect: boolean;
  items: string[] = [];
  selectedDate: string = '';
  events: EventModel[];
  header: any;
  defaultDate: string;
  noOfLesson: number;
  monthNames: any = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];


  constructor(public schedulingService: SchedulingService, private loaderService: LoaderService,
    private route: Router, private toastr: ToastrService, private commonService: CommonService) {
    this.defaultDate = new Date().toDateString();
    this.events = [];
  }

  ngOnInit() {
    if (this.schedulingService.isReschedule) {
      this.commonService.associatedTeacherId = this.schedulingService.studentScheduleObject.TeacherUserId;
      this.schedulingService.allSelectedDateObject = [];
    }
    this.schedulingService.studentScheduleObject.CalendarEvents.forEach(dateitem => {
      if (this.schedulingService.isReschedule) {
        var utcSelectedDate = moment.utc(dateitem.EventStartDate.toString()).format();
        this.selectDateVal = this.monthNames[new Date(utcSelectedDate).getMonth()] + ' ' + new Date(utcSelectedDate).getUTCDate();
        this.createRescheduleLessonSlot(dateitem.EventStartDate.toString());
      }
      this.events.push({
        id: dateitem.BookingId,
        title: dateitem.EventName,
        start: CommonService.convertToTimeZone(dateitem.EventStartDate.toString()),
        end: CommonService.convertToTimeZone(dateitem.EventEndDate.toString()),
        allDay: false,
        className: 'selectedCalClass',
        editable: true,
      });
    });

    if (this.schedulingService.studentScheduleObject.BookingType == 'Single') {
      this.noOfLesson = 1;
    }
    else if (this.schedulingService.studentScheduleObject.BookingType == 'Multiple') {
      this.noOfLesson = 5;
    }
    this.header = {
      left: 'prev,next today',
      center: 'title',
      right: 'month'
    };
  }

  //Calendar View rendar
  onViewRender(e) {
    if (this.schedulingService.allSelectedDateObject.length > 0) {
      this.schedulingService.allSelectedDateObject.forEach(cellDate => {
        var cellDt = new Date(cellDate.selectStartDate);
        $("[data-date=" + this.formatDate(cellDt) + " ]").addClass('schedulingSelectedCalClass');
      })
    }
  }

  onDayClick(e) {
    if (this.isTimeSlotUnselected && this.selectedDateObject != undefined) {
      this.selectedDateObject.className = this.className;
    }

    this.isTimeSlotUnselected = true;
    this.className = e.view.className;
    this.selectedDateObject = e.view;
    var currentDateVal = new Date().valueOf();
    var utcSelectedDate = moment.utc(e.date._d).format();
    var selectDateVal = new Date(utcSelectedDate).valueOf();
    if (currentDateVal > selectDateVal) {
      this.toastr.warning('please select date greater than current date.');
    }
    else {
      if (this.schedulingService.studentScheduleObject.BookingType == 'Multiple') {
        if (this.events.length < 5) {
          this.isTimeSelect = true;
          this.selectDateVal = this.monthNames[new Date(utcSelectedDate).getMonth()] + ' ' + new Date(utcSelectedDate).getUTCDate();
          var selectedDate = new Date(utcSelectedDate).toISOString();
          this.selectedDate = selectedDate;
          this.items = [];
          e.view.className = e.view.className + ' schedulingSelectedCalClass';
          this.selectedCell = e.view;
          this.schedulingService.getTeacherAvailabilityTimeSlots(selectedDate).subscribe(result => {
            var slotitem: any = result;
            for (var i = 0; i < result.length; i++) {
              slotitem[i].StartDateTime = CommonService.convertToTimeZone(moment.utc(slotitem[i].StartDateTime).format());
              slotitem[i].EndDateTime = CommonService.convertToTimeZone(moment.utc(slotitem[i].EndDateTime).format());

              this.items.push(slotitem[i].StartDateTime.substr(11, 8) + ' - ' + slotitem[i].EndDateTime.substr(11, 8));
            }
          });
        }
        else {
          this.toastr.warning('You can select only 5 dates.');
        }
      }
      else if (this.schedulingService.studentScheduleObject.BookingType == 'Single') {
        if (this.events.length < 1) {
          this.isTimeSelect = true;
          this.selectDateVal = this.monthNames[new Date(utcSelectedDate).getMonth()] + ' ' + new Date(utcSelectedDate).getUTCDate();
          var selectedDate = new Date(utcSelectedDate).toISOString();
          this.selectedDate = selectedDate;
          this.items = [];
          e.view.className = e.view.className + ' schedulingSelectedCalClass';
          this.selectedCell = e.view;
          this.schedulingService.getTeacherAvailabilityTimeSlots(selectedDate.toString()).subscribe(result => {
            var slotitem: any = result;
            for (var i = 0; i < slotitem.length; i++) {
              slotitem[i].StartDateTime = CommonService.convertToTimeZone(moment.utc(slotitem[i].StartDateTime).format());
              slotitem[i].EndDateTime = CommonService.convertToTimeZone(moment.utc(slotitem[i].EndDateTime).format());

              this.items.push(slotitem[i].StartDateTime.substr(11, 5) + ' - ' + slotitem[i].EndDateTime.substr(11, 5));
            }
          });
        }
        else {
          this.toastr.warning('You can select only 1 date.');
        }
      }
    }
  }

  onTimeSelection(slotTime) {
    this.timeSlot = slotTime;
    this.isTimeSlotUnselected = false;
    var startTime = slotTime.split('-')[0].trim();
    var endTime = slotTime.split('-')[1].trim();
    var startDate = CommonService.convertToUTC(this.selectedDate, startTime);
    var endDate = CommonService.convertToUTC(this.selectedDate, endTime);
    if (this.schedulingService.studentScheduleObject.BookingType == 'Multiple') {
      if (this.events.length < 5) {
        var createdSlot = this.events.find(i => i.start === CommonService.convertToTimeZone(startDate) && i.end === CommonService.convertToTimeZone(endDate));
        if (createdSlot != undefined) {
          this.toastr.error('Sorry, you have selected a pre-booked slot again!');
        }
        else {
          var createdSlot = this.events.find(i => i.start.startsWith(this.selectedDate));
          if (createdSlot != undefined) {
            if (confirm("You have chosen a different time slot for a previously selected day. This will modify your pre-booked slot. Do you want to continue?")) {
              this.schedulingService.allSelectedDateObject.splice(this.schedulingService.allSelectedDateObject.
                findIndex(i => i.selectStartDate.startsWith(this.selectedDate)), 1);
              this.events.splice(this.events.findIndex(i => i.start.startsWith(this.selectedDate)), 1);
              this.schedulingService.studentScheduleObject.CalendarEvents.splice(this.schedulingService.studentScheduleObject.CalendarEvents.
                findIndex(i => i.StartDateTime.startsWith(this.selectedDate)), 1);
              this.createLessonSlot(startDate, endDate);
            }
          }
          else {
            this.createLessonSlot(startDate, endDate)
          }
        }
      }
      else {
        this.toastr.warning('You can avail only 5 lessons.');
      }
    }
    else if (this.schedulingService.studentScheduleObject.BookingType == 'Single') {
      if (this.events.length < 1) {
        this.createLessonSlot(startDate, endDate);
      }
      else {
        this.toastr.warning('You can avail only 1 lesson.');
      }
    }
  }

  createRescheduleLessonSlot(startDate) {
    this.schedulingService.allSelectedDateObject.push({
      monthNameWithDay: this.selectDateVal,
      selectStartDate: startDate,
      selectedCell: this.selectedCell
    });

    this.schedulingService.allSelectedDateObject.sort(function (a, b) {
      return new Date(a.selectStartDate).getTime() - new Date(b.selectStartDate).getTime()
    })
  }

  createLessonSlot(startDate, endDate) {
    this.schedulingService.allSelectedDateObject.push({
      monthNameWithDay: this.selectDateVal,
      selectStartDate: startDate,
      selectedCell: this.selectedCell
    });

    this.schedulingService.allSelectedDateObject.sort(function (a, b) {
      return new Date(a.selectStartDate).getTime() - new Date(b.selectStartDate).getTime()
    })
    this.events.push({
      id: 100,
      title: "Music Lesson",
      start: CommonService.convertToTimeZone(startDate),
      end: CommonService.convertToTimeZone(endDate),
      allDay: false,
      className: 'selectedCalClass',
      editable: true,
    });
    this.schedulingService.studentScheduleObject.CalendarEvents.push({
      CalendarEventId: 0,
      BookingId: this.schedulingService.studentScheduleObject.BookingId,
      EventName: "Slot Booked",
      EventStartDate: startDate,
      EventEndDate: endDate,
    });
  }

  removeLink(monthNameWithDay, selectStartDate) {
    if (this.schedulingService.isReschedule) {
      if (this.schedulingService.bookingTimeValidation(selectStartDate)) {
        var selectedHeaderCell = this.schedulingService.allSelectedDateObject.find(i => i.monthNameWithDay === monthNameWithDay);
        this.schedulingService.allSelectedDateObject.splice(this.schedulingService.allSelectedDateObject.
          findIndex(i => i.monthNameWithDay === monthNameWithDay), 1);
        this.events.splice(this.events.findIndex(i => i.start === moment(selectStartDate).format('YYYY/MM/DD hh:mm A')), 1);
        this.schedulingService.studentScheduleObject.CalendarEvents.splice(this.schedulingService.studentScheduleObject.CalendarEvents.
          findIndex(i => i.StartDateTime === selectStartDate), 1);
        //remove selected cell 
        var cellDt = new Date(selectStartDate);
        $("[data-date=" + this.formatDate(cellDt) + " ]").removeClass('schedulingSelectedCalClass');
      }
      else {
        this.toastr.error("Sorry, you can not reschedule you booking slot within 24 hours of booking.");
      }
    }
    else {
      var selectedHeaderCell = this.schedulingService.allSelectedDateObject.find(i => i.monthNameWithDay === monthNameWithDay);
      this.schedulingService.allSelectedDateObject.splice(this.schedulingService.allSelectedDateObject.
        findIndex(i => i.monthNameWithDay === monthNameWithDay), 1);
      selectedHeaderCell.selectedCell.className = selectedHeaderCell.selectedCell.className.replace(' schedulingSelectedCalClass', '');
      this.events.splice(this.events.findIndex(i => i.start === selectStartDate), 1);
      this.schedulingService.studentScheduleObject.CalendarEvents.splice(this.schedulingService.studentScheduleObject.CalendarEvents.
        findIndex(i => i.StartDateTime === selectStartDate), 1);
      //remove selected cell 
      var cellDt = new Date(selectStartDate);
      $("[data-date=" + this.formatDate(cellDt) + " ]").removeClass('schedulingSelectedCalClass');
    }
  }

  onNextClick() {
    this.route.navigateByUrl('/student/schedule/reviewselection');
  }

  onReschedule() {
    this.loaderService.processloader = true;
    this.schedulingService.post("/booking/psertStudentBookingEvents", this.schedulingService.studentScheduleObject.CalendarEvents,
      new HttpParams()).subscribe(result => {
        this.loaderService.processloader = false;
        if (result) {
          this.toastr.success("Booking rescheduled successfully");
          this.schedulingService.isReschedule = false;
          this.route.navigateByUrl('/student/dashboard');
        }
        else {
          this.toastr.error("Booking reschedule failed. Please try again.");
        }
      })
  }

  formatDate(d) {
    var month = d.getMonth();
    var day = d.getDate();
    var year = d.getFullYear();
    year = year.toString();
    month = month + 1;
    month = month + "";
    if (month.length == 1) {
      month = "0" + month;
    }
    day = day + "";
    if (day.length == 1) {
      day = "0" + day;
    }
    return year.toString() + '-' + month.toString() + "-" + day.toString();
  }

  onBack(){
    this.route.navigate(['/student/schedule']);
  }
}

