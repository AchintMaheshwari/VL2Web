export interface PaymentModel {
    PaymentId: number;
    StudentUserId: number,
    TeacherUserId: number,
    BookingId:number,
    CouponID?: number;
    Amount: number;
    PaymentDate: Date;
    PaymentType:number;
    Status:string;
}
