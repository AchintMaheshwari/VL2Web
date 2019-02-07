import { Injectable, Input } from '@angular/core';
import { LessonModel } from '../models/lesson.model';
import { CrudService } from './crud.service';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../common/common.service';
import { Node } from '../teacher/tree-view/node';

@Injectable()
export class SharedlibraryService extends CrudService {
  libraryList: any;
  LessonModel: LessonModel;
  @Input() libraryNodes: Array<Node>;
  libraryHistoryNodes: Array<Node>;
  lessonQueue: string = null;
  songList: any[];
  event: any;
  location: string = null;
  copyExerciseName: any;
  userData: any;
  teacherId: number;
  saveItemSource: string = "library";
  isLibrary: Boolean = false;
  isSong: Boolean = false;
  isExercise: Boolean = false;
  isVideo: Boolean = true;
  isStep2: boolean = false;
  isStep3: boolean = false;

  AdvanceSettingExerciseId: number = 0;

  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService) {
    super(http, commonService);

    this.userData = CommonService.getUser();
    if (this.userData == null) return;

    if (this.userData.IsTeacher === 1)
      this.teacherId = this.userData.Teacher[0].TeacherId;
    else
      this.teacherId = parseInt(localStorage.getItem('lobbyTeacherId'));

    if (localStorage.getItem('EditLesson') != null && localStorage.getItem('EditLesson') != "" && localStorage.getItem('EditLesson') != undefined) {
      this.LessonModel = JSON.parse(localStorage.getItem('EditLesson'));
    }
    else {
      this.initialiseLessonModel();
    }
  }

  setlibraryList(data: any[]) {
    this.libraryList = data;
  }
  getlibraryList() {
    return this.libraryList;
  }

  initialiseLessonModel() {
    this.LessonModel = {
      "LessonId": 0,
      "TeacherId": this.teacherId,
      "StudentId": 3,
      "LessonGuid": "994c10bb-bc59-46e5-b721-cd934bdfc486",
      "ModuleName": "",
      "LessonName": "",
      "CourseModuleId": null,
      "LessonType": 0,
      "LessonPdf": '',
      "LessonMp3": '',
      "CreatedOn": new Date(),
      "ModifiedOn": null,
      "CreatedByUserId": this.userData != null ? this.userData.UserId : "",
      "ModifiedByUserId": null,
      "TransactionId": null,
      "IsPaid": false,
      "Started": null,
      "Updated": null,
      "Ended": null,
      "LessonQueue": '',
      "LessonHistory": '',
      "IsLessonPlanned": false,
      "IsLessonQueueChange": false,
      "ExerciseSets": [],
      "LessonsUserProgressMaps": [],
      "Rooms": [],
      "SequencerExercises": [],
      "Description": "",
      "Logo": "default",
      "Price": 0,
      "Tags": "",
      "Student": [],
      "Users": "",
      "IsDeleted": false,
      "VocalType": "",
      "skillLevel": 0,
      "isGuidedVideoLessonCompleted": false,
      "LessonAccessType": "Private",
      "IsPlaylist": false
    }
  }
}
