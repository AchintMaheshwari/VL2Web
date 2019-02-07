export interface StudentProfileStatusModel {
    StudentProfileStatusId: number;
    StudentId: number;
    StudentProfileId?: number;
    SettingsFlag: boolean;
    QuestionnaireFlag: boolean;
    VideoFlag: boolean;
    ProfileFlag: boolean;
    ProfileCompletionflag: boolean;
    PercentageCompletion: any;
}