import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpParams, HttpClient } from '@angular/common/http';
import { CommonService } from '../common/common.service';
import { CrudService } from './crud.service';
import { UploadFile } from 'ngx-uploader';

@Injectable()
export class VideoService extends CrudService {

  videoURL:string='';
  file?: UploadFile;
  isOpenVideoURL: boolean = false;
  isOpenUploadVideo: boolean = false;
  isOpenRecordVideo: boolean = false;
  isOpenOtherVideoUrl:boolean=false;

  videoId: number = 0;
  videoTags: string = "";
  IsAddedFromLibrary: boolean = false;
  inputVideoURL:string='';
  otherVideoUrl:string='';

  videoData: any;
  cloneVideoId: any;
  copyVideoName: any;
  unfilteredVideoList: any;
  videosList: any;
  currentVideoId: number = 0;
  currentVideoName: string;

  constructor(http: HttpClient, commonService: CommonService, private crudService: CrudService) {
    super(http, commonService);
  }

  getVideoLibraryList(): Observable<Array<any>> {
    var user = CommonService.getUser();
    if (user == null) return null;
    let userId = user.UserId;
    return this.crudService.get<Array<any>>("/Video/GetVideosLibrary", new HttpParams().set('userId', userId));
  }


  deleteVideo(): Observable<any> {
    return this.crudService.get("/Video/DeleteVideo", new HttpParams().set('videoId', (this.currentVideoId).toString()));
  }

}
