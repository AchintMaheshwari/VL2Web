import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';
import { Observable } from 'rxjs/Observable';

export interface Skills {
  value: number;
  skill: string;
  checked: boolean;
}

export interface Worships {
  value: number;
  worship: string;
  checked: boolean;
}

export interface itemData {
  item_id: number;
  item_text: string;
  checked: boolean;
}

@Injectable()
export class LessonsService extends CrudService {
  isStudentAdded: boolean = false;
  lessonsList: any;
  unmodifiedLessonsList: any;
  currentLessonId: number = 0;
  currentLessonName: string;
  currentLessonTags: string;
  currentLessonStudent: string;
  lessonNameEdit: string;
  public static Studentlist: any;
  isShowCreateModel: boolean = false;
  isShowEditModel: boolean = false;
  dialogTitle: string;
  playlistDialogTitle: string;
  IsDeleted: boolean = false;
  dropdownSettings = {};
  dropdownKeySettings = {};
  LessonQueueFromHistory:string;

  selectedStudent: any = null;
  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService) {
    super(http, commonService);
  }

  checkLessonTitle(Title): Observable<any> {
    let userId = CommonService.getUser().UserId;
    return this.crudService.get<any>("/lesson/CheckTitleExist", new HttpParams().set('LessonTitle', Title).set('UserId', userId));
  }

  getAssociatedStudents(): Observable<any> {
    let teacherId = CommonService.getUser().Teacher[0].TeacherId;
    return this.crudService.get<any>("/lesson/GetAssociatedStudentForTeacher", new HttpParams().set('teacherId', teacherId));
  }

  getLessonLibraries(): Observable<Array<any>> {
    var user = CommonService.getUser();
    if (user == null) return null;
    let userId = user.UserId;
    return this.crudService.get<Array<any>>("/lesson/GetLessonLibrary", new HttpParams().set('userId', userId));
  }

  getLessonData(lessonId): Observable<Array<any>> {
    return this.crudService.get<Array<any>>("/lesson/GetLessonData", new HttpParams().set('lessonId', lessonId));
  }

  deleteLessson(): Observable<any> {
    return this.crudService.get("/lesson/DeleteLesson", new HttpParams().set('lessonId', (this.currentLessonId).toString()));
  }

  getExerciseDataById(exerciseId): Observable<Array<any>> {
    return this.crudService.get<Array<any>>("/planner/GetExerciseDataById", new HttpParams().set('exerciseId', exerciseId));
  }

  getLessonUserMapByLessonId(lessonId): Observable<Array<any>> {
    var user = CommonService.getUser();
    if (user == null) return null;
    let userId = user.UserId;
    return this.crudService.get<Array<any>>("/lesson/GetLessonUserMapByLessonId", new HttpParams().set('userId', userId).set('lessonId', lessonId));
  }

  skillList: Skills[] = [
    { value: 0, skill: 'None', checked: false },
    { value: 1, skill: 'Beginner', checked: false },
    { value: 2, skill: 'Intermediate', checked: false },
    { value: 3, skill: 'Expert', checked: false }
  ];

  worshipList: Worships[] = [
    { value: 0, worship: 'None', checked: false },
    { value: 1, worship: 'Baptist', checked: false },
    { value: 2, worship: 'Buddhist', checked: false },
    { value: 3, worship: 'Catholic', checked: false },
    { value: 4, worship: 'Episcopal', checked: false },
    { value: 5, worship: 'Hindi', checked: false },
    { value: 6, worship: 'Jewish', checked: false },
    { value: 7, worship: 'Lutheran', checked: false },
    { value: 8, worship: 'Methodist', checked: false },
    { value: 9, worship: 'Non-Denom', checked: false },
    { value: 10, worship: 'Muslim', checked: false },
    { value: 11, worship: 'Presbyterian', checked: false },
    { value: 12, worship: 'Unitarian', checked: false }
  ];

  genreList: itemData[] = [
    { item_id: 1, item_text: 'Pop', checked: false },
    { item_id: 2, item_text: 'Musical Theatre', checked: false },
    { item_id: 3, item_text: 'Opera', checked: false },
    { item_id: 4, item_text: 'Gospel', checked: false },
    { item_id: 5, item_text: 'Jazz', checked: false },
    { item_id: 6, item_text: 'Hip Hop/R&B', checked: false },
    { item_id: 7, item_text: 'Classical', checked: false },
    { item_id: 8, item_text: 'Folk', checked: false },
    { item_id: 9, item_text: 'Rock', checked: false },
    { item_id: 10, item_text: 'World', checked: false }
  ];

  vocalList: itemData[] = [
    { item_id: 1, item_text: 'Soprano', checked: false },
    { item_id: 2, item_text: 'Countertenor', checked: false },
    { item_id: 3, item_text: 'Mezzo', checked: false },
    { item_id: 4, item_text: 'Tenor', checked: false },
    { item_id: 5, item_text: 'Alto', checked: false },
    { item_id: 6, item_text: 'Baritone', checked: false },
    { item_id: 7, item_text: 'Contralto', checked: false },
    { item_id: 8, item_text: 'Bass', checked: false }
  ];

  keyList: itemData[] = [
    { item_id: 1, item_text: 'A', checked: false },
    { item_id: 2, item_text: 'Ab', checked: false },
    { item_id: 3, item_text: 'B', checked: false },
    { item_id: 4, item_text: 'Bb', checked: false },
    { item_id: 5, item_text: 'C', checked: false },
    { item_id: 6, item_text: 'C#', checked: false },
    { item_id: 7, item_text: 'D', checked: false },
    { item_id: 8, item_text: 'Db', checked: false },
    { item_id: 9, item_text: 'E', checked: false },
    { item_id: 10, item_text: 'Eb', checked: false },
    { item_id: 11, item_text: 'F', checked: false },
    { item_id: 12, item_text: 'F#', checked: false },
    { item_id: 13, item_text: 'G', checked: false },
    { item_id: 14, item_text: 'Gb', checked: false }
  ];

  getDropDownSetting() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  getDropDownKeySetting() {
    this.dropdownKeySettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 6,
      allowSearchFilter: true
    };
  }
}
