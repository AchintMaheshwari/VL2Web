import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../common/common.service';

@Injectable()
export class BackGaurdService {

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
  }
  canDeactivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {    
    let falg = false;
    window.addEventListener('popstate', function (event) {
      falg = true;
      return Observable.of(false);      
    });
    if(!falg)
    return Observable.of(true);
  }
}
