export interface UserActivityModel {
    UserActivityId: number;
    UserId: number;
    DateCreated: Date;
    Activity: string;
    TeacherProfileId?: number;
    StudentProfileId?: number;
}