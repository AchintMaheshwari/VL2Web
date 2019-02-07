export interface TeacherProfileStatusModel {
    TeacherProfileStatusId: number;
    TeacherId: number;
    TeacherProfileId?: number;
    SettingsFlag: boolean;
    RatesFlag: boolean;
    LinkFlag: boolean;
    AvailabilityFlag: boolean;
    ProfileFlag: boolean;
    StripeConnectFlag: boolean;
    ProfileCompletionflag: boolean;
    PercentageCompletion: any;
}