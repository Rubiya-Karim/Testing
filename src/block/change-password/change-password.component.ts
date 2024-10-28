import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/services/login.service';
import { MessageService, MessageType } from 'src/app/services/message.service';
import { UsersService } from 'src/app/services/users.service';
import { User } from 'src/app/shared/model/user';


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

export function forbiddenNameValidator(forbiddenValues: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (forbiddenValues.indexOf(control.value) !== -1) {
      return { 'forbiddenValues': true };
    }
    return null;
  };
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  setPasswordForm!: FormGroup;
  submitted = false;
  hide = true;
  public disableSubmitButton: boolean = true;
  strongPassword = false;

  constructor (
    private toastService: ToastrService,
    private formBuilder: FormBuilder,
    private router: ActivatedRoute,
    private route: Router,
    private loginService: LoginService,
    private userService: UsersService,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {
    this.getUserDetails();

  }

  getUserDetails() {
    this.userService.getUserDetailsByName(localStorage.getItem('username')).subscribe(data => {
      var user: User = Object.assign(data);
      localStorage.setItem('firstname', user.firstName);
      localStorage.setItem('lastname', user.lastName);
      localStorage.setItem('username', user.userName);
      localStorage.setItem('displayName', user.displayName);
      this.setPasswordModel();

    })
  }

  onPasswordStrengthChanged(event: boolean) {
    this.strongPassword = event;
  }

  get f() {
    return this.setPasswordForm?.controls;
  }
  
  get isFormReady() {
    return this.setPasswordForm;
  }

  forbiddenNamesforPassword():any {
    const anUsername = localStorage?.getItem('username')? localStorage?.getItem('username') : "";
    const firstname = localStorage?.getItem('firstname')? localStorage.getItem('firstname'): "";
    const lastname = localStorage?.getItem('lastname')? localStorage.getItem('lastname'): "";
    const displayName = localStorage?.getItem('displayName')? localStorage.getItem('displayName'): "";
    var emailParts = anUsername?.split("@");
    const name = emailParts?.length==2 ? emailParts[0] : "";
    return [name, firstname, lastname, displayName];
  }


  setPasswordModel(): void {
    this.setPasswordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      password: ['', Validators.compose([Validators.required, 
                                        Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,32}$"), 
                                        forbiddenNameValidator(this.forbiddenNamesforPassword())
                                      ])],
      confirmPassword: ['', Validators.required],
    },
      {
        validator: [MustMatch('password', 'confirmPassword')]
      });
  }

  onChangePassword() {
    this.submitted = true;
    if (this.setPasswordForm.invalid) {
      return;
    }
    const obj = {
      "userName": localStorage.getItem("username"),
      "oldPassword": this.setPasswordForm.controls['currentPassword'].value,
      "newPassword": this.setPasswordForm.controls['password'].value,
      "confirmNewPassword": this.setPasswordForm.controls['confirmPassword'].value
    }
    this.loginService.onChangePwd(obj).subscribe(data => {
      if (data?.changePasswordMsg) {
        this.messageService.showMessage(MessageType.Success,data?.changePasswordMsg);
        this.route.navigate(['/login']);
      }
    })
  }

  public passwordValidation() {
    this.disableSubmitButton =  (this.setPasswordForm.invalid)? true : false;

    
  }

}
