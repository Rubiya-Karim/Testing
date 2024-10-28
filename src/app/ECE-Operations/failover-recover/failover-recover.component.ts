import { Component } from '@angular/core';
import { EceOperationService } from '../ece-operation.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { CommonService } from 'src/app/services/common.service';
import { Observable,interval } from 'rxjs';
import { DashboardService, ECEDRType } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-failover-recover',
  templateUrl: './failover-recover.component.html',
  styleUrls: ['./failover-recover.component.scss']
})
export class FailoverRecoverComponent {
  constructor(private eceService:EceOperationService, private builder:FormBuilder, private commonService:CommonService, private dashboardService:DashboardService){}
  radioButtonForm! : FormGroup;
  siteFailoverActive:boolean = false;
  siteRecoverActive:boolean = false;
  isPrimaryValueSite1:boolean = true;
  isPrimaryValueSite2:boolean = false;
  isPrimaryValueSite3:boolean = false;
  isPrimaryValueSite4:boolean = false;
  siteOneData:any;
  siteTwoData:any;
  siteThreeData:any;
  siteFourData:any;
  isPrimaryData:boolean = false;
  tobePrimaryList:any=[];
  siteOneSelected:boolean = false;
  siteTwoSelected:boolean = false;
  siteThreeSelected:boolean = false;
  siteFourSelected:boolean = false;
  selectedSiteData:any;
  failOverSucess:boolean = false;
  recoverySucess:boolean = false;
  disableExecute:boolean = true;
  primaryValue:any;
  failoverrecoveryStatus:any;
  primaryclusterdata:any;
  stopClientProcess:any=[];
  disconnectBrmEceCluster:any=[];
  startSingleTonProcess:any=[];
  stopClient:boolean = false;
  disconnectBrm:boolean = false;
  startSingle:boolean = false;
  tobePrimarySName:any;
  hidedisconnectImage:boolean = false;
  hideStopClientImage:boolean = false;
  hidedStartSingleImage:boolean = false;
  orderId:any;
  autoTrigger:any;
  federationType:any;
 
  ngOnInit(){
    console.log(ECEDRType,1);
    this.commonService.updatedPrimary.subscribe((data)=>{
      console.log(data)
      this.primaryValue = data;
    })
    this.radioButtonForm = this.builder.group({
      type: this.builder.control('')
    })
    console.log(this.radioButtonForm);
    
    this.eceService.clusterDetailsData().subscribe((data)=>{
      //const clusterData = JSON.parse(data);
      console.log(data);

    })

// const data = {
//   "clusterId":"160",
//   "isPrimary":"0",
//   "tobePrimaryCluster":""
// }
    // this.eceService.failOverData(data).subscribe((data)=>{
    //   console.log(data);
    // })


    const data1 = {
      "clusterId":"160",
      "markAsPrimary":"0",
      "oldPrimaryCluster":""
  }
   
        // this.eceService.recoverData(data1).subscribe((data)=>{
        //   console.log(data);
        // })

        this.eceService.primaryClusterData().subscribe((data)=>{
          
          console.log(data);
          this.primaryclusterdata = data;
          this.siteOneData = data[0];
          console.log(this.siteOneData?.siteDetails?.siteName);
          this.siteTwoData = data[1];
          this.siteThreeData = data[2];
          this.siteFourData = data[3];
          this.isPrimaryValueSite1 = this.siteOneData?.isPrimary;
          this.isPrimaryValueSite2 =  this.siteTwoData?.isPrimary;
          this.isPrimaryValueSite3 = this.siteThreeData?.isPrimary;
          this.isPrimaryValueSite4 = this.siteFourData?.isPrimary;

          data.map((item:any)=>{
            if(!item.isPrimary){
              this.tobePrimaryList.push(item?.siteDetails?.siteName);
              console.log(this.tobePrimaryList);
            }
            else{
              this.selectedSiteData = item;
              console.log(this.selectedSiteData);
              this.federationType = ECEDRType [this.selectedSiteData.drType] ;
              console.log(this.federationType);
              this.isPrimaryData = this.selectedSiteData.isPrimary;
            }
           
          })
        })

  }

  public cmVaidation(status:any){
    if(!status.operationName.includes('cm')){
      return true;
    }

    //console.log(status)
  }

  

  toBeprimaryCluster(){
    const data = {
      "clusterId":"160",
      "isPrimary":"0",
      "tobePrimaryCluster":""
    }
        this.eceService.failOverData(data).subscribe((data)=>{
          console.log(data);
        })
    
  }

 onClickSite1(){
  console.log(this.siteOneData);
  this.siteFailoverActive = false;
  this.siteRecoverActive = false;
  this.selectedSiteData = this.siteOneData;
  this.isPrimaryData = this.siteOneData.isPrimary;
  this.siteOneSelected = true;
  this.siteTwoSelected = false;
  this.siteThreeSelected = false;
  this.siteFourSelected = false;
  this.disableExecute = false;
  this.radioButtonForm.reset();
  this.failOverSucess = false;
  this.recoverySucess = false;
 
 }

 onClickSite2(){
  this.siteFailoverActive = false;
  this.siteRecoverActive = false;
  this.selectedSiteData = this.siteTwoData;
  console.log(this.selectedSiteData);
  this.isPrimaryData = this.siteTwoData.isPrimary;
  this.siteOneSelected = false;
  this.siteTwoSelected =true;
  this.siteThreeSelected = false;
  this.siteFourSelected = false;
  this.disableExecute = false;
  this.radioButtonForm.reset();
  this.failOverSucess = false;
  this.recoverySucess = false;
 }

 onClickSite3(){
  this.siteFailoverActive = false;
  this.siteRecoverActive = false;
  this.selectedSiteData = this.siteThreeData;
  this.isPrimaryData = this.siteThreeData.isPrimary;
  this.siteOneSelected = false;
  this.siteTwoSelected = false;
  this.siteThreeSelected = true;
  this.siteFourSelected = false;
  this.disableExecute = false;
  this.radioButtonForm.reset();
  this.failOverSucess = false;
  this.recoverySucess = false;
 }

 onClickSite4(){
  this.siteFailoverActive = false;
  this.siteRecoverActive = false;
  this.selectedSiteData = this.siteFourData;
  this.isPrimaryData = this.siteFourData.isPrimary;
  this.siteOneSelected = false;
  this.siteTwoSelected = false;
  this.siteThreeSelected = false;
  this.siteFourSelected = true;
  this.disableExecute = false;
  this.radioButtonForm.reset();
  this.failOverSucess = false;
  this.recoverySucess = false;
 }

 processExecute(data?:any){
    // this.radioButtonForm = this.builder.group({
    //   gender: ['', [Validators.required]]
    // })
    console.log(this.radioButtonForm.value.type);
    console.log(this.selectedSiteData);
    console.log(this.tobePrimaryList);
    if(this.radioButtonForm.value.type === "Failover"){
      if(this.isPrimaryData){
        if(this.primaryclusterdata.length > 2){
          const dialog: any = {
            template: ConfirmModalComponent,
            data: {
              description: `Please select the Primary site <br/>
              to proceed Failover`,
              siteList : this.tobePrimaryList,
              //id: row.id,
             // image:"assets/images/trash-red-outline.svg",
              showNoButton:true,
              yesButton:"OK"
            }
          }
          this.commonService.openDialog(dialog, (res: any) => {
            console.log(res);
            if (res) {
              this.siteFailover();
              // this.clusterService.deleteCluster(dialog.data.id).subscribe(data => {
              //   this.getCluster()
              // })
            }
          });
        }
        else{
          console.log(this.tobePrimaryList);
          this.siteFailover();
          
        }
       
      }
      else{
        const dialog: any = {
          template: ConfirmModalComponent,
          data: {
            description: `Do you want selected site 
            to proceed Failover?`,
          
            //id: row.id,
           // image:"assets/images/trash-red-outline.svg",
            showNoButton:true,
            yesButton:"OK"
          }
        }
        this.commonService.openDialog(dialog, (res: any) => {
          if (res) {
            this.siteFailover();
            // this.clusterService.deleteCluster(dialog.data.id).subscribe(data => {
            //   this.getCluster()
            // })
          }
        });
      }
    }

    else if(this.radioButtonForm.value.type === "Recover")
    {
      const dialog: any = {
        template: ConfirmModalComponent,
        data: {
          description: `Do you want to recover the Selected Cluster?`,
          radioButton:true,
          //siteList : this.tobePrimaryList,
          //id: row.id,
         // image:"assets/images/trash-red-outline.svg",
          showNoButton:true,
          yesButton:"Yes"
        }
      }
      this.commonService.openDialog(dialog, (res: any) => {
        console.log(res);
        if (res) {
          this.siteRecover();
          

        }})
      
    }
   
  }

  failOverOnclick(){
    this.failOverSucess = false;
  this.recoverySucess = false;
  this.failoverrecoveryStatus=[];
  this.stopClientProcess=[];
   this.disconnectBrmEceCluster=[];
  this.startSingleTonProcess=[];
  this.siteFailoverActive = true;
  this.siteRecoverActive = false;
  this.disableExecute = false;
    // if(!this.disableExecute){
    //   this.siteFailoverActive = true;
    //   this.siteRecoverActive = false;
    // }
   
  }

  recoveryOnclick(){
    this.failOverSucess = false;
  this.recoverySucess = false;
  this.failoverrecoveryStatus=[];
  this.stopClientProcess=[];
   this.disconnectBrmEceCluster=[];
  this.startSingleTonProcess=[];
  this.siteFailoverActive = false;
      this.siteRecoverActive = true;
      this.disableExecute = false;
    // if(!this.disableExecute){ 
    //   this.siteFailoverActive = false;
    //   this.siteRecoverActive = true;
    // }
   
  }

  siteFailover(){
    // this.siteFailoverActive = true;
    // this.siteRecoverActive = false;

    //to make a cluster direct failover
    console.log(this.selectedSiteData);
    if(!this.selectedSiteData.isPrimary){
      const data = {"clusterId":this.selectedSiteData.id.toString(),
      "isPrimary": "0",
      "tobePrimaryCluster": "null"
    }
    this.eceService.failOverData(data).subscribe((res)=>{
      console.log(res); 
      this.failOverSucess = true;
      this.orderId = res.orderId;
    this.eceService.failOverRecoveryStatus(this.orderId).subscribe((data)=>{
      console.log(data);
      this.failoverrecoveryStatus = data;
      this.failoverStatus();
      this.failoverrecoveryStatus.map((item:any)=>{
        if(item.opStatus == 0 || item.opStatus ==1){
          this.autoTrigger = interval(10000).subscribe((val:any)=>{
            console.log(item.opStatus);
               if(item.opStatus == 0 || item.opStatus ==1){
                this.eceService.failOverRecoveryStatus(this.orderId).subscribe((data)=>{
                  console.log(data);
                  this.failoverrecoveryStatus=[];
                  this.stopClientProcess=[];
                  this.disconnectBrmEceCluster=[];
                  this.startSingleTonProcess=[];
                  this.failoverrecoveryStatus = data;
                this.failoverStatus();
                })
              }
          })
  }
  else{
    this.doStuff()
  }

 })
    })

    this.eceService.primaryClusterData().subscribe((data)=>{
      console.log(data);
     
      
    })
     })
    }
    else{
      // this.eceService.primaryClusterData().subscribe((data)=>{
        this.primaryclusterdata.map((item:any)=>{
          
          if(localStorage.getItem('toBePrimarySiteName')){
            this.tobePrimarySName = localStorage.getItem('toBePrimarySiteName');
          }
          
          else{
            this.tobePrimarySName = this.tobePrimaryList[0];
          } 
        // })
       
          if(item.siteDetails.siteName === this.tobePrimarySName ){
            var tobePrimaryClusterId = item.id;
            const data = {"clusterId": this.selectedSiteData.id.toString(),
            "isPrimary": "1",
            "tobePrimaryCluster": tobePrimaryClusterId.toString()
          }
       
            this.eceService.failOverData(data).subscribe((res)=>{
        //this.eceService.primaryClusterData().subscribe((res)=>{
            console.log(res); 
            this.failOverSucess = true;
            this.orderId =res.orderId;
          this.eceService.failOverRecoveryStatus(this.orderId).subscribe((data)=>{
           
            this.failoverrecoveryStatus = data;
            this.failoverStatus();
            this.failoverrecoveryStatus.map((item:any)=>{
              if(item.opStatus == 0 || item.opStatus ==1){
                this.autoTrigger = interval(10000).subscribe((val:any)=>{
                  console.log(item.opStatus);
                     if(item.opStatus == 0 || item.opStatus ==1){
                      this.eceService.failOverRecoveryStatus(this.orderId).subscribe((data)=>{
                        console.log(data);
                        this.failoverrecoveryStatus=[];
                        this.stopClientProcess=[];
                        this.disconnectBrmEceCluster=[];
                        this.startSingleTonProcess=[];
                        this.failoverrecoveryStatus = data;
                      this.failoverStatus();
                      })
                    }
                })
        }
        else{
          this.doStuff()
        }
      
       })
          })
            this.eceService.primaryClusterData().subscribe((data)=>{
              console.log(data);
             
              
            })
          })
          }
        
        })
    
    }


  }

  failoverStatus(){
   
      this.failoverrecoveryStatus.map((item:any)=>{
        if(item.orderType == 1 && !item.operationName.includes('cm') && item.applicableTo == 1){
        this.stopClientProcess.push(item);
        console.log(this.stopClientProcess);
        if(this.stopClientProcess.length > 0){
          this.stopClient = true;
          this.stopClientProcess.map((item:any)=>{
            if(item.opStatus !== 2){
            // const repeatStatusCall =  setTimeout(  5000);
              this.hideStopClientImage = true;
            }
          })
        }
        }
        else if(item.orderType == 1 && item.operationName === 'cm' && item.applicableTo == 1){
       this.disconnectBrmEceCluster.push(item);
       console.log(this.disconnectBrmEceCluster);
       if(this.disconnectBrmEceCluster.length > 0){
        this.disconnectBrm = true;
        this.disconnectBrmEceCluster.map((item:any)=>{
          if(item.opStatus !== 2){
            this.hidedisconnectImage = true;
          }
        })
       }
        }
        else if(item.orderType == 1 && (item.applicableTo == 2 ||  item.applicableTo ==3)){
          this.startSingleTonProcess.push(item);
          console.log(this.startSingleTonProcess);
          if(this.startSingleTonProcess.length > 0){
            this.startSingle = true;
            this.startSingleTonProcess.map((item:any)=>{
              if(item.opStatus !== 2){
                this.hidedStartSingleImage = true;
              }
            })
          }
        }
        })
  }

  siteRecover(){
    // this.siteFailoverActive =false;
    // this.siteRecoverActive = true;
    if(this.primaryValue === "asPrimary"){
        this.primaryclusterdata.map((item:any)=>{
          if(item.isPrimary){
           console.log(item);
           const data= {"clusterId": "1", 
           "markAsPrimary": "1",
           "currentPrimaryCluster":item.id
         }
           this.eceService.recoverData(data).subscribe((data)=>{
              console.log(data);
              this.recoverySucess = true;
              const orderId =data.orderId; 
              //const orderId = 2024040311532;
              this.eceService.failOverRecoveryStatus(orderId).subscribe((data)=>{
                console.log(data);
                this.failoverrecoveryStatus = data;
                this.recoveryStatus();
                  this.failoverrecoveryStatus.map((item:any)=>{
                    if(item.opStatus == 0 || item.opStatus ==1){
                      this.autoTrigger = interval(10000).subscribe((val:any)=>{
                        console.log(item.opStatus);
                           if(item.opStatus == 0 || item.opStatus ==1){
                            this.eceService.failOverRecoveryStatus(orderId).subscribe((data)=>{
                              console.log(data);
                              this.failoverrecoveryStatus=[];
                              this.stopClientProcess=[];
                              this.disconnectBrmEceCluster=[];
                              this.startSingleTonProcess=[];
                              this.failoverrecoveryStatus = data;
                              this.recoveryStatus();
                            })
                          }
                          else{
                            this.doStuff()
                          }
                      })
              }})
               
              })
               
            })
          }
         
        })
    
   
    }
    else{
      const data= {"clusterId": "1", 
      "markAsPrimary": "0",
      "currentPrimaryCluster":""
    }
       this.eceService.recoverData(data).subscribe((data)=>{
         console.log(data);
         const orderId =data.orderId;
         this.recoverySucess = true;
         this.eceService.failOverRecoveryStatus(orderId).subscribe((data)=>{
           console.log(data);
           this.failoverrecoveryStatus = data;
                this.recoveryStatus();
                  this.failoverrecoveryStatus.map((item:any)=>{
                    if(item.opStatus == 0 || item.opStatus ==1){
                      this.autoTrigger = interval(10000).subscribe((val:any)=>{
                        console.log(item.opStatus);
                           if(item.opStatus == 0 || item.opStatus ==1){
                            this.eceService.failOverRecoveryStatus(orderId).subscribe((data)=>{
                              console.log(data);
                              this.failoverrecoveryStatus=[];
                              this.stopClientProcess=[];
                              this.disconnectBrmEceCluster=[];
                              this.startSingleTonProcess=[];
                              this.failoverrecoveryStatus = data;
                              this.recoveryStatus();
                            })
                          }
                          else{
                            this.doStuff()
                          }
                      })
              }})
         })
       })

    }
 
  }

  recoveryStatus(){
    this.failoverrecoveryStatus.map((item:any)=>{
      if(item.orderType == 2 && !item.operationName.includes('cm') && item.applicableTo == 1){
       
        this.stopClientProcess.push(item);
      console.log(this.stopClientProcess);
      if(this.stopClientProcess.length > 0){
        this.stopClient = true;
        this.stopClientProcess.map((item:any)=>{
          if(item.opStatus !== 2){
            this.hideStopClientImage = true;
          }
        })
      }
      }
      else if(item.orderType == 2 && item.operationName === 'cm' && item.applicableTo == 1){
     this.disconnectBrmEceCluster.push(item);
     console.log(this.disconnectBrmEceCluster);
     if(this.disconnectBrmEceCluster.length > 0){
      this.disconnectBrm = true;
      this.disconnectBrmEceCluster.map((item:any)=>{
        if(item.opStatus !== 2){
          this.hidedisconnectImage = true;
        }
      })
     }
      }
      else if(item.orderType == 2 && (item.applicableTo == 2 ||  item.applicableTo ==3)){
        this.startSingleTonProcess.push(item);
        console.log(this.startSingleTonProcess);
        if(this.startSingleTonProcess.length > 0){
          this.startSingle = true;
          this.startSingleTonProcess.map((item:any)=>{
            if(item.opStatus !== 2){
              this.hidedStartSingleImage = true;
            }
          })
        }
      }
      })
  }

  doStuff(){
    //doing stuff with unsubscribe at end to only run once
    this.autoTrigger?.unsubscribe();
}
}


