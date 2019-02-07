export interface LessonModel {
  LessonId: number;
  LessonGuid: string;
  TeacherId: number;
  StudentId: number;
  ModuleName: string;
  LessonName: string;
  CourseModuleId?: null;
  LessonType: number;
  LessonPdf: string;
  LessonMp3: string;
  CreatedOn: Date;
  ModifiedOn?: Date;
  CreatedByUserId: number;
  ModifiedByUserId?: number;
  TransactionId?: number;
  IsPaid: boolean;
  Started: string;
  Updated?: Date;
  Ended: string;
  LessonQueue: string;
  LessonHistory: string;
  IsLessonPlanned: boolean;
  IsLessonQueueChange: boolean;
  ExerciseSets?: (null)[] | null;
  LessonsUserProgressMaps?: (null)[] | null;
  Rooms?: (RoomsModel)[] | null;
  SequencerExercises?: (null)[] | null;
  Price: number;
  Description: string;
  Logo: string;
  Tags: string;
  Student: any | null;
  Users: string;
  IsDeleted: boolean;
  VocalType: string;
  skillLevel: number;
  isGuidedVideoLessonCompleted: boolean;
  LessonAccessType: string;
  IsPlaylist: boolean;
}

export interface RoomsModel {
  RoomId: number;
  RoomKey: string;
  LessonId: number;
  CreatedOn: string;
  LastActivityDate: string;
  RoomLessonStatus?: null;
  RoomRecordingContainerStatus?: null;
  RoomRecordingStatus?: null;
  ChatMessages?: (null)[] | null;
  RoomAttendees?: (null)[] | null;
  RoomRecordings?: (null)[] | null;
  RoomUserMaps?: (null)[] | null;
}
