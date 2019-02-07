export interface SongsModel {
    SongId: number;
    NoteflightScoreID: string;
    Label: string;
    Slug: string;
    GroupEx: number;
    Tempo: string;
    HFNumber: string;
    Publisher: string;
    CreatedOn: Date;
    ModifiedOn?: Date;
    CreatedByUserId: number;
    ModifiedByUserId: number;
    AudioFile: string;
    MidiFile: string;
    Artist: string;
    VideoUrl: string;
    JumpPoints: any;
    Lyrics: string;
    TransLations: string;
    Tags: string;
    LibraryType: number;
    Genre: string,
    Keys: string,
    VocalType: string,
    SkillLevel: number,
    Worship?: number,
    FileType: string
}