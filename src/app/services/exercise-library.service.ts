import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ExerciseLibraryService extends CrudService {
  currentexerciseId: any;
  currentExerciseName: string;
  exerciseList: any;
  unfilteredExerciseList: any;
  exerciseSearchList: any = [];
  exerciseId: number = 0;
  exerciseTags: string = "";
  copyExerciseName: any;
  IsAddedFromLibrary: boolean = false;

  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService) {
    super(http, commonService);
  }

  getExerciseList(): Observable<Array<any>> {
    let teacherId = CommonService.getUser().Teacher[0].TeacherId;
    return this.crudService.get<Array<any>>("/planner/GetExerciseList", new HttpParams().set('teacherId', teacherId));
  }

  getExerciseLibraryList(): Observable<Array<any>> {
    var user = CommonService.getUser();
    if (user == null) return null;
    let userId = user.UserId;
    return this.crudService.get<Array<any>>("/planner/GetExerciseLibraryList", new HttpParams().set('userId', userId));
  }

  getKeysCountInExercise(): Observable<Array<any>> {
    var user = CommonService.getUser();
    if (user == null) return null;
    let userId = user.UserId;
    return this.crudService.get<Array<any>>("/planner/GetKeysCountInExercise", new HttpParams().set('userId', userId));
  }

  deleteExercise(): Observable<any> {
    return this.crudService.get("/planner/DeleteExcercise", new HttpParams().set('excerciseId', (this.currentexerciseId).toString()));
  }
}
