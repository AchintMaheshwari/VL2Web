export interface TeacherInvitesModel {
    TeacherInviteId: number;
    TeacherId: number;
    UserFirstName: string;
    UserLastName: string;
    UserEamil: string;
    InviteStatus: string;
    TeacherUserGuid: string;
    TeacherUserName: string;
    CreatedDate: Date;
    ModifiedDate?: Date;
}