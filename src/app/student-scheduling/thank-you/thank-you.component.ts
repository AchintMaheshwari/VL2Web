import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common/common.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit {
  studentName: string = "";
  constructor(public commonService: CommonService) { }

  ngOnInit() {
    let user = CommonService.getUser();
    this.studentName = user.DisplayName;
  }
}
