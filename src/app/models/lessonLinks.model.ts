export interface LessonLinksModel {
    LessonLinkId: number;
    TeacherUserId: number;
    LinkGUID: string;
    LinkName: string;
    LessonType: string;
    BookingType: string;
    LessonLength: number;
    LessonPrice: number;
    CouponId?: number;
    CreatedOn: Date;
    ModifiedOn?: any;
    IsDefault: number;
  }
  