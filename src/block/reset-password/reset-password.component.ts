import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/services/login.service';
import { MessageService, MessageType } from 'src/app/services/message.service';

// custom validator to check that two fields match
export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl?.errors && !matchingControl?.errors['misMatch']) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    // set error on matchingControl if validation fails
    if (control?.value !== matchingControl?.value) {
      matchingControl?.setErrors({ misMatch: true });
    } else {
      matchingControl?.setErrors(null);
    }
  }
}


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  setPasswordForm!: FormGroup;
  submitted = false;
  hide = true;
  public resetPasswordSubmitButton: boolean = false;
  strongPassword = false;

  constructor(
    private toastService: ToastrService,
    private formBuilder: FormBuilder,
    private router: ActivatedRoute,
    private route: Router,
    private loginService: LoginService,
    private messageService: MessageService,
    ) { }
    

    ngOnInit(): void {
      this.setPasswordModel();
    }
  
    onPasswordStrengthChanged(event: boolean) {
      this.strongPassword = event;
    }
  
    get f() {
      return this.setPasswordForm.controls;
    }
    
    isPasswordSameAsUsername():Boolean {
      var anUsername = localStorage.getItem('userName');
      var emailParts = anUsername?.split("@");
      var name = emailParts?.length==2 ? emailParts[0] : null;
      return ((this.setPasswordForm.controls['password'].value) === name);
    }
  
  
    setPasswordModel() {
      this.setPasswordForm = this.formBuilder.group({
        password: ['', Validators.compose([Validators.required, 
                                          Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,32}$")
                                        ])],
        oldPassword: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
        {
          validator: [MustMatch('password', 'confirmPassword')]
        });
    }
  
    onResetPassword() {
      this.submitted = true;
      if (this.setPasswordForm.invalid) {
        return;
      }
      const obj = {
        "userName": localStorage.getItem('username'),
        "oldPassword": this.setPasswordForm.controls['oldPassword'].value,  
        "newPassword": this.setPasswordForm.controls['password'].value,
        "confirmNewPassword": this.setPasswordForm.controls['confirmPassword'].value
      }
      // onResetPwd
      this.loginService.onResetPwd(obj).subscribe(data => {
        if (data?.resetPasswordMsg) {
          this.messageService.showMessage(MessageType.Success,data?.resetPasswordMsg);
          this.route.navigate(['/login']);
        }
      })
    }

    public passwordValidation() {
      if (this.f['confirmPassword']?.errors?.['misMatch']) {
        this.resetPasswordSubmitButton = false;
      } else {
        this.resetPasswordSubmitButton = true;
      }
      // if(validPassword !== this.setPasswordForm.controls['oldPassword'].value && this.setPasswordForm.controls['oldPassword'].value !== "" ){
      //   this.oldPasswordValidation = false;
      //   this.resetPasswordSubmitButton = false;
      // }
      
      // else{
      //   this.oldPasswordValidation = true;
      //   this.resetPasswordSubmitButton = true;
      // }
      
    }
}
