import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  password: string;
  repeatPassword: string;
  isRPSubmitFlag: boolean = false;
  isRPProcessing: boolean = false;
  isPwdMismatch: boolean = false;
  pwdType: string = "password";
  rptPwdType: string = "password";
  @ViewChild('rpForm') rpForm: any;

  constructor(private userService: UserService, private toastr: ToastrService, private router: Router) {
  }

  ngOnInit() {
  }

  resetPassword() {
    if(!this.isPwdMismatch){
    this.isRPSubmitFlag = true;
    if (this.rpForm.valid) {
      this.isRPProcessing = true;
      this.userService.post('/user/ResetPassword', null, new HttpParams().set('userGuid', this.router.url.split('/')[2]).
        set("password", this.password)).subscribe((response: any) => {
          if (response) {
            this.toastr.success("Password reset successfully.").onHidden;
            this.rpForm.reset();
            this.router.navigateByUrl('');
          }
          else {
            this.toastr.error("Some problem occured while reseting the email. Please try again.");
          }
          this.isRPSubmitFlag = false;
          this.isRPProcessing = false;
        })
    }
  }
  }

  showPassword(type) {
    if (this.password != "") {
      if (type === "password") {
        this.pwdType = "text";
      }
      else {
        this.pwdType = "password";
      }
    }
  }

  verifyPassword() {
    this.isPwdMismatch = false;
    if (this.password === "") {
      this.pwdType = "password";
    }
    if (this.repeatPassword === "") {
      this.rptPwdType = "password";
    }
    if (this.password != "" && this.repeatPassword != "" && this.password != this.repeatPassword) {
      this.isPwdMismatch = true;
    }
    else {
      this.isPwdMismatch = false;
    }
  }

  showRptPassword(type) {
    if (this.repeatPassword != "") {
      if (type === "password") {
        this.rptPwdType = "text";
      }
      else {
        this.rptPwdType = "password";
      }
    }
  }
}
