import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SchedulingService } from '../../services/Scheduling.Service';
import { CommonService } from '../../common/common.service';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-select-dates',
  templateUrl: './select-dates.component.html',
  styleUrls: ['./select-dates.component.scss']
})
export class SelectDatesComponent implements OnInit {
  weekDayName: string = '';
  timeSlot: string = '';
  timeSlotsForRecur: string[] = [];

  constructor(private route: Router, public schedulingService: SchedulingService, private commonService: CommonService,
    private toastr: ToastrService, private loaderService: LoaderService) {
  }

  ngOnInit() {
    if (this.schedulingService.isRecurringDaySelected) {
      this.timeSlotsForRecur = [];
      this.schedulingService.getTeacherAvailabilityTimeSlotForRecurring(this.schedulingService.recurringWeekDayName).subscribe(result => {
        var slotitem: any = result;
        for (var i = 0; i < result.length; i++) {
          slotitem[i].StartDateTime = CommonService.convertToTimeZone(moment.utc(slotitem[i].StartDateTime).format());
          slotitem[i].EndDateTime = CommonService.convertToTimeZone(moment.utc(slotitem[i].EndDateTime).format());
          this.timeSlotsForRecur.push(slotitem[i].StartDateTime.substr(11, 5) + ' - ' + slotitem[i].EndDateTime.substr(11, 5));
        }
      });
    }
    else if (this.schedulingService.isReschedule) {
      this.schedulingService.recurringWeekDayName = moment(this.schedulingService.studentScheduleObject.CalendarEvents[0].EventStartDate).format('dddd');
      this.schedulingService.isRecurringDaySelected = true;
      this.timeSlotsForRecur = [];
      let timeSlot = this.schedulingService.studentScheduleObject.CalendarEvents[0].EventStartDate.substr(11, 5) + ' - ' +
        this.schedulingService.studentScheduleObject.CalendarEvents[0].EventEndDate.substr(11, 5);
      this.timeSlotsForRecur.push(timeSlot);
      this.schedulingService.recurringTimeSlot = timeSlot;
      this.commonService.associatedTeacherId = this.schedulingService.studentScheduleObject.TeacherUserId;
    }
  }

  onWeekdaySelection(dayName) {
    this.schedulingService.recurringWeekDayName = dayName;
    this.timeSlotsForRecur = [];
    this.schedulingService.getTeacherAvailabilityTimeSlotForRecurring(dayName).subscribe(result => {
      var slotitem: any = result;
      for (var i = 0; i < result.length; i++) {
        slotitem[i].StartDateTime = CommonService.convertToTimeZone(moment.utc(slotitem[i].StartDateTime).format());
        slotitem[i].EndDateTime = CommonService.convertToTimeZone(moment.utc(slotitem[i].EndDateTime).format());

        this.timeSlotsForRecur.push(slotitem[i].StartDateTime.substr(11, 8) + ' - ' + slotitem[i].EndDateTime.substr(11, 8));
      }
    })
    this.schedulingService.isRecurringDaySelected = true;
  }

  onTimeSelection(slotTime) {
    this.schedulingService.recurringTimeSlot = slotTime;
    this.schedulingService.studentScheduleObject.CalendarEvents = [];
    this.getAvailableSlots();
  }

  getAvailableSlots() {
    this.schedulingService.getTeacherRecurringAvailabileSchedulesData(this.schedulingService.recurringWeekDayName,
      this.schedulingService.recurringTimeSlot).subscribe(result => {
        result.forEach(slot => {
          this.schedulingService.studentScheduleObject.CalendarEvents.push({
            CalendarEventId: 0,
            BookingId: this.schedulingService.studentScheduleObject.BookingId,
            EventName: 'Music Lesson',
            EventStartDate: moment.utc(moment(slot.EventStartDate)).format('YYYY-MM-DD hh:mm A'),
            EventEndDate: moment.utc(moment(slot.EventEndDate)).format('YYYY-MM-DD hh:mm A')
          });
        })
      });
  }

  onNextClick() {
    this.route.navigateByUrl('/student/schedule/reviewselection');
  }
  
  onBack(){
    this.route.navigate(['/student/schedule']);
  }

  onReschedule() {
    this.loaderService.processloader = true;
    this.schedulingService.post("/booking/UpsertStudentBookingEvents", this.schedulingService.studentScheduleObject.CalendarEvents,
      new HttpParams()).subscribe(result => {
        this.loaderService.processloader = false;
        if (result) {
          this.toastr.success("Booking rescheduled successfully");
          this.schedulingService.isReschedule = false;
          this.route.navigateByUrl('/student/dashboard');
        }
        else {
          this.toastr.warning("Booking reschedule failed. Please try again.");
        }
      })
  }
}
