import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { ConnectionManagerService } from 'src/app/services/connection-manager.service';
import { MessageService, MessageType } from 'src/app/services/message.service';
import { CommonService } from 'src/app/services/common.service';
import { OperationsDataService } from '../../operations/operations-data.service';

// Custom validator function to restrict other than boolean values
export function booleanValueValidator(allowedValues:any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (allowedValues.indexOf(control.value) !== -1) {
      return null;
    }
    return {invalidBooleanValue:true};
    // const value = control.value;
    // debugger;

    // if (value === '0' || value === '1' || value === 'true' || value === 'false') {
    //   return null; // Valid
    // } else {
    //   return { 'invalidBooleanValue':true}; // Invalid
    // }
  };
}
@Component({
  selector: 'app-connection-form',
  templateUrl: './connection-form.component.html',
  styleUrls: ['./connection-form.component.scss']
})
export class ConnectionFormComponent {
  isEditMode!: boolean;
  editMode!: boolean;
  EditMode!: boolean;
  eceEditMode!:boolean;
  connectionForm!: FormGroup;
  CMconnectionForm !: FormGroup;
  JMXconnectionForm!: FormGroup;
  connectionEceForm!:FormGroup;
  data: any;
  Cluster: any;
  booleanValue :boolean=true;
  clusterLen!:number;
  categoryList!: any;
  connectionType!: any;
  show: boolean = false;
  cmShowi: boolean = false;
  jmxShow: boolean = false;
  eceShow: boolean = false;
  successMessage: string | null = null;
  id: any;
  disableSubmitButton: boolean = false;
  disableCMSubmitButton: boolean = false;
  disableJMXSubmitButton: boolean = false;
  disableEceSubmitButton: boolean = false;
  clusterobj = {}

  submitted:boolean = false;
  Data:any;
  testResponse : any;
  testdb : boolean = true;
  testcm : boolean = true;
  testjmx : boolean = true;
  testEceDb : boolean = true;
  public message: { type: MessageType; text: string } | null = null;
  payloadAddConnection: any;

  constructor(private fb: FormBuilder, private connection: ConnectionManagerService, private location: Location, private messageService: MessageService, private commonService: CommonService, private operationService: OperationsDataService) { }

  ngOnInit() {
    this.getCategory();
    this.getCluster();
    this.getConnectionType();
    this.data = history.state.data;
    this.connection.testConnection(this.Data)
    if (this.data.isEditMode == false) {
      this.isEditMode = this.data ? this.data.isEditMode === true : false;
      this.show = true;
    }
    if (this.data.isEditMode == true) {
      this.isEditMode = this.data ? this.data.isEditMode === true : false;
      this.jmxShow = false;
      this.cmShowi = false;
      this.show = true;
    }
    else if (this.data.editMode == false) {
      this.editMode = this.data ? this.data.isEditMode === true : false;
      this.show = false;
      this.jmxShow = false;
      this.cmShowi = true;
    }

    else if (this.data.editMode == true) {
      this.cmShowi = true;
      this.jmxShow = false;
      this.show = false;
    }
    else if (this.data.editMode == false) {
      this.editMode = this.data ? this.data.isEditMode === true : false;
      this.show = false;
      this.jmxShow = false;
      this.cmShowi = true;
    }
    else if (this.data.editMode == true) {

      this.show = false;
      this.cmShowi = false;
      this.jmxShow = true;
    }
    else if (this.data.EditMode == false) {
      this.EditMode = this.data ? this.data.isEditMode === true : false;
      this.jmxShow = true;
    }
    else if (this.data.EditMode == true) {
      this.show = false;
      this.cmShowi = false;
      this.jmxShow = true;
    }
    else if(this.data.eceEditMode == false){
      this.eceShow = true;
    }
    else if(this.data.eceEditMode == true){
      this.eceEditMode = true;
      this.eceShow = true;

    }
    this.connectionForm = this.fb.group({
      conName: ['', [Validators.required]],
      conType: ['1', [Validators.required]],
      dataBaseNo: ['', [Validators.required, Validators.pattern("(.*[0-9].*)")]],
      dbHostUrl: ['', [Validators.required]],
      dbUserName: ['', [Validators.required]],
      dbDriverClass: ['', [Validators.required]],
      masterCM: ['', [Validators.required]],
      dbPassword: ['', [Validators.required]],
      masterDB: [false, [ Validators.requiredTrue]],
      clusterName: ['conCluster.clusterName', [Validators.required]]
    });
    this.CMconnectionForm = this.fb.group({
      conName: ['',[Validators.required]],
      conType: ['2',[Validators.required]],
      clusterName: ['', [Validators.required]],
      dataBaseNo: ['',[Validators.required, Validators.pattern("(.*[0-9].*)")]],
      conCategory: ['',[Validators.required]],
      cmHost: ['',[Validators.required]],
      cmPort: ['',[Validators.required, Validators.pattern("^(.*[0-9]{1}$)")]],
      cmlogin: ['',[Validators.required]],
      cmPassword: ['',[Validators.required]],
      sslEnabled: ['false',[Validators.required,booleanValueValidator(["0", "1", "true", "false"])]],
      masterCM: [false,[Validators.required]],
      masterDB: ['',[Validators.requiredTrue]],
      sslWallet: [false,[Validators.required]],
    });
    this.JMXconnectionForm = this.fb.group({
      conName: ['', [Validators.required]],
      conType: ['3', [Validators.required]],
      clusterName: ['', [Validators.required]],
      pinConfNameSpace: ['', [Validators.required]],
      pinConfUpdateToken: ['', [Validators.required]],
      pinConfUpdateUrl: ['', [Validators.required]],
      JMXHostIP: ['', [Validators.required, Validators.pattern("(.*[0-9].*)")]],
      JMXHostPort: ['', [Validators.required, Validators.pattern("^(.*[0-9]{1}$)")]],
      monitorAgentHost:['',[Validators.required]],
      monitorAgentPort:['',[Validators.required, Validators.pattern("^(.*[0-9]{1}$)")]]
    });
    this.connectionEceForm = this.fb.group({
      conName: ['', [Validators.required]],
      conType: ['4', [Validators.required]],
      dataBaseNo: ['', [Validators.required, Validators.pattern("(.*[0-9].*)")]],
      dbHostUrl: ['', [Validators.required]],
      dbUserName: ['', [Validators.required]],
      dbDriverClass: ['', [Validators.required]],
      masterCM: ['', [Validators.required]],
      dbPassword: ['', [Validators.required]],
      masterDB: [false, [ Validators.requiredTrue]],
      clusterName: ['conCluster.clusterName', [Validators.required]] 
    });

    if (this.data.isEditMode) {
      const connectData = this.data.obj;
      this.connectionForm.patchValue({
        conName: connectData.conName,
        dbHostUrl: connectData?.conConfig?.dbHostUrl,
        dbUserName: connectData?.conConfig?.dbUserName,
        conType: connectData.conType,
        clusterName: connectData?.conCluster?.clusterName,
        dbDriverClass: connectData?.conConfig?.dbDriverClass,
        masterDB: connectData?.conConfig?.masterDB,
        dbPassword: connectData?.conConfig?.dbPassword,
        dataBaseNo: connectData?.conConfig?.dataBaseNo
      });
    }
    else if (this.data.editMode == true) {
      const CMconnectData = this.data.obj;
      this.CMconnectionForm.patchValue({
        conName: CMconnectData.conName,
        cmHost: CMconnectData.conConfig?.cmHost,
        cmlogin: CMconnectData?.conConfig?.cmlogin,
        cmPassword: CMconnectData?.conConfig?.cmPassword,
        conType: CMconnectData.conType,
        clusterName: CMconnectData.clusterName,
        sslEnabled: CMconnectData?.conConfig?.sslEnabled,
        masterCM: CMconnectData?.conConfig?.masterCM,
        cmPort: CMconnectData?.conConfig?.cmPort,
        dataBaseNo: CMconnectData?.conConfig?.dataBaseNo,
        sslWallet: CMconnectData?.conConfig?.sslWallet
      });
    }
    else if (this.data.EditMode == true) {
      const JMXconnectData = this.data.obj;
      this.JMXconnectionForm.patchValue({
        conName: JMXconnectData.conName,
        pinConfNameSpace: JMXconnectData?.conConfig?.pinConfNameSpace,
        pinConfUpdateToken: JMXconnectData?.conConfig?.pinConfUpdateToken,
        conType: JMXconnectData.conType,
        clusterName: JMXconnectData?.conCluster?.clusterName,
        pinConfUpdateUrl: JMXconnectData?.conConfig?.pinConfUpdateUrl,
        JMXHostIP: JMXconnectData?.conConfig?.JMXHostIP,
        JMXHostPort: JMXconnectData?.conConfig?.JMXHostPort,
        monitorAgentHost:JMXconnectData?.conConfig?.monitorAgentHost,
        monitorAgentPort:JMXconnectData?.conConfig?.monitorAgentPort
      });
    }

else if (this.data.eceEditMode) {
  const eceConnectData = this.data.obj;
  this.connectionEceForm.patchValue({
    conName: eceConnectData.conName,
    dbHostUrl: eceConnectData?.conConfig?.dbHostUrl,
    dbUserName: eceConnectData?.conConfig?.dbUserName,
    conType: eceConnectData.conType,
    clusterName: eceConnectData?.conCluster?.clusterName,
    dbDriverClass: eceConnectData?.conConfig?.dbDriverClass,
    masterDB: eceConnectData?.conConfig?.masterDB,
    dbPassword: eceConnectData?.conConfig?.dbPassword,
    dataBaseNo: eceConnectData?.conConfig?.dataBaseNo
  });
}

  }
  public validateFormControl() {
    this.disableSubmitButton = (this.connectionForm.invalid) ? true : false;
    this.disableCMSubmitButton = (this.CMconnectionForm.invalid) ? true : false;
    this.disableJMXSubmitButton = (this.JMXconnectionForm.invalid) ? true : false;
    this.disableEceSubmitButton = (this.connectionEceForm.invalid)? true: false;
  }
  get f() {
    return this.connectionForm?.controls;
  }
  get g() {
    return this.CMconnectionForm?.controls;
  }
  get h() {
    return this.JMXconnectionForm?.controls;
  }
  checkval(e: any) {
  }

  back(): void {
    this.location.back();
  }
  cancelConnection() {
    this.back();
  }

  validateBoolean(event:any){
    const value = event.target.value;
    if(value === 'false'|| value === 'true')
    {
      this.booleanValue = true;
    }
    else{
      this.booleanValue=false
    }
  }

  addConnection() {
    if (this.connectionForm.invalid) {
      const formData = this.connectionForm.value;
//      const formData1 = formData.clusterName;

  let formData1:any=0;
  console.log(formData);
  this.Cluster.find((item:any) => {
    if( item.clusterName === formData.clusterName ){
      formData1 = item;
      return
    }
  });
        console.log(formData);
        const clustName = formData1.clusterName;
        const clustId = formData1.id;
        const siteId = formData1.siteDetails.id;
        const siteName = formData1.siteDetails.siteName;

      const result = {
        id: this.data.obj?.id,
        conCluster: {
          clusterId: clustId,
          clusterName: clustName,
          siteDetails: {
            id: siteId,
            siteName: siteName
          }
        },
        conConfig: {
          dataBaseNo: formData.dataBaseNo,
          dbHostUrl: formData.dbHostUrl,
          dbUserName: formData.dbUserName,
          dbPassword: formData.dbPassword,
          masterDB: formData.masterDB,
          dbDriverClass: formData.dbDriverClass
        },
        conName: formData.conName,
        conType: formData.conType
      }
      if(this.testdb == true)
      this.connection.testConnection(result).subscribe(response => {
        this.testResponse = response;
        var isSuccess = this.testResponse == true ? true : false;
        if(isSuccess === true){
        //  this.testdb = false;
          this.disableSubmitButton = true;
        }
        const message = isSuccess?'Connection is valid':'Test Connection is failed due to invalid connection';
        this.handleApiResponse(isSuccess,message);
        (error:any) => {
         this.handleApiResponse(isSuccess == false, " error case ");
      }
      })
      if (this.data.isEditMode) {
        if(this.testResponse === true)
        this.connection.updateConnection(result).subscribe(response => {
          var isSuccess = response.code == 200 ? true : false;
          this.handleApiResponse(isSuccess, response.status);
          this.back();
        },
          (error) => {
            this.handleApiResponse(false, 'Connection updation failed');

          });  
      } 
      else{
        if(this.testResponse === true){

        this.connection.addConnection(result).subscribe(response => {
          var isSuccess = response.code == 200 ? true : false;
          this.handleApiResponse(isSuccess, response.status);
          this.back();
        },
          (error) => {
            this.handleApiResponse(false, 'Connection addition failed');

          });
        this.connectionForm.reset();

      }
    }
  }
  }
  testbrmConnection(){
    this.testResponse = false;
    this.addConnection();
  }
  testcmConnection(){
    this.testResponse = false;
    this.addCMConnection();
  }
  testjmxConnection(){
    this.testResponse = false;
    this.addJMXConnection();
  }
  testEceConnection(){
    this.testResponse = false;
    this.addEceConnection();
  }

  getCluserObj(id:any){
    // this.Cluster.forEach((item:any)=>{
    //   item.id == id && item
    // })
  }

  addCMConnection() {
      const CMformData = this.CMconnectionForm.value;

//      const formData1 = CMformData.clusterName;
let formData1:any=0;
console.log(CMformData);

this.Cluster.find((item:any) => {
  if( item.clusterName === CMformData.clusterName ){
    formData1 = item;
    return
  }
});
      console.log(CMformData);
      const clustName = formData1.clusterName;
      const clustId = formData1.id;
      const siteId = formData1.siteDetails.id;
      const siteName = formData1.siteDetails.siteName;

      const result = {
        id: this.data.obj?.id,
        conCluster: {
          clusterId: clustId,
          clusterName: clustName,
          siteDetails: {
            id: siteId,
            siteName: siteName
          }
        },
        conConfig: {
          cmHost: CMformData.cmHost,
          cmPassword: CMformData.cmPassword,
          cmPort: CMformData.cmPort,
          cmlogin: CMformData.cmlogin,
          masterCM: CMformData.masterCM,
          sslEnabled : CMformData.sslEnabled,
          sslWallet: CMformData.sslWallet,
          dataBaseNo : CMformData.dataBaseNo
        },
        conName: CMformData.conName,
        conType: CMformData.conType,
      }
      if(this.testcm == true)
      this.connection.testConnection(result).subscribe(response => {
        this.testResponse = response;
        var isSuccess = this.testResponse == true ? true : false;
        if(isSuccess === true){
          this.testcm = false;
          this.disableCMSubmitButton = true;
        }
        const message = isSuccess?'Connection is valid':'Test Connection is failed due to invalid connection';
        this.handleApiResponse(isSuccess,message);
        (error:any) => {
         this.handleApiResponse(isSuccess == false, " error case ");
      }
      })
      if (this.data.editMode) {
        if(this.testResponse === true){
        this.connection.updateConnection(result).subscribe(response => {
          var isSuccess = response.code == 200 ? true : false;
          this.handleApiResponse(isSuccess, response.status);
          this.back();
        },
          (error) => {
            this.handleApiResponse(false, 'Connection updation failed');

          });  
      } 
    }else {
        if(this.testResponse === true){
        this.connection.addConnection(result).subscribe(response => {
          var isSuccess = response.code == 200 ? true : false;
          this.handleApiResponse(isSuccess, response.status);
          this.back();
        },
          (error) => {
            this.handleApiResponse(false, 'Connection addition failed');

          });
        this.CMconnectionForm.reset();

      }
    }
  }
  addJMXConnection() {
      const JMXformData = this.JMXconnectionForm.value;
      let formData1:any=0;
      console.log(JMXformData);

      this.Cluster.find((item:any) => {
        if( item.clusterName === JMXformData.clusterName ){
          formData1 = item;
          return
        }
      });

      const clustName = formData1?.clusterName;
      const clustId = formData1?.id;
      const siteId = formData1?.siteDetails?.id;
      const siteName = formData1?.siteDetails?.siteName;


      const result = {
        id: this.data.obj?.id,
        conCluster: {
          clusterId: formData1?.id,
          clusterName: clustName,
          siteDetails: {
            id: siteId,
            siteName: siteName
          }
        },
        conConfig: {
          JMXHostIP: JMXformData.JMXHostIP,
          JMXHostPort: JMXformData.JMXHostPort,
          pinConfNameSpace: JMXformData.pinConfNameSpace,
          pinConfUpdateToken: JMXformData.pinConfUpdateToken,
          pinConfUpdateUrl: JMXformData.pinConfUpdateUrl,
          monitorAgentHost:JMXformData.monitorAgentHost,
          monitorAgentPort:JMXformData.monitorAgentPort
        },
        conName: JMXformData.conName,
        conType: JMXformData.conType,
      }
      if(this.testjmx == true)
      this.connection.testConnection(result).subscribe(response => {
        this.testResponse = response;
        var isSuccess = this.testResponse == true ? true : false;
        if(isSuccess === true){
          this.testjmx = false;
          this.disableJMXSubmitButton = true;
        }
        const message = isSuccess?'Connection is valid':'Test Connection is failed due to invalid connection';
        this.handleApiResponse(isSuccess,message);
        (error:any) => {
         this.handleApiResponse(isSuccess == false, " error case ");
        }
      })
      if (this.data.EditMode) {
        if(this.testResponse === true){
          this.connection.updateConnection(result).subscribe(response => {
            var isSuccess = response.code == 200 ? true : false;
            this.handleApiResponse(isSuccess, response.status);
            this.back();
          },
            (error) => {
              this.handleApiResponse(false, 'Connection updation failed');
  
            });  
        } 
      }
      else {
        if(this.testResponse === true){
          this.connection.addConnection(result).subscribe(response => {
            var isSuccess = response.code == 200 ? true : false;
            this.handleApiResponse(isSuccess, response.status);
            this.back();
          },
            (error) => {
              this.handleApiResponse(false, 'Connection addition failed');
  
            });
          this.JMXconnectionForm.reset();
  
        }
  }
}

addEceConnection(){

  const eceFormData = this.connectionEceForm.value;
      let formData1:any=0;      
      this.Cluster.find((item:any) => {
        if( item.clusterName === eceFormData.clusterName ){
          formData1 = item;
          return
        }
      });
            const clustName = formData1.clusterName;
            const clustId = formData1.id;
            const siteId = formData1.siteDetails.id;
            const siteName = formData1.siteDetails.siteName;
      
            const result = {
              id: this.data.obj?.id,
              conCluster: {
                clusterId: clustId,
                clusterName: clustName,
                siteDetails: {
                  id: siteId,
                  siteName: siteName
                }
              },
              conConfig: {
                dbPassword: eceFormData.dbPassword,
                masterDB: eceFormData.masterDB,
                dbUserName:eceFormData.dbUserName,
                dbDriverClass : eceFormData.dbDriverClass,
                dbHostUrl: eceFormData.dbHostUrl,
                dataBaseNo : eceFormData.dataBaseNo
              },
              conName: eceFormData.conName,
              conType: eceFormData.conType,
            }
            if(this.testEceDb == true)
            this.connection.testConnection(result).subscribe(response => {
              this.testResponse = response;
              var isSuccess = this.testResponse == true ? true : false;
              if(isSuccess === true){
                this.testEceDb = false;
                this.disableEceSubmitButton = true;
              }
              const message = isSuccess?'Connection is valid':'Test Connection is failed due to invalid connection';
              this.handleApiResponse(isSuccess,message);
              (error:any) => {
               this.handleApiResponse(isSuccess == false, " error case ");
            }
            })
            if (this.data.eceEditMode) {
              if(this.testResponse === true){
              this.connection.updateConnection(result).subscribe(response => {
                var isSuccess = response.code == 200 ? true : false;
                this.handleApiResponse(isSuccess, response.status);
                this.back();
              },
                (error) => {
                  this.handleApiResponse(false, 'Connection updation failed');
      
                });  
            } 
          }else {
              if(this.testResponse === true){
              this.connection.addConnection(result).subscribe(response => {
                var isSuccess = response.code == 200 ? true : false;
                this.handleApiResponse(isSuccess, response.status);
                this.back();
              },
                (error) => {
                  this.handleApiResponse(false, 'Connection addition failed');
      
                });
             this.connectionEceForm.reset();
      
            }
          }

}
  getCategory(): any {
    this.connection.getAllConnections().subscribe((response: any) => {
      console.log(" value of connection manager : ", response);
      this.categoryList = response;

    })
  }
  getCluster() {
    this.connection.getAllClusters().subscribe((response: any) => {
      console.log("get-all-cluster connection form components : ", response);
      this.Cluster = response;
      this.clusterLen = this.Cluster.length;
    })

  }

   get fbData() { return this.JMXconnectionForm?.controls; }

  getConnectionType(): any {
    this.connection.getAllConnections().subscribe((response: any) => {
      this.connectionType = response;

    })
  }
  private handleApiResponse(isSuccess: boolean, messageText: string): void {
    const messageType = isSuccess ? MessageType.Success : MessageType.Error;
    this.message = { type: isSuccess ? MessageType.Success : MessageType.Error, text: messageText };
    this.messageService.showMessage(messageText, messageType);
  }
}


