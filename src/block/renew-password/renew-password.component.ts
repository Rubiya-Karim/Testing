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
  selector: 'app-renew-password',
  templateUrl: './renew-password.component.html',
  styleUrls: ['./renew-password.component.scss']
})
export class RenewPasswordComponent {
  setPasswordForm!: FormGroup;
  submitted = false;
  hide = true;
  public renewPasswordSubmitButton: boolean = false;
  strongPassword = false;
  otp:any;
  username:any;
  constructor(
    private toastService: ToastrService,
    private formBuilder: FormBuilder,
    private router: ActivatedRoute,
    private route: Router,
    private loginService: LoginService,
    private messageService: MessageService,
    ) {

     }
    

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
      var anUsername = localStorage.getItem('username');
      var firstname = localStorage.getItem('firstname');
      var lastname = localStorage.getItem('lastname');
      var emailParts = anUsername?.split("@");
      var name = emailParts?.length==2 ? emailParts[0] : null;
      const passwordValue:string = this.f?.['password']?.value;
      return ((passwordValue === name) || (passwordValue === firstname) || (passwordValue === lastname));
    }
  


    setPasswordModel() {
      this.setPasswordForm = this.formBuilder.group({
        password: ['', Validators.compose([Validators.required, 
                                          Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,32}$")
                                        ])],
        confirmPassword: ['', Validators.required],
      },
        {
          validator: [MustMatch('password', 'confirmPassword')]
        });
    }
  
    onRenewPassword() {
      this.submitted = true;
      if (this.setPasswordForm.invalid) {
        return;
      }
      const obj =  {
        "userName": localStorage.getItem('username'),
        "newPassword": this.setPasswordForm.get('password')?.value,
        "confirmNewPassword": this.setPasswordForm.get('confirmPassword')?.value
      }
      // onRenewPwd
      this.loginService.onSubmitOtpCall(obj, localStorage.getItem('OTP')).subscribe(data => {
        if (data?.createPasswordMsg) {
          this.messageService.showMessage(MessageType.Success,data?.createPasswordMsg);
          this.route.navigate(['/login']);
        }
    })
    }
      
    public passwordValidation() {
      if (this.f['confirmPassword']?.errors?.['misMatch']) {
        this.renewPasswordSubmitButton = false;
      } else {
        this.renewPasswordSubmitButton = true;
      }
      // if(validPassword !== this.setPasswordForm.controls['oldPassword'].value && this.setPasswordForm.controls['oldPassword'].value !== "" ){
      //   this.oldPasswordValidation = false;
      //   this.renewPasswordSubmitButton = false;
      // }
      
      // else{
      //   this.oldPasswordValidation = true;
      //   this.renewPasswordSubmitButton = true;
      // }
      
    }
}