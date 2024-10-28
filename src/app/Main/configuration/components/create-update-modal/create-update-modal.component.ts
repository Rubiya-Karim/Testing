import { Component, Inject, OnInit, TemplateRef, Type, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators,AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsersService } from 'src/app/services/users.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { CommonService } from 'src/app/services/common.service';
import { RolesService } from 'src/app/services/roles.service';
import { NotificationService } from 'src/app/services/notification.service';
import { MessageService, MessageType } from 'src/app/services/message.service';
import { GeneralConfigsService } from 'src/app/services/general-configs.service';
import { finalize } from 'rxjs/operators';
import { MbeansService } from 'src/app/services/mbeans.service';
import { TrialBillService } from 'src/app/services/trial-bill.service';
import { OperationsDataService } from 'src/app/Main/operations/operations-data.service';
import { Subscription } from 'rxjs';


enum ParentType {
  Users = 1,
  Notification = 2,
  Securityconfig = 3,
  Oracledatabase = 4,
  Mangodatabase = 5,
  Billrun = 6,
  Securityconfigdesc = 7,
  MbeanAttribute = 8,
  TrialBill = 10
}


@Component({
  selector: 'app-create-update-modal',
  templateUrl: './create-update-modal.component.html',
  styleUrls: ['./create-update-modal.component.scss']
})
export class CreateUpdateModalComponent implements OnInit {
  public message: { type: MessageType; text: string } | null = null;
  editClusterForm!: FormGroup;
  @ViewChild('configClusterTemplate') configClusterTemplate!: TemplateRef<any>;
  title: string = "";
  entity: any;
  form!: FormGroup;
  formSecurity!: FormGroup;
  submitted = false;
  isNew!: boolean;
  parentCategory!: ParentType;
  roles: any;
  url: any = window.location.protocol + '//' + window.location.host;
  phoneNumber: any;
  phone_Number: any;
  todayDate!:String;
  isView!:boolean;
  add:boolean= false;
  inputParams: any;
  records: any;
  modalData:any;
  errorMessage: string = '';
  jobExecuteTimeSubscription: Subscription | undefined;
  jobExecuteDateSubscription: Subscription | undefined;
  
  constructor(private commonService: CommonService, public usersService: UsersService, public rolesService: RolesService,
    private formBuilder: FormBuilder, private messageService: MessageService,
    private dialogRef: MatDialogRef<CreateUpdateModalComponent>, private notificationSer: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any, private general: GeneralConfigsService,private mbeanservice: MbeansService, private trialBillService:TrialBillService,
    private operationsDataService:OperationsDataService
    ) {
    this.title = data?.["title"];
    this.entity = data?.["obj"];
    this.isNew = data?.["isNew"];
    this.isView = data?.["isviewbtn"];
    this.parentCategory = data?.["parentType"];
    this.modalData = data;
    if (this.parentCategory === ParentType.Users)
      this.roles = data?.["roles"];
  }

  ngOnInit() {
    if (this.parentCategory === ParentType.Users) {
      this.form = this.formBuilder.group({
        firstName: ['', [Validators.required, Validators.maxLength(24)]],
        lastName: ['', [Validators.required, Validators.maxLength(24)]],
        phoneNumber: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
        displayName: [''],
        roles: ['', Validators.required],
        userName: ['', [Validators.required, Validators.email]]
      })
      if (this.isNew) {
        this.form.get('userName')?.enable();
        // this.form.patchValue({displayName: this.displayNameForUser()});
      }
      else {
        this.form.get('userName')?.disable();
        this.form.patchValue({
          firstName: this.entity.firstName,
          lastName: this.entity.lastName,
          phoneNumber: this.entity.phoneNumber,
          displayName: this.entity.displayName,
          userName: this.entity.userName,
          roles: this.entity.roles
        })
      }
    }
    else if (this.parentCategory === ParentType.Notification) {

      this.form = this.formBuilder.group({
        phone_Number: ['', [Validators.required]]

      })
    }
    else if (this.parentCategory === ParentType.Securityconfig) {
      this.form = this.formBuilder.group({
        configId: this.entity.configId,
        configName: this.entity.configName,
        configCategory: this.entity.configCategory,
        configUnit: this.entity.configUnit,
        configValue: this.entity.configValue,
        encryptedFlag: this.entity.encryptedFlag,
        configDesc: this.entity.configDesc
      })
    }

    else if (this.parentCategory === ParentType.Securityconfigdesc) {
      this.form = this.formBuilder.group({
        configName: this.entity.configName,
        configValue: this.entity.configValue,
        encryptedFlag: this.entity.encryptedFlag,
        configDesc: this.entity.configDesc
      })

    }
    else if (this.parentCategory === ParentType.MbeanAttribute) {
      this.form = this.formBuilder.group({
        mbeanName:this.entity.mbeanName,
        name:this.entity.name,
        value:this.entity.value
      })
    }

  else if (this.parentCategory === ParentType.TrialBill) {
    const theTime = this.operationsDataService.convertTimeToDate(this.entity?.jobExecuteTime);

    this.form = this.formBuilder.group({
      scheduleName:this.entity?.scheduleName,
      jobName:this.entity?.jobName,
      jobExecuteTime:theTime,
      dayOfExecution:this.entity?.dayOfExecution

    })
    this.jobExecuteTimeSubscription = this.form.get('jobExecuteTime')?.valueChanges.subscribe(() => {
      this.validateSelectedDateTime();
    });
    this.jobExecuteDateSubscription = this.form.get('dayOfExecution')?.valueChanges.subscribe(() => {
      this.validateSelectedDateTime();
    });
    
    }
  }

   validateSelectedDateTime() {
    const jobExecuteTime = this.form.get('jobExecuteTime')?.value;
    const dayOfExecution = this.form.get('dayOfExecution')?.value;
    this.errorMessage = this.operationsDataService.validateTime(jobExecuteTime, dayOfExecution);
  }

   ngOnDestroy(){
    if (this.jobExecuteTimeSubscription) {
      this.jobExecuteTimeSubscription.unsubscribe();
    }
    if (this.jobExecuteDateSubscription) {
      this.jobExecuteDateSubscription.unsubscribe();
    }
  }

   getToday():string {
    return this.operationsDataService.getDateForPicker();
  }

  shouldShowSubmit(): boolean {
    return (this.parentCategory == ParentType.Notification || this.parentCategory == ParentType.MbeanAttribute)
  }
  
  isTrialModule(): boolean{
    return (this.parentCategory == ParentType.TrialBill)
  }

  get f() { return this.form.controls; }

  displayNameForUser() {
    var aReturnVal: String = "";
    if (this.isNew)
      aReturnVal = this.f['firstName'].value?.concat(this.f['lastName'].value).slice(0, 12);
    else
      aReturnVal = this.f['displayName'].value;
    return aReturnVal;
  }

  firstNameChanged(event: any) {
    this.form.patchValue({ displayName: this.displayNameForUser() });
  }

  lastNameChanged(event: any) {
    this.form.patchValue({ displayName: this.displayNameForUser() });
  }


  onSubmit() {
    var today = new Date();
    var day = today.getDay();
    var currentMonth = today.getMonth();
    var dayList = ["Sunday", "Monday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "November", "December"];
    var date = today.getDate() + ' ' + monthList[currentMonth] + ' ' + today.getFullYear() + ' ' + dayList[day] + '- OMF Testing Team';
    this.submitted = true;
    if (this.form.invalid) {
      return
    }
    var obj: any;
    if (this.parentCategory == ParentType.Users) {
      obj = {
        "firstName": this.form.controls['firstName'].value,
        "lastName": this.form.controls['lastName'].value,
        "userName": this.form.controls['userName']?.value,
        "displayName": this.form.controls['displayName'].value,
        "role": this.form.controls['roles'].value,
        "phoneNumber": this.form.controls['phoneNumber'].value,
        'baseUrl': this.url,
      }
      if (this.isNew)
        this.createUser(obj);
      else
        this.editUser(obj);
    }
    else if (this.parentCategory == ParentType.Notification) {
      var user = this.commonService.getUserName();
      obj = {
        "message": {
          "templateId": 'testSMS',
          "parameters": [
            {
              "name": 'userName',
              "value": user?.substring(0, user?.lastIndexOf("@"))
            },
            {
              "name": 'today',
              "value": date
            }
          ]
        },
        "receiversFlag": '1',
        "receivers": this.form.controls['phone_Number'].value

      };


      this.sendTestSms(obj);

    }
    else if (this.parentCategory == ParentType.MbeanAttribute) {
      obj = {
        "className": this.form.controls['mbeanName'].value,
        "attributeName": this.form.controls['name'].value,
        "attributeValue": this.form.controls['value']?.value,
        "attributeType" : this.modalData.obj.type,
        "jmxConnectionID": Number(this.modalData.connectionID)
       }
       this.mbeanservice.updateAttribute(obj).subscribe(res=>{
        if (typeof res === 'object' && res !== null) {
          if (res.hasOwnProperty("statusCode") && res.statusCode == 500) {
            this.yes();
            this.handleApiResponse(false, res.description);
          } else {
            this.yes();
            this.handleApiResponse(true, "Value updated successfully!");         
          }
        } else if (res !== "Fields should not be empty or null" && res !== "Access Denied" && res !== "Data already exists with this username:") {
          this.yes();
          this.handleApiResponse(true, "Value updated successfully!");
        } else {
          this.yes();
          this.handleApiResponse(false, "Value update failed!");
        }
      })
      }
    else if (this.parentCategory == ParentType.Securityconfig) {
      obj = this.form?.value;
      this.general.updateConfig(obj).subscribe(res => {
        if (res !== "Fields should not be empty or null" && res !== "Access Denied" && res !== "Data already exists with this username:") {
          this.handleApiResponse(true, "Value updated successfully!");
          this.yes();
        } else {
          this.handleApiResponse(false, "Value update failed!");
          this.yes();
        }
      })

    }
    else if(this.parentCategory == ParentType.TrialBill) {
      const theExecutionTime = this.form.value['jobExecuteTime'];
      if (theExecutionTime) {
        const combinedDateTime = new Date(theExecutionTime);
        const dateSelected = new Date(this.form.value["dayOfExecution"]);
        if (dateSelected <= today   && theExecutionTime < today) {
          this.handleApiResponse(false, "Please select the date and time in future.");
          return
        } 
      }

        const theFormattedTime = theExecutionTime?.toTimeString().split(' ')[0];
        this.entity['dayOfExecution'] = this.form.value['dayOfExecution'];
        this.entity['jobExecuteTime'] = theFormattedTime;
        delete this.entity.createdAt;
        delete this.entity.modifiedAt;
        delete this.entity.nextExecutionTime;
        delete this.entity.lastExecutionTime;

        const successMsg = `Trial Bill Run Job Rescheduled successfully!`;
        const failureMsg = `Trial Bill Run Job Reschedule failed. `;
        this.trialBillService.updateTrialBillSchedule(this.entity).subscribe((res :{code:any, description:string}) => {
          if (this.operationsDataService.isObject(res)) {
            var isSuccess = res.code == 200 ? true : false;
            if (isSuccess) {
              const message = isSuccess ? successMsg : failureMsg;
              this.yes();
              this.handleApiResponse(isSuccess, message);
            } else {
              this.yes();
              this.handleApiResponse(false, failureMsg + res.description);
            }
          }
        },
        (error) => {
          this.yes();
          this.handleApiResponse(false, failureMsg);
         });        
      }
  }
  sendTestSms(obj: any) {
    var data: any;
    this.notificationSer.sendTestSms(obj).subscribe(response => {

      var isSuccess = response.code == 0 ? true : false;
      const dialog: any = {
        template: ConfirmModalComponent,
        data: {
          description: isSuccess ? `Test Message is sent Successfully!` : `Test Message is failed`,
          showNoButton: false,
        }
      }
      this.commonService.openDialog(dialog, (res: any) => {
        if (res) {
          this.yes();
        }
      });
    })

     }

 createUser(obj:any) {
  this.usersService.createUser(obj)
  .pipe(finalize(() => this.resetForm()))
  .subscribe(data => { 
    var isSuccess = data.code == 200 ? true : false;
    const message = isSuccess ? 'User created successfully!' : 'User Creation failed!';
          this.handleApiResponse(isSuccess, message);
        });
 }

 editUser(obj:any) {
  this.usersService.updateUser(obj)
  .pipe(finalize(() => this.resetForm()))
  .subscribe(data => {
    var isSuccess = data.code == 200 ? true : false;
    if (isSuccess) {
      if (localStorage.getItem('username') === obj.userName) {
        localStorage.setItem('firstname', obj?.firstName);
        localStorage.setItem('lastname', obj?.lastName);
        localStorage.setItem('roleName',obj?.role);      
      }
    }
    const message = isSuccess ? 'User updated successfully!' : 'User updation failed!';
          this.handleApiResponse(isSuccess, message);
        });
 }


private handleApiResponse(isSuccess: boolean, messageText: string): void {
  const messageType = isSuccess ? MessageType.Success : MessageType.Error;
  this.message = { type: isSuccess ? MessageType.Success : MessageType.Error, text: messageText };
  this.messageService.showMessage(messageText, messageType);
}

private resetForm() {
    this.form.reset();
    const formValues = this.form.value;
  this.form = this.formBuilder.group({
    });
this.form.patchValue(formValues);
  this.yes();
  }
  public get parentViewComponent(): typeof ParentType {
    return ParentType;
  }

  yes() {
    this.dialogRef?.close(true)
  }
}