export interface CalendarSyncModel {
    CalendarId: number;
    TeacherUserId: number;
    CalendaryType: string;
    ConnectedToEmail: string;
    LastSyncTime: Date;
    LastSync:number;
    TimeScale: string;
    AddNewAppointments: boolean;
    EnableBlockingTimes: boolean;
    DoNotSetReminders: boolean;
    ReminderBeforeMinutes?: number;
    CalendarSyncResult?: any;
    CreatedOn: Date;
    ModifiedOn?: any;
}
