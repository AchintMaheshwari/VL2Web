import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonService } from '../common/common.service';
import { CrudService } from '../services/crud.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-oauth2callback',
  templateUrl: './oauth2callback.component.html',  
})
export class Oauth2callbackComponent implements OnInit {
  userRole: string;
  Password: string;
  username: string;
  loggedInFlag: boolean;
  constructor(private http : HttpClient ,private router : Router ,public userService : UserService,
    private commonService : CommonService,private activatedRoute: ActivatedRoute ) {
    this.loggedInFlag = true;
    this.userRole = localStorage.getItem("UserType");
   }

  ngOnInit() {
   var fragment : any = this.activatedRoute.fragment;   
   var access_token = fragment._value.split('=')[1];
    this.http.get('https://api.instagram.com/v1/users/self/?access_token='+access_token).subscribe(result=> {        
        this.saveSocialLoginUserProfileInfo(result);       
    });
  }

  saveSocialLoginUserProfileInfo(userData) 
  {
    this.userService.user.UserGUID = userData.data.id;
    this.userService.user.Email = userData.data.username;
    this.userService.user.FirstName = userData.data.full_name
    this.userService.user.LastName = "";
    this.userService.user.IsTeacher = this.userRole === 'Teacher'? 1:0;
    this.userService.user.IsStudent = this.userRole ==='Student'? 1:0;
    if(this.userService.user.IsTeacher === 1) 
    {
      this.userService.user.Teacher[0].ImageURL = userData.data.profile_picture;
      this.userService.user.Student = [];
    } 
    if(this.userService.user.IsStudent === 1) 
    {
      this.userService.user.Student[0].ImageURL = userData.data.profile_picture;
      this.userService.user.Teacher = [];
    }  
    //set userId as password
    this.userService.user.Password = userData.data.id;
    this.userService.post('/user/InsertUserSignUpData',this.userService.user,new HttpParams().set('isSocialLogin','true')).subscribe((result: any) => {
        if(result.result != null ){
          var response = result.result;
          localStorage.setItem('UserType', this.userRole);
          if((this.userRole == "Teacher" && response.IsTeacher === 1) || (this.userRole == "Student" && response.IsStudent === 1)){            
            // set user global TimeZone
            CommonService.userZone = response.TimeZone;
            localStorage.setItem('userData', JSON.stringify(response));
            if(this.userService.userRole === "Teacher"){
              this.commonService.userProfilePic = response.Teacher[0].ImageURL;
              localStorage.setItem("userImageUrl",response.Teacher[0].ImageURL);
            }
            else if(this.userService.userRole === "Student"){
              if(localStorage.getItem('LessonLink') != null){
                let linkId = localStorage.getItem('LessonLink');
                let id = response.Student[0].StudentId;
                this.userService.post('/user/CreateTeacherStudentRelationship', null, new HttpParams().set("linkId",linkId).set("studentId",id))
                .subscribe((resultData: any) => {  
                  localStorage.setItem('associatedTeacher', resultData);          
                });
              }
              else if (localStorage.getItem('InviteGuid') != null) {
                let inviteId = localStorage.getItem('InviteGuid');
                let studentId = response.Student[0].StudentId;
                this.userService.post('/user/CreateTeacherStudentAssociation', null, new HttpParams().set("userId", inviteId)
                  .set("studentId", studentId).set("studentEmail", userData.data.username).
                  set('isSocialLogin', 'true')).subscribe((resultData: any) => {
                  });
              }
              this.commonService.userProfilePic = response.Student[0].ImageURL;
              localStorage.setItem("userImageUrl",response.Student[0].ImageURL);
            }
            localStorage.removeItem('userName');
            localStorage.removeItem('password');
            var data = "username="+userData.data.username+"&password="+userData.data.id+"&grant_type=password" ;
            this.userService.getAuth2AccessToken(this.commonService.apiDevEndpoint+'/token', data).subscribe((result: any) => {
              this.setMenu();
              this.setSession(result);
              this.userService.upsertUserActivity("ActiveStatus");
            });
          }
          else{
            if(this.userRole == "Teacher"){
              alert("You are a Student and you are trying to login as Teacher.");
            }
            else{
              alert("You are a Teacher and you are trying to login as Student.");
            }
          }
        }
        else{
          alert("User login failed. Please try again.");
        }
    });
  }

  setSession(result){ 
    localStorage.setItem('access_token', result.access_token);
    localStorage.setItem('expires_at', result.expires_in);    
  }

  setMenu()
  {
    if(this.userRole == "Teacher")
    {
      this.commonService.MenuList = this.commonService.TeacherMenuList;
      this.router.navigate(['/teacher/dashboard']);
    }
    else if(this.userRole == "Student")
    {
      this.commonService.MenuList = this.commonService.StudentMenuList;
      if(localStorage.getItem('LessonLink') != null){
        this.router.navigate(['/student/schedule/personalsettings']);
      }
      else{
        this.router.navigate(['/student/dashboard']);
      }
    }
  }
}
