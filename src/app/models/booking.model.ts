import { CalendarEventModel } from "./calendarEvent.model";
import { PaymentModel } from "./payment.model";

export interface BookingModel {
    BookingId: number;
    StudentUserId: number;
    TeacherUserId: number;
    BookingType: string;
    LessonType: string;
    LessonDuration:number;
    LessonPrice:any;
    EventsCount:number;
    OriginalBookingId: number;
	BookingAttempt: number;
	IsRescheduled:boolean;
    BookingDate: Date;
    RescheduledDate?: any;
    Payments:PaymentModel[]
    CalendarEvents: CalendarEventModel[];
}