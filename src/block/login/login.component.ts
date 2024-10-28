import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { LoginService } from 'src/app/services/login.service';
import { UsersService } from 'src/app/services/users.service';
import { User } from 'src/app/shared/model/user';
import { MessageService, MessageType } from 'src/app/services/message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  token: any;
  wrongPasswordError:boolean = false;
  public loginUserIdError: boolean = false;
  public loginPasswordError: boolean = false;
  public submitButton: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService,
    private userService: UsersService,
    private toastService:ToastrService,
    private commonService:CommonService,
    private messageService: MessageService
    ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  public loginUserIdValidation() {
    const username = this.loginForm.controls['username'].value;

    const domain = username.substring(username.lastIndexOf("@") + 1);
    if (domain.toLowerCase() !== "celcomsolutions.com") {
      this.loginUserIdError = true;
      this.submitButton = false;
    }
    else {
      this.loginUserIdError = false;
      this.submitButton = true;
    }
  }
  
  public loginPasswordValidation() {

    const password = this.loginForm.controls['password'].value;
    if (this.commonService.checkNullOrUndefined(password)) {
      this.loginPasswordError = true;
      this.submitButton = false;
    } else {
      this.loginPasswordError = false;
      this.submitButton = true;
    }
  }

  get f() { return this.loginForm.controls; }

  onClickLogin() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.loginPasswordError = true;
      this.submitButton = false;
      return
    }
    localStorage.clear();
    sessionStorage.clear();

    const obj = {
      "username": this.loginForm.controls['username'].value,
      "password": this.loginForm.controls['password'].value
    }
    const domain = obj.username.substring(obj.username.lastIndexOf("@") + 1);
    if (domain.toLowerCase() !== "celcomsolutions.com") {
      this.loginUserIdError = true;
    }
    localStorage.setItem('username', this.loginForm.controls['username'].value)
    this.wrongPasswordError = false;

    this.loginService.onLogin(obj).subscribe(data => {
      console.log("data", data);
      if (data?.newUser) {
        // new user
        this.router.navigate(['/reset-password']);
      } else if (data?.retryMessage) {
        this.messageService.setError(data?.retryMessage);
        this.wrongPasswordError = true;
      } else if (data?.isPasswordExpired) {
       // this.toastService.error("Password expired for your account.");
       this.messageService.setError("Password expired for your account.")
      }  else {
        if (!this.commonService.checkNullOrUndefined(data?.token)) {
          this.token = data?.token;
          console.log("token", this.token);
          localStorage.setItem('token', this.token);
          this.userService.getUserDetailsByName(localStorage.getItem('username')).subscribe(data => {
           console.log(typeof(data),data)
            var user: User = Object.assign(data);
            localStorage.setItem('firstname', user.firstName);
            localStorage.setItem('lastname', user.lastName);
            localStorage.setItem('roleName',data?.roles?.roleName);
          })
          this.router.navigate(['/dashboard']);
        }
      }
    })
  }
}
