import { Component, OnInit } from '@angular/core';
import { ShareButtons } from '@ngx-share/core';
import { MatDialogRef } from '@angular/material';
import { CommonService } from '../../common/common.service';
import { GuidedvideoService } from '../../services/guidedvideo.service';
import { HttpParams } from '../../../../node_modules/@angular/common/http';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {

  UserGuid: string;
  url: string = "";
  imageMaleUrl:string="";
  imageFemaleUrl:string="";

  constructor(public share: ShareButtons, public guidedvideoService: GuidedvideoService, public dialogRef: MatDialogRef<ShareComponent>,
    public commonService: CommonService) { }

  ngOnInit() {
    let userData = CommonService.getUser();
    if (userData != null) {
      this.UserGuid = userData.UserGUID;

      this.url = this.commonService.appEndpoint + "/#/student/socialshare/" + this.UserGuid;
      this.imageMaleUrl= this.commonService.appEndpoint + "/assets/images/SocialShareMale.jpg";
      this.imageFemaleUrl= this.commonService.appEndpoint + "/assets/images/SocialShareFemale.jpg";
      this.url = encodeURI(this.url);
      this.imageMaleUrl = encodeURI(this.imageMaleUrl);
      this.imageFemaleUrl = encodeURI(this.imageFemaleUrl);

      if (userData.Gender == "Male") {
        $('meta[property="og:image"]').attr('content', this.imageMaleUrl);
        $('meta[name="twitter:image"]').attr('content', this.imageMaleUrl);
      } else if (userData.Gender == "Female") {
        $('meta[property="og:image"]').attr('content', this.imageFemaleUrl);
        $('meta[name="twitter:image"]').attr('content', this.imageFemaleUrl);
      }
      // $('meta[property="og:url"]').attr('content', this.url );
    }
  }

  upsertCount(event) {
    console.log(event);
    //if (event != 0) {
      //  this.upsertShareCount();
    //}
  }

  open() {
    console.log('open');
  }

  closed() {
    console.log('closed');
  }

  upsertShareCount() {
    this.guidedvideoService.post('/guidedVideo/updateShareCountByVideoSubmissionId', null, new HttpParams().set('videoSubmissionId', this.guidedvideoService.videoSubmissionId.toString())).subscribe((response: any) => {
    });
  }
}
