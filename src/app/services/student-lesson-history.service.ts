import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';
import { Observable } from 'rxjs';

@Injectable()
export class StudentLessonHistoryService extends CrudService {

    constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService, ) {
        super(http, commonService);
    }

    getStudentHistoryList(): Observable<any> {
        let Id = null;
        if (localStorage.getItem('UserType') == 'Teacher')
            Id = CommonService.getUser().Teacher[0].TeacherId;
        else
            Id = CommonService.getUser().Student[0].StudentId;
        return this.crudService.get<any>("/lesson/GetLessonHistories", new HttpParams()
            .set('Id', Id)
            .set('UserType', localStorage.getItem('UserType')));
    }

    getMobileHistoryList(userId: string, userType: string): Observable<any> {
        return this.crudService.get<any>("/lesson/GetLessonHistories", new HttpParams()
            .set('Id', userId)
            .set('UserType', userType));
    }

    getMobileFavoritesList(): Observable<any> {
        return this.crudService.get<any>("/lesson/GetUserFavoriteItem", new HttpParams());
    }

}