import { Component} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { MatDialog} from '@angular/material/dialog';
import { CommonService } from '../../../services/common.service';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { CreateUpdateModalComponent } from 'src/app/shared/components/create-update-modal/create-update-modal.component';
import { ToastrService } from 'ngx-toastr';
import { MessageService, MessageType } from 'src/app/services/message.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-notification-channel',
  templateUrl: './notification-channel.component.html',
  styleUrls: ['./notification-channel.component.scss'],
  animations: [
    trigger('rotate', [
      state('expanded', style({ transform: 'rotate(-180deg)' })),
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      transition('expanded <=> collapsed', animate('0.3s ease-in-out'))
    ])
  ]
})
export class NotificationChannelComponent {
  testSmsForm!: FormGroup;
  showTableAndForm: boolean = false;
  showEmailTableAndForm: boolean = false;
  showEmaillable:boolean = true;
  showTeamsTableandForms: boolean = false;
  editMode: boolean = false;
  editedSmsData: any = null;
  editSmsMode: boolean= false;
  allSms: any
  editingRowKey: any;
  rows:any;
  smsData: any;
  tableData: any;
  smsAccordionOpen!: boolean;
  emailAccordionOpen!: boolean;
  teamsAccordionOpen!: boolean;
  teamsContent = `teamsChannelName": "Teams Notifications Channel - OMF Testing`;
  formSms!: FormGroup;
  formEmail!: FormGroup;
  formTeams!: FormGroup;
  host_url: any;
  open: boolean = true;
  disabled: boolean = true;
  successMessage: string | null = null;
  emailSuccessMessage: string | null = null;
  teamsSuccessMessage: string | null = null;
  showSmsAccordionContent: boolean = true;
  teamsData: any;
  hasAccess: boolean = true;
  smsDataConfig!: any
  emailDataConfig!: any;
  isEditMode: boolean = false;
  emailDataToEdit: any;
  dialogRef: any;
  formData: any;
  username: any;
  selectedMethod: string = '';
  teamsid: any;
  port: any;
  method: any;
  hosturl: any;
  hostUrl: any;
  meth: any;
  param: any;
  emailhost: any;
  emailport: any;
  emailuser: any;
  emailpass: any;
  smsGETParameters = ["Query", "Path", "Header"];
  smsPOSTParameters = ["Query", "Path", "Header", "Body"];
  public message: { type: MessageType; text: string } | null = null;
  submitted!: boolean;
  expandedRows: number[] = [];
  i: number = 0;
  expandedRowsAccordion1: number[] = [];
  expandedRowsAccordion2: number[] = [];
  expandedRowsAccordion3: number[] = [];
  public disableSubmitButton: boolean = true;
  response: any;
  sortCategory = 'channelName';
  totalRecords: number = 0;
  pageSize: number = 1;
  pageIndex: number = 0;
  sortDirec: 'asc' | 'desc' = "asc";

  constructor(private fb: FormBuilder, private notificationSer: NotificationService, private dialog: MatDialog,
    private commonService: CommonService, private toast: ToastrService, private messageService: MessageService,) { }

  ngOnInit(): void {
    this.getEmail();
    this.getTeamsChannel();
    
    this.getSmsConfig()

    this.formEmail = this.fb.group({
      emailMethod: new FormControl(['SMTP']),
      url: [''],
      port: [''],
      userName: [''],
      password: ['', Validators.required]
    });
    this.formTeams = this.fb.group({
      TeamsName: [''],
      urlhost: ['', Validators.required],
    });

  }
  refreshData(event:any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getTeamsChannel();
  }
  removeParameter(index: number) {
    this.parametersFormArray.removeAt(index);
  }

  get parametersFormArray(): FormArray {
    return this.formSms.get('smsParameter') as FormArray;
  }

  addParameter() {
    this.parametersFormArray.push(
      this.fb.group({
        paramType: ['Query'],
        paramName: [''],
        paramValue: ['']
      })
    );
  }
  get f() {
    return this.formEmail?.controls;
  }



  saveSms() {
    if (this.formSms.valid) {
      const formData = this.formSms.value;

      if (this.editMode) {
          formData.id = this.smsData.id;
          this.notificationSer.updateSmsConfiguration(formData).subscribe((response) => {
            var isSuccess = !response ? true : false;

            const message = isSuccess ? 'SMS updated successfully!' : 'SMS updation failed';
            this.handleApiResponse(isSuccess, message);
            this.successMessage = "Config Updated";
            this.formSms.reset();
            this.editMode = false;
            this.showTableAndForm = false;
            this.getSmsConfig()
  
          },
            (error) => {
              this.handleApiResponse(false, 'SMS updation failed');
            }
          );
      }

      else {
        this.notificationSer.sendSmsConfiguration(formData).subscribe((response) => {
          if (response !== "Sms host, Request Type, and Parameters must not be null") {
            this.successMessage = "Config Added";
            this.formSms.reset();
            this.showTableAndForm = false;
            this.getSmsConfig()
          }
          var isSuccess = !response ? true : false;

          const message = isSuccess ? 'SMS added successfully!' : 'SMS addition failed';
          this.handleApiResponse(isSuccess, message);
        },
          (error) => {
            this.handleApiResponse(false, 'SMS addition failed');
          }
        );


      }
    }
  }
  private handleApiResponse(isSuccess: boolean, messageText: string): void {
    const messageType = isSuccess ? MessageType.Success : MessageType.Error;
    this.message = { type: messageType, text: messageText };
    this.messageService.showMessage(messageText, messageType);

  }
  getSmsConfig() {
    this.notificationSer.getAllSms().subscribe((response) => {
      this.smsData = response;
      this.smsDataConfig = {
        list: this.smsData?.smsParameter,
        columns: [
          { key: 'paramType', label: 'Type' },
          { key: 'paramName', label: 'Name' },
          { key: 'paramValue', label: 'Value' },
        ],
        uniqueKey: 'paramName'
      };      
      this.showTableAndForm = (response?.length == 0 || (typeof response === 'object' && response !== null && response.hasOwnProperty("id") && response.id == null)) ? true : false
  //    if (this.showTableAndForm) {
        this.formSms = this.fb.group({
          smsHost: ['', Validators.required],
          smsRequesType: ['GET', Validators.required],
          smsParameter: this.fb.array([])
        });
        this.addParameter();
  //    }
    }
    );

  }

  editSms(resp: any) {
    this.formSms.patchValue({
      smsHost: resp.smsHost,
      smsRequesType: resp.smsRequesType,
    });
    this.patchSmsParameterValues(resp.smsParameter);

    this.editMode = true;
    this.showTableAndForm = true;
  }

  patchSmsParameterValues(values: any[]) {
    this.parametersFormArray.clear(); // Clear existing items in the form array
    values.forEach(item => {
      this.parametersFormArray.push(this.fb.group(item));
    });
  }

  sendTestSms() {
    this.dialogRef = this.dialog.open(CreateUpdateModalComponent, { data: { title: "SMS to be sent phone number", parentType: 2 } });
  }

  sendTestEmail(obj: any) {
    var today = new Date();
    var day = today.getDay();
    var currentMonth = today.getMonth();
    var dayList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "November", "December"];
    var date = today.getDate() + ' ' + monthList[currentMonth] + ' ' + today.getFullYear() + ' ' + dayList[day] + '- OMF Testing Team';

    var user_name = this.commonService.getUserName();
    obj = {
      "message": {
        "templateId": 'testEmail',
        "parameters": [
          {
            "name": 'userName',
            "value": user_name?.substring(0, user_name?.lastIndexOf("@"))
          },
          {
            "name": 'today',
            "value": date

          }
        ]
      },
      "receiversFlag": '1',
      "receivers": user_name

    };
    var data: any;
    this.notificationSer.sendTestEmail(obj).subscribe((response) => {
      var isSuccess = response.code == 0 ? true : false;

      const message = isSuccess ? 'Test Email sent successfully!' : 'Test Email sending failed!';
      this.handleApiResponse(isSuccess, message);
    },
      (error) => {
        this.handleApiResponse(false, 'Test Email sending failed!');
      }
    );
  }

  sendTestTeams(obj: any) {
    var today = new Date();
    var day = today.getDay();
    var currentMonth = today.getMonth();
    var dayList = ["Sunday", "Monday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "November", "December"];
    var date = today.getDate() + 'th' + ' ' + monthList[currentMonth] + ' ' + today.getFullYear() + ' ' + dayList[day] + '- OMF Testing Team';

    var user_name = this.commonService.getUserName();
    obj = {
      "message": {
        "templateId": 'testTeamsMsg',
        "parameters": [
          {
            "name": 'userName',
            "value": user_name?.substring(0, user_name?.lastIndexOf("@"))
          },
          {
            "name": 'today',
            "value": date

          }
        ]
      },
      "receiversFlag": '1',
      "receivers": obj.channelUrl

    };
    var data: any;
    this.notificationSer.sendTestTeams(obj).subscribe(response => {
      var isSuccess = response.code == 0 ? true : false;

      const message = isSuccess ? 'Teams Test message sent successfully!' : 'Teams Test message sending failed!';
      this.handleApiResponse(isSuccess, message);
    },
      (error) => {
        this.handleApiResponse(false, 'Teams Test message sending failed!');
      }
    );
  }



  cancelEdit() {
    this.editMode = false;
    this.editedSmsData = null;
    this.showTableAndForm = false;
    this.formSms.reset();
  }
  cancelEditEmail() {
    this.isEditMode = false;
    this.emailDataToEdit = null;
    this.showTableAndForm = true;
    this.formEmail.reset();
    this.showEmaillable = true;

  }


  removeSmsConfiguration(id: any): void {
    const obj: any = {
      template: ConfirmModalComponent,
      data: {
        description: `Delete the selected <br> SMS Configuration?`,
        image:"assets/images/trash-red-outline.svg",
        showNoButton: true,
        yesButton: "Delete",
        id
      }
    }
    this.commonService.openDialog(obj, (res: any) => {
      if (res) {
        this.notificationSer.removeSmsConfiguration(id).subscribe(data => {
          var isSuccess = !data ? true : false;

          const dialog: any = {
            template: ConfirmModalComponent,
            data: {
              description: isSuccess ? `Sms deleted <br> Successfully!` : `Sms deletion <br> failed`,
              showNoButton: false,
            }
          }
          this.commonService.openDialog(dialog, (res: any) => {
            if (res) {
              this.commonService.hideDialog();
              this.getSmsConfig();    
            }
          });
          this.successMessage = '';

        })
      }
    });
  }

  getEmail() {
    this.notificationSer.getEmail().subscribe((response: any) => {

      if (response.length == 0) {
        this.showEmailTableAndForm = true;
      }
      else {
        this.showEmailTableAndForm = false;
      }
      response?.forEach((response: any) => {
        this.hosturl = response?.emailHost;
        this.port = response?.emailPort;
      })
      this.rows = response;
      
      this.emailDataConfig = {
        list: this.rows,
        columns: [
          { key: 'emailHost', label: 'Team Name' },
          { key: 'emailPort', label: 'URL' },
          // { key: 'Action', label: 'Action', type: 'action', edit: true, view: false, delete: true, testEmail: true }
        ],
        uniqueKey: 'channelName'
      }

    });
  }
  editEmail(data: any) {
    data.list.forEach((data: any) => {
      this.emailhost = data?.emailHost;
      this.emailport = data?.emailPort;
      this.emailuser = data?.emailUser;
      this.emailpass = data?.emailPassword;
    })
    this.formEmail.patchValue({
      url: this.emailhost,
      port: this.emailport,
      emailMethod: "SMTP",
      userName: this.emailuser,
      password: this.emailpass,
    });

    this.isEditMode = true;
    this.emailDataToEdit = data;
    //this.cancelEdit();
    this.showEmailTableAndForm = false;

  }
  saveEmail() {
    if (this.formEmail.valid) {
      const formData = this.formEmail.value;

      const payload = {
        emailHost: formData.url,
        emailPort: formData.port,
        emailUser: formData.userName,
        emailPassword: formData.password,
      };

      if (this.isEditMode) {
        if (this.emailDataToEdit) {
          this.emailDataToEdit.emailHost = payload.emailHost;
          this.emailDataToEdit.emailPort = payload.emailPort;
          this.emailDataToEdit.emailUser = payload.emailUser;
          this.emailDataToEdit.emailPassword = payload.emailPassword;

          this.notificationSer.updateEmail(this.emailDataToEdit).subscribe((response) => {
            if (response !== "Fields should not be empty or null" && response !== "Access Denied" && response !== "Data already exists with this username:") {
              this.emailSuccessMessage = "Config Updated";
              this.isEditMode = false;
              this.emailDataToEdit = null;
              this.showEmailTableAndForm = false;
              this.getEmail();
            }
            var isSuccess = !response ? true : false;

            const message = isSuccess ? 'Email updated successfully!' : 'Email updation failed';
            this.handleApiResponse(isSuccess, message);
          },
            (error) => {
              this.handleApiResponse(false, 'Email updation failed');
            }
          );
        }
      }


      else {
        this.notificationSer.sendEmail(payload).subscribe((response) => {
          if (response !== "Fields should not be empty or null" && response !== "Access Denied" && response !== "Data already exists with this username:") {
            this.emailSuccessMessage = "Config Added";
            this.formEmail.reset();
            this.getEmail();
          }
          var isSuccess = !response ? true : false;

          const message = isSuccess ? 'Email added successfully!' : 'Email addition failed due to Data already exists with this username';
          this.handleApiResponse(isSuccess, message);
        },
          (error) => {
            this.handleApiResponse(false, 'Email addition failed');
          }
        );


      }
    }
  }


  removeEmailConfiguration(id: any) {
    const obj: any = {
      template: ConfirmModalComponent,
      data: {
        description: `Delete the <br> config Added?`,
        image: "assets/images/trash.png",
        showNoButton: true,
        yesButton: "Delete",
        id
      }
    }
    this.commonService.openDialog(obj, (res: any) => {
      if (res) {
        this.notificationSer.removeEmailConfiguration(id).subscribe(data => {
          var isSuccess = !data ? true : false;

          const dialog: any = {
            template: ConfirmModalComponent,
            data: {
              description: isSuccess ? `Email deleted <br> Successfully!` : `Email deletion <br> failed`,
              showNoButton: false,
            }
          }
          this.commonService.openDialog(dialog, (res: any) => {
            if (res) {

              this.yes();
            }
          });
          this.formEmail.reset({
            hostUrl: '',
            method: 'GET',
            parameters: []
          });

          this.emailSuccessMessage = '';
          this.formEmail.reset();
          this.showEmailTableAndForm = true;
          if(this.showEmailTableAndForm == true){
            this.showEmaillable = false;
          }

        })
      }
    });
  }
  addTeams() {
    if (this.formTeams.valid) {
      const formData = this.formTeams.value;

      const payload = {
        id: this.editingRowKey,
        channelName: formData.TeamsName,
        channelUrl: formData.urlhost,
      };
      if (this.editingRowKey) {
        this.notificationSer.updateTeamChannel(payload).subscribe((response) => {
          var isSuccess = !response ? true : false;

          const message = isSuccess ? 'Teams updated successfully!' : 'Teams updation failed';
          this.handleApiResponse(isSuccess, message);
        },
          (error) => {
            this.handleApiResponse(false, 'Teams updation failed');
          }
        );

        this.editingRowKey = null;
        this.formTeams.reset();
        this.getTeamsChannel();
        this.emailAccordionOpen = false;

      } else {
        this.teamsAccordionOpen = true;
        this.notificationSer.addTeamsChannel(payload).subscribe((response) => {
          if (response !== "Channel name and ChannelUrl must not be null or empty" && response !== "Access Denied") {
            this.teamsSuccessMessage = "Config Added";
            this.teamsAccordionOpen = false;
            this.emailAccordionOpen = false;
            this.formTeams.reset();
            this.teamsAccordionOpen = false;
            this.getTeamsChannel();
          }
          var isSuccess = !response ? true : false;

          const message = isSuccess ? 'Teams added successfully!' : 'Teams addition failed';
          this.handleApiResponse(isSuccess, message);
        },
          (error) => {
            this.handleApiResponse(false, 'Teams addition failed');
          }
        );


      }
    }
  }

  getTeamsChannel() {
    this.notificationSer.getallchannels(this.pageIndex,
      this.pageSize,
      this.sortDirec,this.sortCategory).subscribe((response: any) => {
        if (!this.commonService.checkForAccessDenied(response)) {
          this.hasAccess = true;
          if (response?.code == 200 && response?.hasOwnProperty("records") && Array.isArray(response?.records)) {
            this.rows = response?.records;
            this.totalRecords = response?.totalRecords;

          if (this.rows.length == 0) {
            this.showTeamsTableandForms = true;
          }
          else {
            this.showTeamsTableandForms = false;
          }
          this.tableData = {
            list: this.rows,
            columns: [
              { key: 'channelName', label: 'Team Name' },
              { key: 'channelUrl', label: 'URL' },
              { key: 'Action', label: 'Action', type: 'action', edit: true, view: false, delete: true, testTeams: true },
            ],
            uniqueKey: 'channelName'
          };
        }
        } else {
          this.hasAccess = false;
        }
  });
  
}

  cancelTeamsEdit() {
    this.editingRowKey = null;
    this.formTeams.reset();
    this.showTeamsTableandForms = false;

  }

  handleEditRow(row: any) {
    this.showTeamsTableandForms = true;
    this.formTeams.patchValue({
      TeamsName: row.channelName,
      urlhost: row.channelUrl,
    });
    this.editingRowKey = row.id;
  }
  handleDeleteRow(row: any) {
    const obj: any = {
      template: ConfirmModalComponent,
      data: {
        description: `Delete the <br> selected Team Channel?`,
        image: "assets/images/trash.png",
        showNoButton: true,
        yesButton: "Delete",
        id: row.id
      }

    }
    this.commonService.openDialog(obj, (res: any) => {
      if (res) {
        this.notificationSer.deleteTeamChannel(obj.data.id).subscribe(data => {
          var isSuccess = !data ? true : false;

          const dialog: any = {
            template: ConfirmModalComponent,
            data: {
              description: isSuccess ? `Teams deleted <br> Successfully!` : `Teams deletion <br> failed`,
              showNoButton: false,
            }
          }
          this.commonService.openDialog(dialog, (res: any) => {
            if (res) {

              this.yes();
            }
          });
          this.getTeamsChannel();
        })
      }
    });
  }

  public validateFormControl() {
    this.disableSubmitButton = (this.formEmail.invalid) ? true : false;
    this.disableSubmitButton = (this.formSms.invalid) ? true : false;
  }


  yes() {
    this.dialogRef.close()
  }


  isRowExpanded(accordionIndex: number, row: number): boolean {
    switch (accordionIndex) {
      case 1:
        return this.expandedRowsAccordion1.includes(row);
      case 2:
        return this.expandedRowsAccordion2.includes(row);
      case 3:
        return this.expandedRowsAccordion3.includes(row);
      default:
        return false;
    }
  }
  toggleRow(accordionIndex: number, row: number) {
    let expandedRows: number[];
    switch (accordionIndex) {
      case 1:
        expandedRows = this.expandedRowsAccordion1;
        break;
      case 2:
        expandedRows = this.expandedRowsAccordion2;
        break;
      case 3:
        expandedRows = this.expandedRowsAccordion3;
        break;
      default:
        expandedRows = [];
    }

    const currentIndex = expandedRows.indexOf(row);
    if (currentIndex === -1) {
      expandedRows.push(row); // Expand if not already expanded
    } else {
      expandedRows.splice(currentIndex, 1); // Collapse if already expanded
    }
  }
  deleteSms() {
    this.removeSmsConfiguration(this.smsData?.id)
  }
  deleteEmail() {
    this.removeEmailConfiguration(this.rows[0]?.id)

  }
  updateEmail() {
    this.editMode = true;
    if(this.editMode == true){
     this.showEmailTableAndForm = true
      this.showEmaillable = false;

    }
    this.editEmail(this.emailDataConfig);
    //this.notificationSer.updateEmail(this.emailDataConfig);
  }
  updateSms() {
    this.editMode = true;
    this.editSmsMode = true;
    this.showTableAndForm = true;
    this.editSms(this.smsData);
  }
}
