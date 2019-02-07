import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpParams, HttpClient } from '@angular/common/http';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';

@Injectable()
export class CountryService {

  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService) {
  }

  getCountryList(): Observable<Array<any>> {
    return this.crudService.get<Array<any>>("/Country/getCountryList", new HttpParams());
  }

}

