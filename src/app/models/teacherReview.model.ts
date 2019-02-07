export interface TeacherReviewModel {
    ReviewId: number;
    StudentUserId: number;
    TeacherUserId: number;
    LessonId: number;
    Rating : any;
    Comment : string;
    DateReviewed: Date;
    IsApproved: number;
    ApprovedByUserId: number;
    DateApproved: Date
}