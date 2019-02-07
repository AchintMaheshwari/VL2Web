import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';
import { BlobService, UploadConfig } from 'angular-azure-blob-service'
import { Config } from '../models/config.template';
import { LessonsService } from './lessons.service';
import { SharedlibraryService } from './sharedlibrary.service';

@Injectable()
export class MediaFileUploadService {
  File: any;
  FileName: any;
  config: UploadConfig;
  constructor(private crudService: CrudService, private toastr: ToastrService,
    private sharedService: SharedlibraryService, private blob: BlobService, public lessonSer: LessonsService
    ,
  ) { }

  startUpload(fileUpload, UploadFor) {
    if (UploadFor == 'ImageUpload') {
      this.FileName = fileUpload.name;
      this.File = fileUpload;
    }
    else {
      this.FileName = fileUpload.name;
      this.File = fileUpload.nativeFile;
    }
    this.crudService.post('/planner/GetBlobSasToken?filename=' + this.FileName + '&containerName=' + "vl2songs", new HttpParams()).subscribe((response: any) => {
      Config.sas = response;
      if (fileUpload !== null) {
        const baseUrl = this.blob.generateBlobUrl(Config, this.FileName);
        this.config = {
          baseUrl: baseUrl,
          sasToken: Config.sas,
          file: this.File,
          complete: () => {
            this.sharedService.LessonModel.Logo = baseUrl;
            this.toastr.success('Transfer completed!!');
          },
          error: () => {
            console.log('Error !');
            this.sharedService.LessonModel.Logo = null;
          },
          progress: (percent) => {
          }
        };
        this.blob.upload(this.config);
      }
    });
  }

}
