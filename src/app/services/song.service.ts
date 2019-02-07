import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpParams, HttpClient } from '@angular/common/http';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';

@Injectable()
export class SongsService extends CrudService {
  songData: any;
  cloneSongId: any;
  copySongName: any;
  unfilteredSongList: any;
  songsList: any;
  songId: number = 0;
  songTags: string = "";
  currentSongId: number = 0;
  currentSongName: string;
  IsAddedFromLibrary: boolean = false;
  libraryList:any;
  
  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService) {
    super(http, commonService);
  }

  getLessonPlannerLibraryList(): Observable<Array<any>> {
    var user = CommonService.getUser();
    if (user == null) return null;
    let userId = user.UserId;
    let teacherId;
    if (localStorage.getItem('UserType') === "Student") {
      teacherId = JSON.parse(localStorage.getItem('lobbyTeacherId'));
    }
    else if (localStorage.getItem('UserType') === "Teacher") {
      teacherId = user.Teacher[0].TeacherId;
    }
    else {
      return null;
    }
    let systemUserId= CommonService.systemUserId.toString();
    return this.crudService.get<Array<any>>("/planner/GetLessonPlannerLibraryList", new HttpParams().set('userId', userId).set('systemUserId',systemUserId));
  }

  getSongLibraryList(): Observable<Array<any>> {
    var user = CommonService.getUser();
    if (user == null) return null;
    let userId = user.UserId;
    return this.crudService.get<Array<any>>("/song/GetSongsLibrary", new HttpParams().set('userId', userId));
  }

  getKeysCount(): Observable<Array<any>> {
    var user = CommonService.getUser();
    if (user == null) return null;
    let userId = user.UserId;
    return this.crudService.get<Array<any>>("/song/GetKeysCountInSongs", new HttpParams().set('userId', userId));
  }

  deleteSong(): Observable<any> {
    return this.crudService.get("/song/DeleteSong", new HttpParams().set('songId', (this.currentSongId).toString()));
  }
}
