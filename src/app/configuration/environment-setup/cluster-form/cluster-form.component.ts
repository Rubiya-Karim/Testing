import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl, } from '@angular/forms';
import { ClusterService } from 'src/app/services/cluster.service';
import { MessageService, MessageType } from 'src/app/services/message.service';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router } from '@angular/router';
import {ConfirmModalComponent} from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-cluster-form',
  templateUrl: './cluster-form.component.html',
  styleUrls: ['./cluster-form.component.scss'],
  animations: [
    trigger('rotate', [
      state('expanded', style({ transform: 'rotate(-180deg)' })),
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      transition('expanded <=> collapsed', animate('0.3s ease-in-out'))
    ])
  ]
})
export class ClusterFormComponent {
  //public message: { type: MessageType; text: string } | null = null;
  podNames: any;
  element!:any;
  siteNames: string[] = [];
  tableData!: any;
  addClusterForm!: FormGroup;
  sites!: any[];
  drtype ! :any[];
  res:any;
  type : any;
  formAddSite!: FormGroup;
  siteName: string = '';
  siteDesc: string = '';
  editForm!: FormGroup
  isEditMode!: boolean;
 // isprimary : boolean = false;
  public disableSubmitButton: boolean = true;
  submitted!: boolean;
  isNew!: boolean;
  isTestClusterClicked = false;
  public message: { type: MessageType; text: string } | null = null;
  successMessage!: string;
  errorMessage!: string;
  data!: any;
  dialogRef: any;
  getpods: boolean = false;
  formGetpods!: FormGroup;
  podCategory: any;
  podCategoryList: any;
  clusterPods: any;
  addPodsForm!: FormGroup;
  podsData: any;
  thePodDetails: any;
  responseArray : any;
  pageIndex = 0;
  pageSize = 10;
  sortDirec: 'asc' | 'desc' = "asc";
  sortCategory = 'dateModified';
  @Output() emitImage = new EventEmitter();
  uploadedFilePath:string ='';
  fileExtension = ['txt', ''];
  myFileInput: any;
  multiple: boolean=false;
 // clusterTypeList:number[]=[1,2,3];
  clusterGroupList:Array<{"id" :string,"desc":string}> = [{"id" :"1", "desc" :"ECE Cluster"},{"id" :"2", "desc" :"BRM Cluster"},{"id" :"3", "desc" :"ECE & BRM Cluster"},{"id" :"4", "desc" :"Other Apps Cluster"},{"id" :"5", "desc" : "All Apps Cluster"}];
  constructor(private fb: FormBuilder,
    private clusterService: ClusterService,
    private messageService: MessageService, private location: Location, private route: Router,
    private commonService: CommonService, private toastService:ToastrService) { }
    addInformationForm!:FormGroup;
    OnpremSelected:boolean = false;
    addApplicationsData:boolean = false;
    dataSource: any;
    displayedColumns: string[] = ['applicationName', 'serverName', 'hostName','userName', 'password'];
    columnsSchema:any; 
    addApplicationScreen:boolean = false;
    addApplicationForm!:FormGroup;
    environmetTypeBtn = 'CNE';
    validateAddappBtn:boolean = true;
    expandedRows: number[] = [];
    applicationList:any;
    processList:any;
    addplicationDataList:any;
    newClusterId:any;
    addAppArrayList:any;
    hostNameData:any;
    viewApplication:boolean= false;
    additionalInfoBtn:boolean = false;
    addClusterbtn :boolean = true;
    viewApplicationScreen:boolean = false;
    editApplicationForm!:FormGroup;
    editApplicationScreen:boolean = false;
    editedApplicationData:any;
    filterCategory = ['Cluster Name', 'KubeConfig', 'Site Name', 'Last Modified'];
    selectedFilterCategory = 'Cluster Name';
   processArray:string[] =[];
  totalRecords: number = 0;
  noDataMsg:string = 'No Clusters found';
  tableQuery!:string;
  proData:any;
  processListData:any;
  addProcessEnbaled:boolean = true;
  getPodsData:any;
  kubeUrl:any;
  updatedPath:any;
  onPremEdit = false;
  onPremApplication:boolean = false;
  hostDataDetails:any;
  mapApplicationForm!:FormGroup;

  
  initializeValues() {
    this.addInformationForm = new FormGroup({
      addInformationData: new FormArray([
        new FormGroup({
          key: new FormControl(''),
          value: new FormControl(''),
        })
      ])
    });
    this.addApplicationForm = new FormGroup({
      addApplicationData: new FormArray([
        new FormGroup({
          Application: new FormControl(''),
          Server: new FormControl(''),
          Processes: new FormControl(''),
          HostName: new FormControl(''),
          UserName: new FormControl(''),
          Password: new FormControl(''),
        })
      ])
    });
    this.editApplicationForm= this.fb.group({
          Application: ['', [Validators.required]],
          Server: ['', [Validators.required]],
          Processes: ['', [Validators.required]],
          HostName: ['', [Validators.required]],
          UserName: ['', [Validators.required]],
          Password: ['', [Validators.required]],
    });
    // this.addInformationData.clear();
    this.clusterService.getClusterSite(this.pageIndex, this.pageSize,this.sortCategory, this.sortDirec,"").subscribe(response => {
      this.sites = response.records;
    });
    this.addClusterForm = this.fb.group({
      siteName: ['', [Validators.required, Validators.maxLength(24)]],
      clusterName: ['', [Validators.required, Validators.maxLength(24)]],
      kubeConfigFile: ['', [Validators.required]],
      namespace: ['', [Validators.required, Validators.maxLength(24)]],
      coherenceCluster: ['', [Validators.maxLength(24)]],      
      deploymentType : [''],
      //drType : [''],
      isPrimary : [false,[Validators.requiredTrue]],
      clusterGroup: [{value:'',disabled:true}],
      environmentType: ['', [Validators.required]]
    }, { validator: this.atLeastOneRequiredValidator });

    this.addClusterForm.get('namespace')?.valueChanges.subscribe(() => {
      this.enableClusterGroup();  
    })
    this.addClusterForm.get('coherenceCluster')?.disable()
    this.addPodsForm = this.fb.group({
      arrayClusterPods: this.fb.array([]),
    });

    this.clusterService.getOnpremApplicationList().subscribe((data)=>{
      this.applicationList = data;
    })
  }

  ngOnInit() {
    this.initializeValues();
    this.getCluster();
    // this.data = history.state.data;
  }

  getCluster() {
    const clusterData = history.state.data;
    if (clusterData?.hasOwnProperty("id") && clusterData?.id) {
      this.clusterService.getClusterForID(clusterData.id).subscribe((response)=>{
        if (response && response != null && typeof response === 'object') {
          this.data = response;
          // this.siteData = response.siteDetails;
          this.data?.customFields?.forEach((ele:any)=>{
            const customData :FormGroup = this.createAdditionalForm(this.fb,ele);
            this.addInformationData.push(customData);       
          })
        this.isEditMode = this.data ? true : false;
        if(this.isEditMode){
          this.getAllPodCategory();
          this.getPodsForCluster();
          this.addInformationData.clear();
        }

    
        if (this.data) {
          if(this.data.clusterType !== "OnPrem"){
            this.uploadedFilePath = this.data?.kubeConfigFile;
            this.addClusterForm.patchValue({
              siteName: this.data.siteDetails?.siteName,
              clusterName: this.data.clusterName,
              kubeConfigFile: this.data.kubeConfigFile,
              namespace: this.data.nameSpace,
              coherenceCluster: this.data.types?.length > 0 ? this.data.types[0].applicationName : '',
              deploymentType : this.data.deploymentType,
              environmentType: this.data.clusterType,
             // drType : this.data.clusterData.drType,
              isPrimary : this.data.isPrimary,
              clusterGroup : this.data.clusterGroup
            });
          } else {
            this.OnpremSelected = true;
            this.addClusterForm.patchValue({
              siteName: this.data.siteDetails?.siteName,
              clusterName: this.data.clusterName,
              deploymentType : this.data.deploymentType,
              environmentType: this.data.clusterType,
             // drType : this.data.clusterData.drType,
              isPrimary : this.data.isPrimary,
              clusterGroup : this.data.clusterGroup
            });
          }
          if(this.data.clusterType === "OnPrem"){
           this.onPremApplication = true;
           this.mapApplicationForm = this.fb.group({
            appData:this.fb.array([])
          })
          this.clusterService.getOnpremHostData(this.data.id).subscribe((data:any)=>{
            this.onPremApplication = true;
            var theList: FormGroup<any>[] = [];
            data.forEach((ele:any)=>{
              const app:FormGroup =this.createAppForm(this.fb,ele);
              theList.push(app);
            })
            this.mapApplicationForm?.patchValue({
              appData:theList
            })
          })
          }
          else{
            this.onPremApplication = false;
          }
          
          
          
          if (this.sites) {
            const selectedSite = this.sites.find(
              (site) => site.siteName === this.data.siteDetails.siteName
            );
            if (selectedSite) {
              this.addClusterForm.get('siteName')?.setValue(selectedSite.siteName);
            }
          }
         
      }
       
        

    
        }
      })
    }
  }

  get appData():FormArray{
    return this.mapApplicationForm.get('appData') as FormArray;
  }

  createAdditionalForm(fb:FormBuilder,data:any):FormGroup{
    return fb.group({
      key:data.key,
      value:data.value


    })
 
  }


  createAppForm(fb:FormBuilder,data:any):FormGroup{
    return fb.group({
      applicationName:[data.applicationName, Validators.required],
      hostName:[data.hostName, Validators.required],
      password:[data.password, Validators.required],
      serverName:[data.serverName, Validators.required],
      userName:[data.userName, Validators.required],
      processList:[data.processList, Validators.required]


    })
 
  }

  newAppData():FormGroup{
    return this.fb.group({
      applicationName:['', Validators.required],
      hostName:['', Validators.required],
      password:['', Validators.required],
      serverName:['', Validators.required],
      userName:['', Validators.required],
      processList:['', Validators.required],


    })

  }

  backToApplication(){
    this.editApplicationScreen = false;
    this.viewApplicationScreen = true;
    this.editApplicationForm.get('Application')?.disable();
  }

  refreshData(event:any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.viewApplicationData();
  
  }

processNamebyApplication(event:any){
  this.clusterService.getProcessByAppName(event.target.value).subscribe((data)=>{
    this.processList = data.value;
    // this.processList = [Object.assign({},ProcessDropDown)];
  })
}


  get addInformationData(): FormArray {
    return this.addInformationForm.get('addInformationData') as FormArray;
  }

  get addApplicationData(): FormArray {
    return this.addApplicationForm.get('addApplicationData') as FormArray;
  }

  addAppclick(){
    this.addApplicationScreen = true;
    const i =0;
    this.toggleRow(i);
    this.isRowExpanded(i);
  }

  addInformation(){
    this.addInformationData.push(
      new FormGroup({
       key: new FormControl(''),
        value: new FormControl('')
      })
    );
  }

  addApplication(i:any){
    this.addProcessEnbaled = false;
    this.addplicationDataList= this.addApplicationForm?.value?.addApplicationData;
    this.addApplicationForm.get('Application')?.disable();
    this.addApplicationForm.patchValue({
      Application: this.addplicationDataList.Application,
      Server: this.addplicationDataList.Server,
      Processes: this.addplicationDataList.Processes,
      HostName: this.addplicationDataList.HostName,
      UserName: this.addplicationDataList.UserName,
      Password: this.addplicationDataList.Password,
     
    });
    this.toggleRow(i);
      this.toggleRow(i+1);
      this.isRowExpanded(i+1);
    this.addApplicationData.push(
      new FormGroup({
        Application: new FormControl(''),
        Server: new FormControl(''),
        Processes: new FormControl(''),
        HostName: new FormControl(''),
        UserName: new FormControl(''),
        Password: new FormControl(''),
      })
    );
    
    

    
  }

  backToAddCluster(){
    this.addApplicationScreen = false;
  }

  remove(i:number){
    this.addInformationData.removeAt(i);
  }

  removeApplication(i:number){
    this.addApplicationData.removeAt(i);
  }

  submit(){
  }

  submitApplication(){
  }

  onSelectChange(event:any) {
    this.environmetTypeBtn = event.target.value;
    if(event.target.value === "OnPrem"){
      this.OnpremSelected = true;
      this.addClusterForm.get('coherenceCluster')?.enable();
      this.enableClusterGroup();
    }
    else{
      this.OnpremSelected = false;
      this.enableClusterGroup();
    }
  }

  validateAddapplications(){
    if(this.addClusterForm.value.siteName !== "" && this.addClusterForm.value.deploymentType !== ""  &&
    this.addClusterForm.value.clusterGroup !== "" && this.addClusterForm.value.clusterName !== "" 
     ){
     this.validateAddappBtn = false;
    }
    else{
      this.validateAddappBtn = true;
    }
  }

  addProcess(){
    this.addApplicationForm.value.addApplicationData.map((item:any)=>{
      const obj = { clusterId: this.newClusterId };
Object.assign(item,obj );

    })
    const appData = this.addApplicationForm.value.addApplicationData;
    this.addAppArrayList =[];
    for(let i=0; i < appData.length; i++){
      const payload = {
        "clusterId": parseInt(appData[i].clusterId),
        "applicationName": appData[i].Application,
        "serverName":appData[i].Server,
        "hostName": appData[i].HostName,
        "userName": appData[i].UserName,
        "password": appData[i].Password,
        "processList": appData[i].Processes
      }
      this.addAppArrayList.push(payload);
    }
   
 this.clusterService.addHostName(this.addAppArrayList).subscribe((data)=>{  
  const formData = this.addClusterForm.value;
  this.addClusterForm.patchValue({
    siteName: formData.siteName,
    clusterName: formData.clusterName,
    applicationName: formData.applicationName,
    deploymentType : formData.deploymentType,
    isPrimary : formData.isPrimary,
    clusterGroup : formData.clusterGroup,
    coherenceCluster: formData.coherenceCluster
  });
  this.addApplicationScreen = false;
  this.viewApplication = true;
  this.additionalInfoBtn = true;
  this.addClusterForm.disable();
  this.addInformationForm.disable();
  this.viewApplicationData();
  // const theQuery = this.tableQuery?.length ? this.tableQuery : "";
  // this.clusterService.getOnpremHostDetails(this.pageIndex, this.pageSize,this.sortCategory, this.sortDirec,
  //   theQuery).subscribe((data)=>{
  //   console.log(data);
  //   this.tableData = {
  //     list: data,
  //     columns: [
  //       { key: 'applicationName', label: 'Application', type:'addApp' },
  //       { key: 'serverName', label: 'Server'},
  //       { key: 'hostName', label: 'Host Name' },
  //       { key: 'processList', label: 'Process List' },
  //       { key: 'userName', label: 'Username' },
  //       { key: 'password', label: 'password', type:'password' },
  //       { key: 'Action', label: 'Action', type: 'action', edit: true, delete: true },

  //     ],
  //   }
  // })

  });
  

 
  }

backtoCluster(){
  this.route.navigate(['/configurations/environment-setup/cluster']);
}

onDeleteApplication(row:any){
  const dialog: any = {
    template: ConfirmModalComponent,
    data: {
      description: `Delete the <br> selected Application?`,
      id: row.id,
      image:"assets/images/trash-red-outline.svg",
      showNoButton:true,
      yesButton:"Delete"
    }
  }
  this.commonService.openDialog(dialog, (res: any) => {
    if (res) {
      this.clusterService.deleteApplication(dialog.data.id).subscribe(data => {
        this.viewApplicationData();
      })
    }
  });

}

onEditApplication(row:any){
    this.processArray =[];
    row.processList.map((item1:any)=>{
      
      if(item1.enabled === true){
        this.processArray.push(item1.name);
      }
    })
    const process = this.processArray;
    const pro = String(process);
  this.editedApplicationData = row;
  this.editApplicationScreen = true;
  this.addApplicationScreen = false;
  this.viewApplicationScreen = false;
  this.editApplicationForm.patchValue({
    Application: row.applicationName,
    Server: row.serverName,
    Processes: process,
    HostName: row.hostName,
    UserName: row.userName,
    Password: row.password,
   
  });
 // this.editApplicationForm.get('Application')?.disable();
}

updateApplication(){
  this.processListData=[];
  const processListObj = this.editApplicationForm.value.Processes;
  for(let i=0; processListObj.length > i; i++){
    const process1 = {enabled:true};
    const process2 = {name:processListObj[i]};
    const process3 = {...process1, ...process2};
    this.processListData.push(process3);
  }
  const payload = [{
    "id": this.editedApplicationData.id,
    "clusterId": this.editedApplicationData.clusterId,
    "applicationName": this.editApplicationForm.value.Application,
    "serverName": this.editApplicationForm.value.Server,
    "hostName": this.editApplicationForm.value.HostName,
    "userName": this.editApplicationForm.value.UserName,
    "password": this.editApplicationForm.value.Password,
    "processList": this.editApplicationForm.value.Processes,
  }]
;
  this.clusterService.updateApplicationdata(payload).subscribe((data)=>{
    this.editApplicationScreen = false;
    this.viewApplicationData()
  })
}

  update(event:any){
    const payload = {
      "id": event.id,
    "clusterName": event.clusterName,
    "applicationName": event.applicationName,
    "serverName": event.serverName,
    "ip": event.ip,
    "hostName": event.hostName,
    "password": event.password    ,
    "deploymentType": event.deploymentType,
    "isPrimary": event.isPrimary,
    "userName": event.userName


    }
    this.clusterService.updateApplication(payload).subscribe((data)=>{
      this.getOnpremClusterData();
    })
  }

  viewApplicationData(){
    this.viewApplicationScreen = true;
    const theQuery = this.tableQuery?.length ? this.tableQuery : "";
    const clusterId = this.newClusterId;
    
    this.clusterService.getOnpremHostDetails(this.pageIndex, this.pageSize,clusterId, this.sortDirec,
      theQuery).subscribe((data)=>{
      this.hostNameData = data;
      data.records.forEach((item:any)=>{
        this.processArray =[];
        item.processList.map((item1:any)=>{
          
          if(item1.enabled === true){
            this.processArray.push(item1.name);
          }
          item.processListArray = this.processArray;
        })
        
          
        })
        this.totalRecords = data?.totalRecords;
      this.tableData = {
        list: data.records,
        columns: [
          { key: 'applicationName', label: 'Application', type:'addApp' },
          { key: 'serverName', label: 'Server'},
          { key: 'hostName', label: 'Host Name' },
          { key: 'processListArray', label: 'Process List' },
          { key: 'userName', label: 'Username' },
          { key: 'password', label: 'password', type:'password' },
          { key: 'Action', label: 'Action', type: 'action', edit: true, delete: true },

        ],
      }
    })
  }

  getOnpremClusterData(){
    this.onPremAddCluster();
    this.addAppclick();
    this.addClusterbtn = false;
   this.addApplicationsData = true;
    // const clusterName = 'BRM11';
    // const nameSpace = '';
    // const theQuery = this.tableQuery?.length ? this.tableQuery : "";
    // this.clusterService.getOnpremHostDetails(this.pageIndex, this.pageSize,this.sortCategory, this.sortDirec,
    //   theQuery).subscribe((data)=>{
    //   console.log(data);
    //   //  data = [{applicationName:"TEST", clusterName: "BRM11",createdAt: "2024-06-13T16:54:03",
    //   //   deploymentType : "1",hostName: "brm1.celcom.com",id: 8,ip: "172.18.0.11",isEdit: true,
    //   //   isPrimary: true,modifiedAt: "1970-01-01T05:30:00",password: "Q2VsY29tMTIzIw==",
    //   //   serverName: "TEST-VM1",userName: "ramyab@celcomsolutions.com"}]
      
    //   this.tableData = {
    //     list: data,
    //     columns: [
    //       { key: 'applicationName', label: 'Application', type:'addApp' },
    //       { key: 'serverName', label: 'Server'},
    //       { key: 'hostName', label: 'Host Name' },
    //       { key: 'processList', label: 'Process List' },
    //       { key: 'userName', label: 'Username' },
    //       { key: 'password', label: 'password', type:'password' },
    //       { key: 'Action', label: 'Action', type: 'action', edit: true, delete: true },

    //     ],
    //   }
    //   // this.addApplicationForm.patchValue({
    //   //   Application: this.addplicationDataList.Application,
    //   //   Server: this.addplicationDataList.Server,
    //   //   Processes: this.addplicationDataList.Processes,
    //   //   HostName: this.addplicationDataList.HostName,
    //   //   UserName: this.addplicationDataList.UserName,
    //   //   Password: this.addplicationDataList.Password,
       
    //   // });
    //   console.log(this.tableData);
    // })
  }

  // onpremApplication(){
  //   const theQuery = this.tableQuery?.length ? this.tableQuery : "";
  //   this.clusterService.getOnpremHostDetails(this.pageIndex, this.pageSize,this.sortCategory, this.sortDirec,
  //     theQuery).subscribe((data)=>{
  //     this.tableData = {
  //       list: data,
  //       columns: [
  //         { key: 'applicationName', label: 'Application', type:'addApp' },
  //         { key: 'serverName', label: 'Server'},
  //         { key: 'hostName', label: 'Host Name' },
  //         { key: 'processList', label: 'Process List' },
  //         { key: 'userName', label: 'Username' },
  //         { key: 'password', label: 'password', type:'password' },
  //         { key: 'Action', label: 'Action', type: 'action', edit: true, delete: true },

  //       ],
  //     }}
  //   )
  // }

  toggleRow(index: number) {
    const currentIndex = this.expandedRows.indexOf(index);
    if (currentIndex === -1) {
      this.expandedRows.push(index); // Expand if not already expanded
    } else {
      this.expandedRows.splice(currentIndex, 1); // Collapse if already expanded
    }
  }

  isRowExpanded(index: number): boolean {
    // console.log(index);
    return (this.expandedRows?.includes(index));
  }

 

  isNameSpaceAvailable(){
    return !(this.addClusterForm.value.namespace.length > 0 &&  this.addClusterForm.value.namespace.length > 0) 
     
  }
  cluster(event: any) {
    const { value } = event.target;
    this.validateAddapplications();
    const theSelectedClusterGroup = this.clusterGroupList.find((obj:any)=> (obj.id === value));
    if (theSelectedClusterGroup?.id == '4' || theSelectedClusterGroup?.id == '2' || !theSelectedClusterGroup) {
      this.addClusterForm.patchValue({
        coherenceCluster : ''
      })

      // this.addClusterForm.get('coherenceCluster')?.disable()
    }
    else {
      const obj ={
        nameSpace: this.addClusterForm.value.namespace,
        podName : 'ecs',
        kubeConfigFile : this.uploadedFilePath
      }
      this.getCoherencecluster(obj);
    }
  }
  getCoherencecluster(data:any){
    if(this.environmetTypeBtn !== "OnPrem"){
    this.clusterService.getCoherence(data).subscribe(response => {
     if(response.code == 200){
     this.addClusterForm.get('coherenceCluster')?.enable()
      this.addClusterForm.patchValue({
        coherenceCluster : response.data
      })
     }
    })
  }
  }
 
  getFileExtension(file: any) {
    return file && file.split('.').pop();
  }

  enableClusterGroup(){
    this.updatedPath = this.uploadedFilePath;
    const namespaceValue = this.addClusterForm.get('namespace')?.value;
    if (namespaceValue && this.uploadedFilePath?.length > 0 || this.environmetTypeBtn !== 'CNE') {
      this.addClusterForm.get('clusterGroup')?.enable();
    } else {
      this.addClusterForm.get('clusterGroup')?.disable();
    }

  }
 
  handleFileInput(inputValue: any): void {
    let data = [...inputValue.target.files];
    for (let f = 0; f < data.length; f++) {
      // if (this.fileExtension.length && !this.fileExtension.includes(this.getFileExtension(data[f].name).toLowerCase())) {
      //   this.handleApiResponse(false, 'Please upload ' + [...this.fileExtension] + ' only');
      //   this.myFileInput.nativeElement.value = '';
      //   this.uploadedFilePath = '';
      //   return;
      // }
      if (Math.round((data[f].size / 1024)) > 2048) {
        this.handleApiResponse(false, 'The maximum supported file size 2 MB')
        this.myFileInput.nativeElement.value = '';
        this.uploadedFilePath = '';
        return
      }
    };
    if (!this.multiple) {
      var myReader: FileReader = new FileReader();
      myReader.onloadend = (e: any) => {
 
        let url = e.target.result;
        var content = url.split(",");
        this.emitImage.emit(content);
      };
      if (data && data[0])
        myReader.readAsDataURL(data[0]);
    }
    if (data?.length)
      this.uploadFile(data)
    // this.myFileInput.nativeElement.value = '';
  }
  
  uploadFile(data:any): void {
    const formData = new FormData();
    if (data?.length > 0) {
      formData.append('file', data[0]);
      this.clusterService.uploadFile(formData).subscribe(data => {
        if (typeof (data) == 'object') {
          this.handleApiResponse((data?.code == 200) ? true : false, data.desc);
          this.uploadedFilePath = (data?.code == 200) ? data.data : "";
          this.enableClusterGroup();
          this.clusterService.getPodsNames(this.uploadedFilePath);
        }
      })    
    }
}
  atLeastOneRequiredValidator(group: FormGroup): { [key: string]: boolean } | null {
    const brmHelmChartName = group.get('brmHelmChartName')?.value;
    const eceHelmChartName = group.get('eceHelmChartName')?.value;

    if (!brmHelmChartName && !eceHelmChartName) {
      return { 'atLeastOneRequired': true };
    }

    return null;
  }

  onFileSelected(event: any): void {
    const selectedFile = event.target.files[0];
  }
  get arrayClusterPods(): FormArray {
    return this.addPodsForm.get('arrayClusterPods') as FormArray;
  }
  combinePods() {

    this.addCluster()
      .pipe(
        
        switchMap((clusterResponse: any) => {
          const clusterId = clusterResponse.data;
          return this.addPods();
        })
      )
      .subscribe(
        (response: any) => {

          if(this.isEditMode == true){
            var isSuccess = response.code == 200 ? true : false;
            const message = isSuccess ? 'Cluster updated successfully!' : 'Cluster updation failed';
            this.handleApiResponse(isSuccess, message);
            this.addClusterForm.reset()
            this.back()
          }
          else{
          var isSuccess = response.code == 200 ? true : false;
            const message = isSuccess ? 'Cluster added successfully!' : 'Cluster addition failed';
            this.handleApiResponse(isSuccess, message);
            this.addClusterForm.reset()
            this.back()
          }
        },
        (error: any) => {
          console.error('Error:', error);
        }
      );

  }

  addCluster(): Observable <any> {
    
    this.isTestClusterClicked = false;
    this.submitted = true;
    const formData = this.addClusterForm.value;
    const addInfo = this.addInformationForm.value;
    // Getting the value for disable formcontrols explicitly
    formData.coherenceCluster = this.addClusterForm?.controls['coherenceCluster'].value;


    if (this.isEditMode) {
      const formData = this.addClusterForm.value;
      const payload = {
        id: this.data.id,
        siteDetails: {
          siteName: formData.siteName,
        },
        clusterName: formData.clusterName,
        kubeConfigFile: this.updatedPath,
        nameSpace: formData.namespace,
        isPrimary: formData.isPrimary,
        deploymentType: formData.deploymentType,
        clusterGroup: formData.clusterGroup,
        clusterType:formData.environmentType,
        types: [
          {
            applicationName: formData.coherenceCluster,
          },    
        ],
        customFields:this.addInformationForm.value.addInformationData 
      };
      /*
        this.clusterService.updateCluster(payload).subscribe(
        (response) => {
          var isSuccess = response.code == 200 ? true : false;
          const message = isSuccess ? 'Cluster updated successfully!' : 'Cluster updation failed';
          this.handleApiResponse(isSuccess, message);
          this.responseArray = response
          debugger
          console.log("line on :173 , Response array value : ",this.responseArray);
        },
        (error) => {
          this.handleApiResponse(false, 'Cluster updation failed');
        }
      );
      return this.responseArray;
      */
      if (this.uploadedFilePath.length === 0) {
        this.handleApiResponse(false, 'Please select a kube config file to upload');
        return this.data;
      }
      else {
        return this.clusterService.updateCluster(payload);
    //  this.addClusterForm.reset()

    }
  }
    else {
      const payload = {
        siteDetails: { siteName: this.getPodsData.siteName },
        clusterName: this.getPodsData.clusterName,
        kubeConfigFile: this.updatedPath,
        nameSpace: this.getPodsData.namespace,
        isPrimary: this.getPodsData.isPrimary,
        deploymentType: this.getPodsData.deploymentType,
        clusterGroup: this.getPodsData.clusterGroup,
        clusterType:this.getPodsData.environmentType,
        types: [
          {
            applicationName: this.getPodsData.coherenceCluster,
          },
        ],
        customFields:this.addInformationForm.value.addInformationData
      };
      return this.clusterService.addCluster(payload);



    // /*  this.clusterService.addCluster(payload)
    //     .subscribe(
    //       (response) => {
    //         var isSuccess = response.code == 200 ? true : false;
    //         const message = isSuccess ? 'Cluster added successfully!' : 'Cluster addition failed';
    //         this.handleApiResponse(isSuccess, message);
    //       },
    //       (error) => {
    //         this.handleApiResponse(false, 'Cluster addition failed');
    //       }
    //     );

    //   this.addClusterForm.reset()
    //   
    }
    

  }

  onPremAddCluster(){
    const formData = this.addClusterForm.value;
    if(!this.isEditMode){
      const payload = {
        siteDetails: { siteName: formData.siteName },
        clusterName: formData.clusterName,
        kubeConfigFile: this.uploadedFilePath,
        nameSpace: formData.namespace,
        isPrimary: formData.isPrimary,
        deploymentType: formData.deploymentType,
        clusterGroup: formData.clusterGroup,
        clusterType:formData.environmentType,
        types: [
          {
            applicationName: formData.coherenceCluster,
          },
        ],
        customFields:this.addInformationForm.value.addInformationData
      };
     this.clusterService.addCluster(payload).subscribe((data)=>{
      this.newClusterId = data.clusterId;
     });
    }
    else{
     const payload = {
       id:this.data.id,
        siteDetails: {siteName: formData.siteName},
        clusterName: formData.clusterName,
        nameSpace : "",
        isPrimary : formData.isPrimary,
        deploymentType: formData. deploymentType,
        clusterGroup: this.data.clusterGroup,
        clusterType: formData.environmentType
        ,
        types: [
          {}
        ],
        customFields: this.addInformationForm.value.addInformationData
      }
      this.clusterService.updateCluster(payload).subscribe((data)=>{
        if(data.status === "SUCCESS"){
         this.toastService.success(data.desc);
        }
        else{
          this.toastService.error(data.desc);
        }
        this.back();
      })
    }
  }

  
  // addPods(): Observable<any> {
  //   const formData = this.addClusterForm.value;
  //   if (this.addPodsForm.valid) {
  //     const arrayClusterPods = this.addPodsForm.get('arrayClusterPods') as FormArray;
  //       const podCategoryList = arrayClusterPods.controls.map(control => {
  //       return {
  //         podCategory: control.get('podCategory')?.value,
  //         podName: control.get('podName')?.value
  //       };
  //     });

  //     if(this.isEditMode){
  //       const payload = 
  //       {
  //        id: this.thePodDetails.id,
  //        clusterName:this.thePodDetails.clusterName,
  //        podCategoryList: [
  //          {
  //            podCategory: this.clusterPods.podCategory,
  //            podName: this.clusterPods.podName
  //          }
  //        ],
  //        siteId: this.clusterPods.siteId
  //      }
  //      return this.clusterService.updatePods(payload)
  //    } else {
  //     const payload = {
  //       clusterName: this.getPodsData.clusterName,
  //       podCategoryList: podCategoryList,
  //       siteId: this.getPodsData.siteName
  //     };
  //    return this.clusterService.addPods(payload);

  //    }
  //   }
  //     return new Observable();
  
  // }
  addPods(): Observable<any> {
    const formData = this.addClusterForm.value;
    if (this.addPodsForm.valid) {
      const arrayClusterPods = this.addPodsForm.get('arrayClusterPods') as FormArray;
      const podCategoryList = arrayClusterPods.controls.map(control => {
        let podCategory = control.get('podCategory')?.value;
        
        // Check if podCategory is empty and set it to 'Others' if it is
        if (!podCategory || podCategory.trim() === '') {
          podCategory = 'Others';
        }
  
        return {
          podCategory: podCategory,
          podName: control.get('podName')?.value
        };
      });
  
      if (this.isEditMode) {
        const arrayClusterPods = this.addPodsForm.get('arrayClusterPods') as FormArray;
        const podCategoryList = arrayClusterPods.controls.map(control => {
          return {
            podCategory: control.get('podCategory')?.value, // Assuming the value is not empty
            podName: control.get('podName')?.value
          };
        });
  const payload = {
    id: this.thePodDetails.id,
    clusterName: this.thePodDetails.clusterName,
    podCategoryList: podCategoryList,
    siteId: this.thePodDetails.siteId,
    releaseName: this.thePodDetails.releaseName // Assuming you have releaseName in thePodDetails
  };


        return this.clusterService.updatePods(payload);
      } else {
        const payload = {
          clusterName: this.getPodsData.clusterName,
          podCategoryList: podCategoryList,
          siteId: this.getPodsData.siteName
        };
        return this.clusterService.addPods(payload);
      }
    }
    return new Observable();
  }
  


  private handleApiResponse(isSuccess: boolean, messageText: string): void {
    const messageType = isSuccess ? MessageType.Success : MessageType.Error;
    this.message = { type: isSuccess ? MessageType.Success : MessageType.Error, text: messageText };
    this.messageService.showMessage(messageText, messageType);
  }
 
  getPodsList(){
    this.clusterService.getAllPods(this.data.clusterName,this.data.nameSpace).subscribe((response:any)=>{
      this.podsData = response;
      if(this.data){
      this.addPodsForm.patchValue({
          id: this.podsData.id,
          clusterName:this.podsData.clusterName,
          podCategoryList: [
            {
              podCategory: this.podsData.podCategory,
              podName: this.podsData.podName
            }
          ],
          releaseName:this.podsData.releaseName,
          siteId: this.podsData.siteId,
          createdAt:this.podsData.createdAt,
          modifiedAt: this.podsData.modifiedAt
        });
      }
    })
  
  }
  
  
 
  getAllPodCategory() {
    this.clusterService.getClusterPods().subscribe((response: any) => {
      this.podCategoryList = response;
      
    });
  }
  cancel() {
    this.location.back();
  }


  get f() { return this.addClusterForm?.controls; }

  public validateFormControl() {
    this.disableSubmitButton = (this.addClusterForm.invalid) ? true : false;
  }
  back(): void {
    this.location.back();
  }
  
  getPods() {
    this.getPodsData = this.addClusterForm.value;
      this.getAllPodCategory();
    this.getClusterPodName();
    this.getpods = true;
    this.addClusterForm.disable();
    this.addInformationForm.disable();

  }

  backGetPods() {
    this.getpods = false;
  }

  getClusterPodName() {
    const clusterValue = this.addClusterForm.value
    const nameSpace = clusterValue.namespace
    const kubeConfigFile = clusterValue.kubeConfigFile
    const obj = { "nameSpace": nameSpace, "kubeConfigFile": this.uploadedFilePath }
    this.clusterService.getPodsNames(obj).subscribe(response => {
      this.clusterPods = response.deployments;
      this.populateFormArray();
    });
  }
  getPodsForCluster() {
    this.clusterService.getPodsForCluster(this.data.id).subscribe(response => {
      this.thePodDetails = response.find((ele:any)=> (ele.clusterName === this.data.clusterName));
      this.clusterPods = this.thePodDetails?.podCategoryList;
      this.clusterPods?.forEach((podCategory: any) => {
        const podFormGroup = this.fb.group({
          podName: [{ value: podCategory.podName, disabled: true }],
          podCategory: podCategory.podCategory,
        });
  
        this.arrayClusterPods.push(podFormGroup);
      });
    });
  }
  populateFormArray(): void {
    this.clusterPods.forEach((deployment: any) => {
      const podFormGroup = this.fb.group({
        podName: [{ value: deployment.deploymentName, disabled: true }],
        podCategory: [''],
      });

      this.arrayClusterPods.push(podFormGroup);
    });
  }
}






