import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class StripeConnectService extends CrudService {

  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService, ) {
    super(http, commonService);
  }

  stripeConnecting(code: string): Observable<any> {
    let userData = JSON.parse(localStorage.getItem('userData'));
    return this.crudService.get('/payment/Authorize?teacherId=' + userData.Teacher[0].TeacherId + '&code=' + code).map(teacher => {
      userData.Teacher[0] = teacher;
      localStorage.setItem('userData', JSON.stringify(userData));
    });
  }
}
