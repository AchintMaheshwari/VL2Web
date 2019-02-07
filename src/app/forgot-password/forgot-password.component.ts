import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../services/user.service';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  matcher = new MyErrorStateMatcher();

  username: string = "";
  isFPSubmitFlag: boolean = false;
  isFPProcessing: boolean = false;
  @ViewChild('fpForm') fpForm: any;
  constructor(private userService: UserService, private toastr: ToastrService) { }

  ngOnInit() {
  }

  sendEmailLink() {
    this.isFPSubmitFlag = true;
    if (this.fpForm.valid) {
      this.isFPProcessing = true;
      this.userService.post('/user/SendEmailLink', null, new HttpParams().set('email', this.username)).subscribe((response: any) => {
        if (response === 'Mail Sent' || response === 'User Invalid' || response === 'User not verified') {
          if (response === 'User not verified') {
            this.toastr.warning("You are not a verified user.");
          }
          else {
            this.toastr.success("An email has been sent to your registered email address.");
          }
          this.username = "";
          this.isFPProcessing = false;
          this.fpForm.reset();
        }
        else {
          this.toastr.error("Some problem occured while sending the email. Please try again.");
        }
        this.isFPSubmitFlag = false;
      })
    }
  }
}
