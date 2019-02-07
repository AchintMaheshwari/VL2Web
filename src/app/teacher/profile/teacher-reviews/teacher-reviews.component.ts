import { Component, OnInit } from '@angular/core';
import { TeacherProfileModel } from '../../../models/teacherProfile.model';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-teacher-reviews',
  templateUrl: './teacher-reviews.component.html',
  styleUrls: ['./teacher-reviews.component.css']
})
export class TeacherReviewsComponent implements OnInit {

  teacherProfile :  TeacherProfileModel;
  constructor(private teacherService : TeacherService ) { }

  ngOnInit() {
    // this.teacherService.getTeacherProfile().then((response: any) => {
    //   this.teacherService.broadCast.subscribe(data=> this.teacherProfile = data );      
    // });      
  }

}
