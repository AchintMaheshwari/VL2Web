import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common/common.service';
import { MenuModel } from '../../models/menu.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { StudentService } from '../../services/student.service';

declare var LivePlayer: any;
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})

export class MenuComponent implements OnInit {

  public isCollapsed: boolean;
  public isCollapsedss: boolean;

  constructor(private mScrollbarService: MalihuScrollbarService, public commonService: CommonService,
    private router: Router, private studentService: StudentService) {
    this.isCollapsed = false;
    this.isCollapsedss = false;
  }

  ngOnInit() {
    if (CommonService.getUser() != null && CommonService.getUser() != undefined)
      this.setMenu();
  }

  setMenu() {
    var userRole = localStorage.getItem('UserType');
    this.commonService.MenuList = [];

    if (userRole == "Teacher") {
      this.commonService.MenuList = this.commonService.TeacherMenuList;
    }
    else if (userRole == "Student") {
      this.studentService.getStudentAssociatedTeachers().subscribe((response: any) => {
        if (response != null && response.length > 1) {
          this.commonService.bookLessonUrl = 'student/index';
        }
        else {
          this.commonService.bookLessonUrl = 'student/schedule/personalsettings';
        }
        this.commonService.MenuList = this.commonService.StudentMenuList;
      })
    }
  }

  collapseEvent() {
    $(".menu-wrap").removeClass("on");
  }

}
