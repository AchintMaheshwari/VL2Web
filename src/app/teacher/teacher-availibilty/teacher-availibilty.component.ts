import { Component, OnInit, Injectable } from '@angular/core';
import { NgbTimeStruct, NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CrudService } from '../../services/crud.service';
import { CommonService } from '../../common/common.service';
import { CalendarService } from '../../services/calendar.service';
import { TeacherCalendar } from '../teacherCalendar/teacherCalendar';
import { ToastrService } from 'ngx-toastr';
import { moment } from 'ngx-bootstrap/chronos/test/chain';

@Component({
    selector: 'app-teacher-availibilty',
    templateUrl: './teacher-availibilty.component.html',
    styleUrls: ['./teacher-availibilty.component.scss']
})
@Injectable()
export class TeacherAvailibiltyComponent implements OnInit {
    dateBlockOffTimeFrom: any;
    dateBlockOffTimeTo: any;
    optionalBlockOffTitile: any;
    chkBlockAllday: boolean = true;
    teacherId: any;
    events: any[];
    blockAvaialableSlot: any;
    selectedDay: any;
    blockOfTimeRange: any;
    availableHoursArr: any;
    availablehours: string = '';
    timefrom: NgbTimeStruct = { hour: 10, minute: 30, second: 30 };
    timeto: NgbTimeStruct = { hour: 11, minute: 30, second: 30 };
    blockOfftimefrom: NgbTimeStruct = { hour: 15, minute: 30, second: 30 };
    blockOfftimeTo: NgbTimeStruct = { hour: 16, minute: 30, second: 30 };
    public FromBlockOfTimeDate = new Date(2018, 2, 28, 9, 30);
    public ToBlockOfTimeDate = new Date(2018, 2, 28, 9, 30);
    showRegAvailDatalist = true;
    showPopup = false; spinners = true;
    meridian = true; sundaySlot; mondaySlot; tuesdaySlot; wednesdaySlot; thursdaySlot;
    fridaySlot; saturdaySlot;
    day: string;

    ngOnInit() {
    }

    toggleMeridian() {
        this.meridian = !this.meridian;
    }
    closeDialog(day) {
        this.selectedDay = day;
    }

    constructor(config: NgbTimepickerConfig, public crudService: CrudService, public calendarService: CalendarService,
        private teacherCalendar: TeacherCalendar, private toastr: ToastrService) {
        config.seconds = false;
        config.spinners = true;
        calendarService.getTeacherRegAvailibility().subscribe(result => {
            result = result == null ? calendarService.getDefaultTeacherRegularAvailableData() : result;
            this.availableHoursArr = result = this.convertUTCToUserTimeZone(result);
            this.sundaySlot = result.Sunday.split(',');
            this.mondaySlot = result.Monday.split(',');
            this.tuesdaySlot = result.Tuesday.split(',');
            this.wednesdaySlot = result.Wednesday.split(',');
            this.thursdaySlot = result.Thursday.split(',');
            this.fridaySlot = result.Friday.split(',');
            this.saturdaySlot = result.Saturday.split(',');
        });

    }

    setRegAvailibilityfun() {
        let hoursFrom = this.timefrom.hour + ":" + this.timefrom.minute;
        let hoursTo = this.timeto.hour + ":" + this.timeto.minute;
        var currentDate = new Date().toLocaleDateString();
        if (this.calendarService.timeValidation(hoursFrom, hoursTo)) {
            let availableHoursfrom = moment(new Date(currentDate + ' ' + hoursFrom)).format('hh:mm A');
            let availableHoursTo = moment(new Date(currentDate + ' ' + hoursTo)).format('hh:mm A');
            if (this.selectedDay == 'Sunday') {
                if (this.availableHoursArr.Sunday == "") {
                    this.availableHoursArr.Sunday = this.availableHoursArr.Sunday.concat((availableHoursfrom + "-" + availableHoursTo).toString());
                }
                else {
                    this.availableHoursArr.Sunday = this.availableHoursArr.Sunday.concat(',' + (availableHoursfrom + "-" + availableHoursTo).toString());
                }
                this.sundaySlot.push(availableHoursfrom + "-" + availableHoursTo);
            } else if (this.selectedDay == 'Monday') {
                if (this.availableHoursArr.Monday == "") {
                    this.availableHoursArr.Monday = this.availableHoursArr.Monday.concat((availableHoursfrom + "-" + availableHoursTo).toString());
                }
                else {
                    this.availableHoursArr.Monday = this.availableHoursArr.Monday.concat(',' + (availableHoursfrom + "-" + availableHoursTo).toString());
                }
                this.mondaySlot.push(availableHoursfrom + "-" + availableHoursTo);
            }
            else if (this.selectedDay == 'Tuesday') {
                if (this.availableHoursArr.Tuesday == "") {
                    this.availableHoursArr.Tuesday = this.availableHoursArr.Tuesday.concat((availableHoursfrom + "-" + availableHoursTo).toString());
                }
                else {
                    this.availableHoursArr.Tuesday = this.availableHoursArr.Tuesday.concat(',' + (availableHoursfrom + "-" + availableHoursTo).toString());
                }
                this.tuesdaySlot.push(availableHoursfrom + " - " + availableHoursTo);
            }
            else if (this.selectedDay == 'Wednesday') {
                if (this.availableHoursArr.Wednesday == "") {
                    this.availableHoursArr.Wednesday = this.availableHoursArr.Wednesday.concat((availableHoursfrom + "-" + availableHoursTo).toString());
                }
                else {
                    this.availableHoursArr.Wednesday = this.availableHoursArr.Wednesday.concat(',' + (availableHoursfrom + "-" + availableHoursTo).toString());
                }
                this.wednesdaySlot.push(availableHoursfrom + "-" + availableHoursTo);
            }
            else if (this.selectedDay == 'Thursday') {
                if (this.availableHoursArr.Thursday == "") {
                    this.availableHoursArr.Thursday = this.availableHoursArr.Thursday.concat((availableHoursfrom + "-" + availableHoursTo).toString());
                }
                else {
                    this.availableHoursArr.Thursday = this.availableHoursArr.Thursday.concat(',' + (availableHoursfrom + "-" + availableHoursTo).toString());
                }
                this.thursdaySlot.push(availableHoursfrom + "-" + availableHoursTo);
            }
            else if (this.selectedDay == 'Friday') {
                if (this.availableHoursArr.Friday == "") {
                    this.availableHoursArr.Friday = this.availableHoursArr.Friday.concat((availableHoursfrom + "-" + availableHoursTo).toString());
                }
                else {
                    this.availableHoursArr.Friday = this.availableHoursArr.Friday.concat(',' + (availableHoursfrom + "-" + availableHoursTo).toString());
                }
                this.fridaySlot.push(availableHoursfrom + "-" + availableHoursTo);
            }
            else if (this.selectedDay == 'Saturday') {
                if (this.availableHoursArr.Saturday == "") {
                    this.availableHoursArr.Saturday = this.availableHoursArr.Saturday.concat((availableHoursfrom + "-" + availableHoursTo).toString());
                }
                else {
                    this.availableHoursArr.Saturday = this.availableHoursArr.Saturday.concat(',' + (availableHoursfrom + "-" + availableHoursTo).toString());
                }
                this.saturdaySlot.push(availableHoursfrom + "-" + availableHoursTo);
            }
        }
    }

    //Save Regular hours according to user Time zone
    updateRegularAvailibility() {
        let profileStatusId = JSON.parse(localStorage.getItem('userData')).TeacherProfileStatusId;
        var regularHours = Object.assign({}, this.availableHoursArr);
        regularHours.Sunday = "";
        if (this.availableHoursArr.Sunday != "") {
            this.availableHoursArr.Sunday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Sunday = regularHours.Sunday.concat(CommonService.convertToUTCTime(element) + '-');
                });
                regularHours.Sunday = regularHours.Sunday.substr(0, regularHours.Sunday.length - 1) + ',';
            });
            regularHours.Sunday = regularHours.Sunday.substr(0, regularHours.Sunday.length - 1);
        }

        regularHours.Monday = "";
        if (this.availableHoursArr.Monday != "") {
            this.availableHoursArr.Monday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Monday = regularHours.Monday.concat(CommonService.convertToUTCTime(element) + '-');
                });
                regularHours.Monday = regularHours.Monday.substr(0, regularHours.Monday.length - 1) + ',';
            });
            regularHours.Monday = regularHours.Monday.substr(0, regularHours.Monday.length - 1);
        }

        regularHours.Tuesday = "";
        if (this.availableHoursArr.Tuesday != "") {
            this.availableHoursArr.Tuesday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Tuesday = regularHours.Tuesday.concat(CommonService.convertToUTCTime(element) + '-');
                });
                regularHours.Tuesday = regularHours.Tuesday.substr(0, regularHours.Tuesday.length - 1) + ',';
            });
            regularHours.Tuesday = regularHours.Tuesday.substr(0, regularHours.Tuesday.length - 1);
        }

        regularHours.Wednesday = "";
        if (this.availableHoursArr.Wednesday != "") {
            this.availableHoursArr.Wednesday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Wednesday = regularHours.Wednesday.concat(CommonService.convertToUTCTime(element) + '-');
                });
                regularHours.Wednesday = regularHours.Wednesday.substr(0, regularHours.Wednesday.length - 1) + ',';
            });
            regularHours.Wednesday = regularHours.Wednesday.substr(0, regularHours.Wednesday.length - 1);
        }

        regularHours.Thursday = "";
        if (this.availableHoursArr.Thursday != "") {
            this.availableHoursArr.Thursday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Thursday = regularHours.Thursday.concat(CommonService.convertToUTCTime(element) + '-');
                });
                regularHours.Thursday = regularHours.Thursday.substr(0, regularHours.Thursday.length - 1) + ',';
            });
            regularHours.Thursday = regularHours.Thursday.substr(0, regularHours.Thursday.length - 1);
        }

        regularHours.Friday = "";
        if (this.availableHoursArr.Friday != "") {
            this.availableHoursArr.Friday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Friday = regularHours.Friday.concat(CommonService.convertToUTCTime(element) + '-');
                });
                regularHours.Friday = regularHours.Friday.substr(0, regularHours.Friday.length - 1) + ',';
            });
            regularHours.Friday = regularHours.Friday.substr(0, regularHours.Friday.length - 1);
        }

        regularHours.Saturday = "";
        if (this.availableHoursArr.Saturday != "") {
            this.availableHoursArr.Saturday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Saturday = regularHours.Saturday.concat(CommonService.convertToUTCTime(element) + '-');
                });
                regularHours.Saturday = regularHours.Saturday.substr(0, regularHours.Saturday.length - 1) + ',';
            });
            regularHours.Saturday = regularHours.Saturday.substr(0, regularHours.Saturday.length - 1);
        }

        this.availableHoursArr = regularHours;
        this.calendarService.post("/availability/UpsertTeacherRegularAvailabilityData", this.availableHoursArr,
            new HttpParams().set('profileStatusId', profileStatusId)).subscribe((response: any) => {
                this.toastr.success('We acknowledge that you have Regular Available Hours for coming 6 weeks.');
            });
    }

    //Convert UTC to user Time zone
    convertUTCToUserTimeZone(teacherRegularHours): any {
        var regularHours = Object.assign({}, teacherRegularHours);
        regularHours.Sunday = "";
        if (teacherRegularHours.Sunday != "") {
            teacherRegularHours.Sunday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Sunday = regularHours.Sunday.concat(CommonService.convertUTCToUserTime(element) + '-');
                });
                regularHours.Sunday = regularHours.Sunday.substr(0, regularHours.Sunday.length - 1) + ',';
            });
            regularHours.Sunday = regularHours.Sunday.substr(0, regularHours.Sunday.length - 1);
        }

        regularHours.Monday = "";
        if (teacherRegularHours.Monday != "") {
            teacherRegularHours.Monday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Monday = regularHours.Monday.concat(CommonService.convertUTCToUserTime(element) + '-');
                });
                regularHours.Monday = regularHours.Monday.substr(0, regularHours.Monday.length - 1) + ',';
            });
            regularHours.Monday = regularHours.Monday.substr(0, regularHours.Monday.length - 1);
        }

        regularHours.Tuesday = "";
        if (teacherRegularHours.Tuesday != "") {
            teacherRegularHours.Tuesday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Tuesday = regularHours.Tuesday.concat(CommonService.convertUTCToUserTime(element) + '-');
                });
                regularHours.Tuesday = regularHours.Tuesday.substr(0, regularHours.Tuesday.length - 1) + ',';
            });
            regularHours.Tuesday = regularHours.Tuesday.substr(0, regularHours.Tuesday.length - 1);
        }

        regularHours.Wednesday = "";
        if (teacherRegularHours.Wednesday != "") {
            teacherRegularHours.Wednesday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Wednesday = regularHours.Wednesday.concat(CommonService.convertUTCToUserTime(element) + '-');
                });
                regularHours.Wednesday = regularHours.Wednesday.substr(0, regularHours.Wednesday.length - 1) + ',';
            });
            regularHours.Wednesday = regularHours.Wednesday.substr(0, regularHours.Wednesday.length - 1);
        }

        regularHours.Thursday = "";
        if (teacherRegularHours.Thursday != "") {
            teacherRegularHours.Thursday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Thursday = regularHours.Thursday.concat(CommonService.convertUTCToUserTime(element) + '-');
                });
                regularHours.Thursday = regularHours.Thursday.substr(0, regularHours.Thursday.length - 1) + ',';
            });
            regularHours.Thursday = regularHours.Thursday.substr(0, regularHours.Thursday.length - 1);
        }

        regularHours.Friday = "";
        if (teacherRegularHours.Friday != "") {
            teacherRegularHours.Friday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Friday = regularHours.Friday.concat(CommonService.convertUTCToUserTime(element) + '-');
                });
                regularHours.Friday = regularHours.Friday.substr(0, regularHours.Friday.length - 1) + ',';
            });
            regularHours.Friday = regularHours.Friday.substr(0, regularHours.Friday.length - 1);
        }

        regularHours.Saturday = "";
        if (teacherRegularHours.Saturday != "") {
            teacherRegularHours.Saturday.split(',').forEach(list => {
                list.split('-').forEach(element => {
                    regularHours.Saturday = regularHours.Saturday.concat(CommonService.convertUTCToUserTime(element) + '-');
                });
                regularHours.Saturday = regularHours.Saturday.substr(0, regularHours.Saturday.length - 1) + ',';
            });
            regularHours.Saturday = regularHours.Saturday.substr(0, regularHours.Saturday.length - 1);
        }
        return regularHours;
    }

    showWeeklyAvailibility(e) {
        if (e.target.checked) {
            this.showRegAvailDatalist = true;
        } else {
            this.showRegAvailDatalist = false;
        }
    }

    blockTeacherSpecificTime() {
        let userData = JSON.parse(localStorage.getItem('userData'));
        this.teacherId = userData.Teacher[0].TeacherId;
        this.dateBlockOffTimeFrom = moment(this.FromBlockOfTimeDate).format("YYYY-MM-DD"); 
        this.dateBlockOffTimeTo = moment(this.ToBlockOfTimeDate).format("YYYY-MM-DD");
        let blockHoursFrom;
        let blockHousTo;
        blockHoursFrom = this.blockOfftimefrom.hour + ":" + this.blockOfftimefrom.minute;
        blockHousTo = this.blockOfftimeTo.hour + ":" + this.blockOfftimeTo.minute;
        this.blockAvaialableSlot = {
            AvailabilityId: 0,
            AvailabilityType: "Block",
            TeacherUserId: this.teacherId,
            Title: this.optionalBlockOffTitile,
            StartDateTime: CommonService.convertBlockDateTimeToUTC(this.dateBlockOffTimeFrom, blockHoursFrom),
            EndDateTime: CommonService.convertBlockDateTimeToUTC(this.dateBlockOffTimeTo, blockHousTo),
        }
        if (this.calendarService.blockOffDateTimeValidation(this.dateBlockOffTimeFrom, blockHoursFrom, this.dateBlockOffTimeTo, blockHousTo)) {
            this.saveBlockOffTimeSlot();
            this.optionalBlockOffTitile = null;
        }
    }

    saveBlockOffTimeSlot() {
        this.calendarService.post("/availability/UpsertTeacherSpecificAvailabilityData", this.blockAvaialableSlot, new HttpParams()).subscribe((response: any) => {
            this.teacherCalendar.events.push({
                id: response.AvailabilityId,
                title: response.Title,
                start: CommonService.convertToTimeZone(response.StartDateTime),
                end: CommonService.convertToTimeZone(response.EndDateTime),
                allDay: false,
                className: "pinkCalEvent",
                editable: false,
            });
            this.toastr.success('Teacher is blocked for this slot.');
        });
    }

    blockChkEvent(e) {
        if (e.target.checked) {
            this.blockOfftimefrom = { hour: 15, minute: 30, second: 30 };
            this.blockOfftimeTo = { hour: 16, minute: 30, second: 30 };
        } else {
            this.blockOfftimefrom = { hour: 0.00, minute: 1.0, second: 30 };
            this.blockOfftimeTo = { hour: 23, minute: 59, second: 30 };
        }
    }

    onBack() {
        this.showRegAvailDatalist = true;
        this.calendarService.isAvailabilitySetting = false;
    }
}

