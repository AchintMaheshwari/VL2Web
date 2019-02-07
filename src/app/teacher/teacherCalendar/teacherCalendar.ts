import { Component, OnInit, NgZone } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CalendarService } from '../../services/calendar.service';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { HttpParams } from '@angular/common/http';
import * as moment from 'moment';
import { EventModel } from '../../models/event.model';
import { CommonService } from '../../common/common.service';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../services/loader.service';

@Component({
    templateUrl: './teacherCalendar.html',
    styles: [`
        .ui-grid-row div {
          padding: 4px 10px
        }
        
        .ui-grid-row div label {
          font-weight: bold;
        }
  `],
    styleUrls: ['./teacherCalendar.component.scss'],
    providers: [DatePipe]
})
export class TeacherCalendar implements OnInit {
    teacherId: null;
    readOnly: false;
    events: EventModel[];
    timezone: string;
    header: any;
    defaultDate: string;
    dateTimefrom: NgbTimeStruct = { hour: 15, minute: 30, second: 30 };
    dateTimeTo: NgbTimeStruct = { hour: 16, minute: 30, second: 30 };
    meridian = true;
    isDateSelected: boolean = false;
    isEditEvent: boolean = false;
    isEditAvailability: boolean = false;
    selectedDate: any;
    specificAvailableSlot: any;
    selectedSpecificDate: any;
    calendarEvent: any;
    selectedRow: any;
    event: any;
    className: string = '';
    eventId: number = 0;
    isCancellation: boolean = false;
    constructor(private calendarService: CalendarService, private toastr: ToastrService, private _ngZone: NgZone,
        private loaderService: LoaderService) {
        this.timezone = 'America/Chicago';//'UTC';
        let userData = JSON.parse(localStorage.getItem('userData'));
        this.teacherId = userData.Teacher[0].TeacherId;
        this.defaultDate = new Date().toDateString();
        this.events = [];
    }

    ngOnInit() {
        this.getTeacherCalendarData();
    }

    changeCalendarTimeZone(zone: any) {
        CommonService.userZone = $(zone.currentTarget).val().toString();
        this.getTeacherCalendarData();
    }

    //Fetch Teacher Calendar Data 
    getTeacherCalendarData() {
        this.events = [];
        this.calendarService.getTeacherCalendar().subscribe(eventList => {
            eventList.forEach(calElement => {
                var className = this.getEventClassName(calElement);
                if (calElement.CalendarSyncResult == null) return;
                JSON.parse(calElement.CalendarSyncResult).forEach(element => {
                    var start = CommonService.convertToUserTimeZone(element.Start.DateTimeOffset, element.Start.TimeZoneId);
                    var end = CommonService.convertToUserTimeZone(element.End.DateTimeOffset, element.End.TimeZoneId);
                    this.events.push({
                        id: element.EventUid,
                        title: element.Summary,
                        start: start,
                        end: end,
                        allDay: false,
                        className: className,
                        editable: true,
                    });
                });
            });
            //method to get the Block OFF Time  data to display on Calendar UI.    
            this.calendarService.getTeacherAvailAndBlockOffTime().subscribe(availEventList => {
                availEventList.forEach(availElement => {
                    var start = CommonService.convertToTimeZone(availElement.start);
                    var end = CommonService.convertToTimeZone(availElement.end);
                    this.events.push({
                        id: availElement.id,
                        title: availElement.title,
                        start: start,
                        end: end,
                        allDay: false,
                        className: availElement.className,//editable: true,
                        editable: availElement.calendarType === 'Block' ? false : true,
                    });
                });
                this.calendarService.getTeacherBookings().subscribe(availEventList => {
                    availEventList.forEach(availElement => {
                        var start = CommonService.convertToTimeZone(availElement.start);
                        var end = CommonService.convertToTimeZone(availElement.end);
                        this.events.push({
                            id: availElement.id,
                            title: availElement.title,
                            start: start,
                            end: end,
                            allDay: false,
                            className: availElement.className,//editable: true,
                            editable: availElement.calendarType === 'Block' ? false : true,
                        });
                    });
                });
            });
        });
        this.header = {
            left: 'prev,next',
            center: 'title',
            right: 'month,agendaWeek,agendaDay,listWeek'
        };
    }

    getEventClassName(calElement) {
        if (calElement.CalendaryType == 'exchange' || calElement.CalendaryType == 'live_connect')
            return 'orangeCalEvent';
        if (calElement.CalendaryType == 'google')
            return 'greenCalEvent';
        if (calElement.CalendaryType == 'apple')
            return 'purpleCalEvent';
    }

    onDayClick(e) {
        if (this.selectedRow != null)
            this.selectedRow.className = 'fc-day ui-widget-content fc-sun fc-past';
        this.className = e.view.className;
        e.view.className = e.view.className + ' selectedCalClass';
        this.selectedRow = e.view;
        this.isDateSelected = true;
        this.eventId = 0;
        this.selectedDate = moment.utc(e.date._d).format();//new Date(e.date._d).toLocaleDateString();
        this.selectedSpecificDate = moment.utc(e.date._d).format('ddd MMM DD YYYY');
        this.event = e;
    }

    closeAvailabilityModal() {
        this.isDateSelected = false;
        this.isEditAvailability = false;
        this.event.view.className = this.className
    }

    closeEditEventModal() {
        this.isEditEvent = false;
        this.event.view.className = this.className
    }

    onEventClick(e) {
        if (this.selectedRow != null)
            this.selectedRow.className = 'fc-day ui-widget-content fc-sun fc-past';
        this.className = e.view.className;
        e.view.className = e.view.className + ' selectedCalClass';
        this.selectedRow = e.view;
        this.eventId = e.calEvent.id;
        this.selectedDate = moment.utc(e.calEvent.start._i).format();
        this.selectedSpecificDate = moment.utc(e.calEvent.start._i).format('ddd MMM DD YYYY');
        this.dateTimefrom = { hour: parseInt(moment.utc(e.calEvent.start._i).format('HH')), minute: parseInt(moment.utc(e.calEvent.start._i).format('mm')), second: 30 };
        this.dateTimeTo = { hour: parseInt(moment.utc(e.calEvent.end._i).format('HH')), minute: parseInt(moment.utc(e.calEvent.end._i).format('mm')), second: 30 };
        if (e.calEvent.title.includes("Available")) {
            this.isEditAvailability = true;
        }
        else if (e.calEvent.title.includes("Slot Booked") || e.calEvent.title.includes("Music Lesson")) {
            this.isCancellation = false;
            if (this.calendarService.bookingTimeValidation(this.selectedDate, moment.utc(e.calEvent.start._i).format('hh:mm a'))) {
                this.isEditEvent = true;
                this.selectedDate = moment(this.selectedDate).format("YYYY-MM-DD");
            }
            else {
                this.toastr.error("Sorry, you can not reschedule you booking slot within 24 hours of booking.");
            }
        }
    }

    //Set Specific Availibility for Teacher 
    setSpecifiAvailibilityData(id: number) {
        this.isDateSelected = false;
        this.isEditAvailability = false;
        let availablehousfrom = this.dateTimefrom.hour + ":" + this.dateTimefrom.minute;
        let availablehousTo = this.dateTimeTo.hour + ":" + this.dateTimeTo.minute;
        this.specificAvailableSlot = {
            AvailabilityId: id,
            AvailabilityType: "Available",
            TeacherUserId: this.teacherId,
            Title: "Teacher is Available",
            StartDateTime: CommonService.convertToUTC(this.selectedDate, availablehousfrom),
            EndDateTime: CommonService.convertToUTC(this.selectedDate, availablehousTo),
        }
        if (this.calendarService.timeValidation(availablehousfrom, availablehousTo)) {
            this.saveSpecificAvailabilitySlot();
        }
    }

    //Save Specific Availibility for Teacher 
    saveSpecificAvailabilitySlot() {
        this.calendarService.post("/availability/UpsertTeacherSpecificAvailabilityData", this.specificAvailableSlot, new HttpParams()).subscribe((response: any) => {
            let index = this.events.findIndex(i => i.id == response.AvailabilityId && i.title.includes("Available"));
            if (index > -1)
                this.events.splice(index, 1);
            this.events.push({
                id: response.AvailabilityId,
                title: response.Title,
                start: CommonService.convertToTimeZone(response.StartDateTime),
                end: CommonService.convertToTimeZone(response.EndDateTime),
                allDay: false,
                className: "pinkCalEvent",
                editable: false,
            });
            if (response.Title === 'Teacher is Available') {
                this.toastr.success('Teacher is made available for this time slot.');
            }
            else {
                this.toastr.success('Teacher is blocked for this time slot.');
            }
        });
    }

    //Set Edited Booking data for Teacher 
    setBookingData(id: number) {
        this.isEditEvent = false;
        let availablehousfrom = this.dateTimefrom.hour + ":" + this.dateTimefrom.minute;
        let availablehousTo = this.dateTimeTo.hour + ":" + this.dateTimeTo.minute;
        this.calendarEvent = {
            CalendarEventId: id,
            BookingId: 0,
            EventName: "Teacher is booked",
            EventStartDate: CommonService.convertBlockDateTimeToUTC(moment(this.selectedDate).format('YYYY-MM-DD'), availablehousfrom),
            EventEndDate: CommonService.convertBlockDateTimeToUTC(moment(this.selectedDate).format('YYYY-MM-DD'), availablehousTo),
        }
        if (this.calendarService.bookingTimeValidation(this.selectedDate, moment.utc(moment.utc(new Date()).format("DD/MM/YYYY") + " " + availablehousfrom).format('hh:mm a'))) {
            if (this.calendarService.timeValidation(availablehousfrom, availablehousTo)) {
                this.saveEditedBookingData();
            }
        }
        else {
            this.toastr.error("Sorry, you can not reschedule you booking slot within 24 hours of booking.");
        }
    }

    //Save Edited Booking of Teacher 
    saveEditedBookingData() {
        this.calendarService.post("/booking/UpsertBookingEvents", this.calendarEvent, new HttpParams()).subscribe((response: any) => {
            let index = this.events.findIndex(i => i.id === response.id && (i.title.includes("Slot Booked") || i.title.includes("Music Lesson")));
            if (index > -1)
                this.events.splice(index, 1);
            this.events.push({
                id: response.id,
                title: response.title,
                start: CommonService.convertToTimeZone(response.start),
                end: CommonService.convertToTimeZone(response.end),
                allDay: false,
                className: "pinkCalEvent",
                editable: false,
            });
            this.toastr.success('Booking slot successfully rescheduled');
        });
    }

    onEventMouseover(e) {
        if (e.calEvent.start != null && e.calEvent.end != null) {
            e.jsEvent.currentTarget.setAttribute('title', moment.utc(e.calEvent.start._i).format('hh:mma') + '-' + moment.utc(e.calEvent.end._i).format('hh:mma') + ' ' + e.calEvent.title);
        }
    }

    initTreeViewCallbackEvents() {
        window['angularComponentReference'] = {
            zone: this._ngZone,
            component: this,
        };
    }

    cancelBooking() {
        this.isCancellation = true;
    }

    rejectCancel() {
        this.isCancellation = false;
    }

    cancelEvent(id: number) {
        this.isEditEvent = false;
        this.isCancellation = false;
        this.calendarService.post("/booking/CancelTeacherBooking", null, new HttpParams().set('eventId', id.toString())).subscribe((response: any) => {
            if (response) {
                let index = this.events.findIndex(i => i.id === id && (i.title.includes("Slot Booked") || i.title.includes("Music Lesson")));
                if (index > -1)
                    this.events.splice(index, 1);
                this.toastr.success('Booking slot successfully canceled.');
            }
            else {
                this.toastr.error('Booking slot cancellation failed. Please try again.');
            }
        });
    }
}