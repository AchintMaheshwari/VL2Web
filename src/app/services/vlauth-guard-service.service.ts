import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../common/common.service';

@Injectable()
export class VlauthGuardServiceService implements CanActivate {
  snapshot: any = null;
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {    
    // window.addEventListener('popstate', function (event) {
    //   return Observable.of(false);
    // });
    // if (window.event == undefined)
    //   return Observable.of(false);

    if (window.location.hash.includes('studentscheduling') || window.location.hash.includes('student/teacher-invite/') || window.location.hash.includes('student/gvFeedback') ||
      window.location.hash.includes('signup') || window.location.hash.includes('room/') || window.location.hash.includes('user/lesson-share') || window.location.hash.includes('confirm-account') ||
      window.location.hash.includes('login') || window.location.hash.includes('select-type') || window.location.hash.includes('term-of-service') || window.location.hash.includes('not-found') ||
      window.location.hash.includes('forgot-password') || window.location.hash.includes('no-browser') || window.location.hash.includes('resetpassword') || window.location.hash.includes('oauth2callback') ||
      window.location.hash.includes('Main/LessonLobbyMobile') || window.location.hash.includes('mobile/student/guidedvideofeedback') || window.location.hash.includes('mobile/favorites') || window.location.hash.includes('mobile-lesson-player') ||
      window.location.hash.includes('mobile/history-accordion') || window.location.hash.includes('user/song-share/') || window.location.hash.includes('exercise-share') ||
      window.location.hash.includes('video-share'))
      return Observable.of(true);

    if (localStorage.getItem('userData') != null) {
      if (JSON.parse(localStorage.getItem('userData')).Student[0] != undefined && JSON.parse(localStorage.getItem('userData')).Teacher[0] != undefined)
        return Observable.of(true);
        if (window.location.hash != '#/login') {
          if ((JSON.parse(localStorage.getItem('userData')).Teacher[0] != undefined && window.location.hash.toLowerCase().includes('teacher')) ||
            (JSON.parse(localStorage.getItem('userData')).Student[0] != undefined && window.location.hash.toLowerCase().includes('student')) ||
            (JSON.parse(localStorage.getItem('userData')).Student[0] != undefined && window.location.hash.toLowerCase().includes('teacher/profile')) )
            return Observable.of(true);
        else {
          if (window.location.hash != '#/login' && !CommonService.isSignout) {
            localStorage.clear();
            if (!window.location.hash.includes('#/login?RedirectUrl='))
              this.router.navigateByUrl('/login?RedirectUrl=' + window.location.hash.replace('#', ''));
            else
              this.router.navigateByUrl('login');
          }
        }
      }
      else if (window.location.hash.includes('#/login?RedirectUrl=')) {
        if ((localStorage.getItem('UserType') == 'Teacher' && window.location.hash.toLowerCase().includes('teacher')) || (localStorage.getItem('UserType') == 'Student' && window.location.hash.toLowerCase().includes('student')))
          return Observable.of(true);
        else
          return Observable.of(false);
      }
      else
        return Observable.of(true);
    }
    else {
      if (!window.location.hash.includes('/login'))
        this.router.navigateByUrl('/login?RedirectUrl=' + window.location.hash.replace('#', ''));
    }
  }
}

