import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/services/login.service';
import { MessageService, MessageType } from 'src/app/services/message.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPWForm!: FormGroup;
  submitted = false;
  isGenOtp = true;
  isVerifyOtp: boolean = false;
  emailIDInputError:boolean = false;
  OTPInputError:boolean = false;
  hide = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private toastService: ToastrService,
    private messageService: MessageService,
    ) { }
    
  ngOnInit() {
    this.forgotPWForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      OTP: ['', [Validators.required]],
    });
  }

  get f() { return this.forgotPWForm.controls; }

  emailIdValidation() {
    const obj = {
      "username": this.f['username'].value,
    }
    const domain = obj.username.substring(obj.username.lastIndexOf("@") + 1);
    this.isGenOtp = (domain.toLowerCase() !== "celcomsolutions.com") ? true : false;
    this.emailIDInputError = (domain.toLowerCase() !== "celcomsolutions.com") ? true : false;
  }

  OTPRequiredValidation() {
    this.OTPInputError = (this.f['OTP'].value.length == 0) ? true : false;
  }

  onGenerateOTP(isResend:Boolean) {
    this.loginService.onForgotPwd(this.forgotPWForm.get('username')?.value).subscribe(data => {
      if (data?.forgotPasswordMsg) {
        this.messageService.showMessage(MessageType.Success,data?.forgotPasswordMsg);
        if (!isResend) {
          this.isGenOtp = false;
          this.isVerifyOtp = true;
          this.forgotPWForm.get('username')?.disable();
        }
      }
    })
  }

  onClickVerify() {   
    if (this.forgotPWForm.invalid) {
      return;
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    this.loginService.onVerifyOtpCall(this.forgotPWForm.get('username')?.value, this.forgotPWForm.get('OTP')?.value).subscribe(data => {
      if (data?.isValidOtp) {
        const successMessage = `OTP has been verified: ${this.forgotPWForm.get('username')?.value}`;
      this.messageService.showMessage(successMessage,MessageType.Success);

        this.isVerifyOtp = true;
        this.isGenOtp = false;
        localStorage.setItem('username', this.forgotPWForm.get('username')?.value)
        localStorage.setItem('OTP', this.forgotPWForm.get('OTP')?.value)
  
        this.forgotPWForm.get('OTP')?.disable();
        this.router.navigate(['/renew-password']);  
      }
    })
  }
}
