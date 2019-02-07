export interface VideoModel {
    VideoId: number;
    VideoGUID: string;
    VideoName: string;
    CreatedOn: Date;
    ModifiedOn?: Date;
    CreatedByUserId: number;
    ModifiedByUserId: number;
    Tags: string;
    VideoURL: string;
    IsDeleted: boolean;
    LibraryType: number;
    OtherVideoUrl: string;
    AccessType: string;
}
