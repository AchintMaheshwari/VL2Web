import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { HttpParams } from '../../../node_modules/@angular/common/http';
import { ToastrService } from '../../../node_modules/ngx-toastr';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss']
})
export class ConfirmEmailComponent implements OnInit {

  constructor(public userService: UserService, private toastr: ToastrService) { }

  ngOnInit() {
  }

  resendConfirmationMail() {
    var userDetail = {
      Email: this.userService.user.Email,
      UserGuid: this.userService.user.UserGUID
    };
    this.userService.post('/user/ResendConfirmationEmail', userDetail, new HttpParams())
      .subscribe((response: any) => {
        if (response) {
          this.toastr.success("Confirmation Email resent successfully.")
        }
        else {
          this.toastr.error("Confirmation Email could not be sent. Please try again.")
        }
      });
  }

}
