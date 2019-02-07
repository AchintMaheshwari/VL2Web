import { Component, OnInit } from '@angular/core';
import { TeacherProfileComponent } from '../profile.component';
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { TeacherService } from '../../../services/teacher.service';
import { TeacherProfileModel } from '../../../models/teacherProfile.model';

@Component({
  selector: 'app-teacher-courses',
  templateUrl: './teacher-courses.component.html',
  styleUrls: ['./teacher-courses.component.css']
})
export class TeacherCoursesComponent implements OnInit {
  teacherProfile :  TeacherProfileModel;
  constructor(private teacherService : TeacherService ) { }

  ngOnInit() {
    // this.teacherService.getTeacherProfile().then((response: any) => {
    //   this.teacherService.broadCast.subscribe(data=> this.teacherProfile = data );      
    // });      
  }
}
