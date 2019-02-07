import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';
import { Observable } from 'rxjs';

@Injectable()
export class QuestionnaireService extends CrudService {
    vocalStyles: any = [{ "style": "Musical Theatre" },
    { "style": "Jazz" },
    { "style": "Rock" },
    { "style": "Opera" },
    { "style": "Folk" },
    { "style": "Hip Hop" },
    { "style": "Pop" },
    { "style": "Classical" },
    { "style": "Gospel" },
    { "style": "World" },
    { "style": "R&B" },
    { "style": "Heavy Metal" },
    { "style": "Hard Rock" },]
    studentLevels: any = [{ "level": "Student" },
    { "level": "Hobby" },
    { "level": "Professional" }]
    studentPractiseOptions: any = [{ "option": "I would if I knew which ones to use" },
    { "option": "4+ times per week" },
    { "option": "1x per week" },
    { "option": "Occasionally" },
    { "option": "I don't use scales or exercises" },
    { "option": "2-3 times per week" },
    { "option": "Only to warmup before singing" }]
    questionnaireId: number = 0;
    constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService) {
        super(http, commonService);
    }

    getQuestionnaireSubmittedData(user: any): Observable<any> {
        return this.crudService.get<any>("/student/GetStudentQuestionnaireData", new HttpParams().
            set('questionnaireId', this.questionnaireId.toString()).set('userId', user.UserId.toString()));
    }

    getVocalStyles(userId: number): Observable<any> {
        return this.crudService.get<any>("/student/GetStudentVocalStyles", new HttpParams().
            set('questionnaireId', this.questionnaireId.toString()).set('userId', userId.toString()));
    }
}
