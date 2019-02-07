export interface VideoSubmissionsModel {
    VideoSubmissionId: number;
    UserId: number;
    Source: string;
    RawJson: string;
    ExternalUserId: string;
    Name: string;
    Email: string;
    VideoUrl: string;
    Created: Date;
    ClaimedCount: number;
    ReviewedCount: number;
    Location: string;
    FormattedAddress: string;
    Country: string;
    PostalCode: string;
    IsPaid:boolean;
    OtherVideoUrl:String;
}