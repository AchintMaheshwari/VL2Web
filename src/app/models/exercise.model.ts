export interface ExerciseModel {
  ExerciseId :number;
  ExerciseGuid: string;
  ExerciseName :string;
  TrackId ?:number;
  SeqId ?:number;
  CreatedOn :Date;
  ModifiedOn ?:Date;
  CreatedByUserId:number;
  IsCopy :boolean;
  OriginalExerciseId ?:number;
  IsPaid :boolean;
  LibraryType :number;
  Tags:string;
  VideoURL:string;
  Midi:string;
  VocalType:String;
  skillLevel:number;
  IsDeleted:boolean;
  Keys:string;  
  FileType:string;
  ParentExerciseId?:number;
  AccessType:string
 }
