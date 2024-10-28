import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import { GeneralConfigsService } from 'src/app/services/general-configs.service';
import { MessageService, MessageType } from 'src/app/services/message.service';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-appln-config',
  templateUrl: './appln-config.component.html',
  styleUrls: ['./appln-config.component.scss']
})
export class ApplnConfigComponent {
  batchScriptList!: any;
  sortCategory = 'id';
  sortDirec: 'asc' | 'desc' = "asc";
  mode = "list";
  form!: FormGroup;
  selectedBatchScript:any;
  filterCategory = ['ID', 'Batch Template Name', 'PIN Config', 'User Name', 'Created On', 'Modified On'];
  calendarTypeKeys = {'Modified On' : 2, 'Created On' : 2};
  selectedFilterCategory = 'Batch Template Name';
  submitted = false;
  envTypes = [{name:"Cloud Native (CNE)", value:"CNE"}, {"name":"On Prem", "value":"OnPrem"}];
  applications!: any;

  public message: { type: MessageType; text: string } | null = null;


  constructor(private apiService:GeneralConfigsService, private fb: FormBuilder, private messageService: MessageService, private commonService:CommonService ) { }


  ngOnInit() {
    this.getAllBatchScripts();
    this.getApplications();
    this.formDecleration();
  }

  formDecleration(){
    this.form = this.fb.group({
      name: ['', Validators.required],
      jmxPinConf: ['', Validators.required],
      script: ['', Validators.required],
      envType: ['CNE', Validators.required],
      applicationName: ['']
    });
  }

  get f() {
    return this.form?.controls;
  }

  getApplications() {
    this.apiService.getAllApplications().subscribe((response: any) => {
      if (response && Array.isArray(response))
        this.applications = response;
    });
  }

  getAllBatchScripts() {
    this.apiService.getAllBatchScripts().subscribe((response: any) => {
      if (response?.hasOwnProperty("records") && response.records.length > 0) {
        const tableData = {
          list: response.records,
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Batch Template Name' },
            { key: 'jmxPinConf', label: 'PIN Config', dots: true },
            { key: 'createdAt', label: 'Created On', format:'date', filterType:'Date' },
            { key: 'modifiedAt', label: 'Modified On', format:'date', filterType:'Date' },
            { key: 'userName', label: 'User Name' },
            { key: 'Action', label: 'Action', type: 'action', edit: true, view: true, delete:true }
          ],
          uniqueKey: 'id'
        };
        this.batchScriptList = tableData;
      } else {
        this.batchScriptList = "empty";
      }
    });
  }

  isOnPrem(iText:string):boolean {
    return iText.toLowerCase() === "onprem";
  }

  onDelete(row: any) {
    const obj: any = {
      template: ConfirmModalComponent,
      data: {
        description: `Delete the <br> selected Batch Template?`,
        image:"assets/images/trash-red-outline.svg",
        showNoButton:true,
        yesButton:"Delete",
        rowID:row.id
      }
    }
    this.commonService.openDialog(obj, (res: any) => {
      if (res) {
        this.apiService.deleteBatchScriptByID(obj.data.rowID).subscribe(data=> {
          this.refreshListView(data);
        })
      }
    });
  }

  onChangeEnvType() {
    this.form?.patchValue({
      "applicationName": ""
    })
  }

  validateApplicationName():boolean {
    return this.isOnPrem(this.f['envType']?.value) && this.f['applicationName']?.value === "";
  }
  
  onEdit(event:any) {
    this.mode = 'update';
    this.selectedBatchScript = event;
    this.updateWithElement(event);
    this.enableFormControls();
  }

  onCreate() {
    this.mode = 'create';
    this.enableFormControls();
    this.formDecleration();
  }

  onView(event:any) {
    this.mode = 'view';
    this.updateWithElement(event);
    this.selectedBatchScript = event;
    this.disableFormControls();    
  }

  enableFormControls() {
    this.form?.get('name')?.enable();
    this.form?.get('script')?.enable();
    this.form?.get('jmxPinConf')?.enable();
    this.form?.get('envType')?.enable();
    this.form?.get('applicationName')?.enable();
  }

  disableFormControls() {
    this.form?.get('name')?.disable();
    this.form?.get('script')?.disable();
    this.form?.get('jmxPinConf')?.disable();
    this.form?.get('envType')?.disable();
    this.form?.get('applicationName')?.disable();
 }

  onSubmit(): void {
    this.submitted=true;
    if (this.form.valid && !this.validateApplicationName()) {
      const thePayload = {...this.form.value};
      if (this.mode === "update") {
        thePayload['id'] = this.selectedBatchScript.id;
        this.apiService.updateBatchScript(thePayload, this.selectedBatchScript.id).subscribe(data => {
          this.refreshListView(data);
        });
      } else {
        this.apiService.createBatchScript(thePayload).subscribe(data => {
          this.refreshListView(data);
        });
      }
    }
  }
  
  refreshListView(data:any) {
    if (data?.hasOwnProperty("code") && data?.hasOwnProperty("desc")) {
      var isSuccess = data.code == 200 ? true : false;
      const message = data.desc;
      this.handleApiResponse(isSuccess, message);
      if (isSuccess) {        
        this.getAllBatchScripts();
        this.resetForm();
        this.mode = 'list'
      }
    }
}


  updateWithElement(element:any) {
    this.form = this.fb.group({
      name: [element.name],
      script: [element.script],
      jmxPinConf: [element.jmxPinConf],
      envType:[this.isOnPrem(element.envType) ? "OnPrem" : "CNE"],
      applicationName:[element.applicationName]
    });
  }

  resetForm() {
    this.form?.reset();
    this.submitted = false;
  }

  cancel() {
    this.back();
  }
  
  back():void {
    this.resetForm();
    this.mode = 'list';
  }

  private handleApiResponse(isSuccess: boolean, messageText: string): void {
    const messageType = isSuccess ? MessageType.Success : MessageType.Error;
    this.message = { type: isSuccess ? MessageType.Success : MessageType.Error, text: messageText };
    this.messageService.showMessage(messageText, messageType);
  }


 }
