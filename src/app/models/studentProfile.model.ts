export interface StudentProfileModel {
  StudentProfileId: number;
  UserId: number;
  Introduction: string;
  DisplayName: string;
  VocalType: string;
  WhereCurrentlySing: string;
  ZipCode: string;
  GoalsForStudy: number;
  OtherGoalForStudy: string;
  VocalStyles: string;
  OtherStyle: string;
  MusicalWorshipBaptist: boolean;
  MusicalWorshipCatholic: boolean;
  MusicalWorshipHindi: boolean;
  MusicalWorshipLutheran: boolean;
  MusicalWorshipNonDenom: boolean;
  MusicalWorshipPresbyterian: boolean;
  MusicalWorshipBuddhist: boolean;
  MusicalWorshipEpiscopal: boolean;
  MusicalWorshipJewish: boolean;
  MusicalWorshipMethodist: boolean;
  MusicalWorshipMuslim: boolean;
  MusicalWorshipUnitarian: boolean;
  LowVocalRange: string;
  HighVocalRange: string;
  CreatedOn: string;
  ModifiedOn: string;
  User?: null;
  CurrentSchoolLevel: string;
  SchoolName: string;
  GraduationYear: number;
  StudentStyles: any;
}