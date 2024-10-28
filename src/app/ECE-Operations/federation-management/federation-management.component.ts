import { Component } from '@angular/core';
import { EceOperationService } from '../ece-operation.service';
import { ClusterService } from 'src/app/services/cluster.service';
import { ConnectionManagerService } from 'src/app/services/connection-manager.service';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-federation-management',
  templateUrl: './federation-management.component.html',
  styleUrls: ['./federation-management.component.scss']
})
export class FederationManagementComponent {

  federationResponse: any;
  clusterMapping!:any;
  connections!: any;
  federationDetails:any;
  enableSiteTwo:boolean = false;
  enableSiteThree:boolean = false;
  enableSiteFour:boolean = false;

  isPrimary!:any;
  toClusters: any;
  allClusters: any;
  federationResponseArray:any[]=[];
 custerOneToTwoResponse:any;
 clusterTwoToOneResponse:any;
 clusterOneToTwo:boolean = false;
clusterTwoToOne:boolean = false;
isPrimaryCheck:any;




  constructor(private eceService:EceOperationService, private clusterService:ClusterService, private connectionService:ConnectionManagerService, private commonService:CommonService){}

  ngOnInit(){
    this.refreshView();
  }

  refreshView() {

    this.getConnections();
    setTimeout(()=>this.clusterStatus(),1000);
  }

  clusterStatus(){
    this.federationResponseArray = JSON.parse(localStorage.getItem('statusArray') || '{}');
    this.eceService.clusterDetailsData().subscribe((data)=>{
      //const clusterData = JSON.parse(data);
      this.isPrimaryCheck = data.records;
      console.log(this.isPrimaryCheck);
      this.isPrimaryCheck.map((item:any)=>{
        this.federationResponseArray?.map((item1:any)=>{
          if(item.clusterName === item1.fromClusterName){
            item1.isPrimary = item.isPrimary;
            item1.country = item.siteDetails?.country;
            item1.geoLocation = item.siteDetails?.geoLoc;

          }
        })
        
      })
  console.log(this.federationResponseArray);
    })
   
    console.log(this.federationResponseArray);
    this.custerOneToTwoResponse = this.federationResponseArray[0];
    console.log(this.custerOneToTwoResponse?.fedDetails[0]?.status);
    if(this.custerOneToTwoResponse?.fedDetails.length > 0){
      this.clusterOneToTwo = true;
    }
    this.clusterTwoToOneResponse = this.federationResponseArray[1];
    if(this.clusterTwoToOneResponse?.fedDetails.length > 0){
      this.clusterTwoToOne = true;
    }
    console.log(this.clusterTwoToOneResponse?.fedDetails[0]?.status);
  }


  getConnections() {
    this.connectionService.getAllConnections().subscribe((response: any) => {
      if (response && Array.isArray(response)) {
        this.connections = response.filter(obj => obj["conType"] === "3");
        this.getAllClusters();
      }
    })
  }

  getAllClusters() {
    this.clusterService.getAllClusters().subscribe((response: any) => {



      this.allClusters = response.records
      const theList = response?.records?.filter((obj:any)=> ((obj.clusterGroup === "ECE Cluster") || (obj.clusterGroup === "ECE & BRM Cluster") || (obj.clusterGroup === "All Apps Cluster") || (obj.clusterGroup === "1") || (obj.clusterGroup === "3") || (obj.clusterGroup === "5")));
      this.clusterMapping = this.constructKeyValuePairs(theList);
     

      this.getFedStatus();
    })
  }

  getFedStatus() {
    this.federationResponseArray=[];
    this.getClusterMapKeys()?.forEach((mapKey:any)=> {

      var thePayload = this.clusterMapping[mapKey];
       this.toClusters = thePayload.toClusters; 
      this.toClusters.forEach((cluster: any) => {
        this.isPrimary = cluster
        delete this.isPrimary.isPrimary;
      }); 
      this.clusterService.getFedStatus(thePayload).subscribe((response: any) => {
        if (typeof response === 'object' && response !== null && !response.hasOwnProperty('exceptionName')) {
          var theObj:any = this.clusterMapping[mapKey];
          if (theObj) {
            this.federationResponse = response
            
            this.federationResponseArray.push(this.federationResponse);
            localStorage.setItem('statusArray',JSON.stringify(this.federationResponseArray));
            console.log(this.federationResponseArray);
           
            
            theObj.fedStatus = this.federationResponse;
            theObj.fedStatus?.fedDetails?.forEach((theCluster:any) => {
              const theClusterConnIDObj = this.connections?.find((theConClusterObj:any) => (theConClusterObj.conCluster?.clusterId == theObj.fromClusterId));
              theCluster["jmxConnectionID"] = theClusterConnIDObj ? theClusterConnIDObj.id?.toString() : "";
            })
          }    
        }

        
      })
     
    })
   
  }

  getFedDetailsForCluster(obj:any) {
    return obj?.fedStatus?.fedDetails;
  }
  
  getFedDetailStatusCount(obj:any) {
    return obj?.statusInfo?.length;
  }

  getOtherClustCount(obj:any):number {
    return obj?.toClusters?.length + 1;
  }

  getOtherClustName(obj:any):string[] {
    return obj?.toClusters?.map((item:any) => (item.clusterName));
  }

  getFedStatusFromClustName(obj:any):string {



    return obj?.fedStatus?.fromClusterName
  }

  getFedStatusfromSiteName(obj:any):string {
    return obj?.fedStatus?.fromSiteName



  }


  getClusterMapRange(fromClusterKey:any) {
    let totalCount = 0;
    this.getFedDetailsForCluster(this.clusterMapping[fromClusterKey])?.forEach((detail:any) => {
      totalCount += Object.keys(detail.statusInfo).length;
    });
    return totalCount +1;
  }



  constructKeyValuePairs(iList:any) {
      const keyValuePairs:any = {};
      for (let i = 0; i < iList.length; i++) {
        const currentCluster = iList[i].clusterName;
          var restOfClusters = iList.slice(); // Copy the original array
          restOfClusters = restOfClusters.map((item:any) => ({clusterName:item.clusterName, clusterId: item.id, siteName: item.siteDetails.siteName, siteId:item.siteDetails.id,isPrimary: item.isPrimary }));
          restOfClusters.splice(i, 1);
          keyValuePairs[`${currentCluster}`] = {"fromClusterId":iList[i].id, "fromClusterName":iList[i].clusterName, "fromSiteID":iList[i].siteDetails.id , "fromSiteName":iList[i].siteDetails.siteName, "toClusters": restOfClusters}
        }
      return keyValuePairs;
      
  }




  getClusterMapKeys():any {
    return Object.keys(this.clusterMapping);
  }

  isFedStatusAvailable():boolean {
    return this.clusterMapping && Object.values(this.clusterMapping)?.some((obj:any) => obj.fedStatus?.fedDetails?.length > 0)
  }

  getStatusColorCode(status:string) {
    var aReturnVal = "active";
    if (status.includes("CONNECTION_WAIT")  || status.includes("STOPPED"))

      aReturnVal = "closed";
    return aReturnVal;
  }
  
  constructPayloadForInvokeOper(iOperationName:string, iClusterName:string, iJMXConnectionID:string):any {
    var theInputList: { className: string; operationName: string; parameters: { name: string; type: string; value: string; }[]; }[] = [];
    var payload = {};
    const services = ["ReplicatedFederatedCache", "XRefFederatedCache", "BRMFederatedCache", "OfferProfileFederatedCache"];
    services.forEach((aService:string) => {
      const className:string = `Coherence:type=Federation,service=${aService},responsibility=Coordinator`;
      const anInput = {
        "className": className,
        "operationName": iOperationName,
        "parameters": [
          {
            "name": "p1",
            "type": "java.lang.String",
            "value": iClusterName
          }
        ]
      }
      theInputList.push(anInput);
    })
    payload = {
      "invokeOperationInputs": theInputList,
      "jmxConnectionID": iJMXConnectionID
    }
    return payload;
  }


  start(fedDetail:any):void {
    const thePayload = this.constructPayloadForInvokeOper("start", fedDetail.clusterName, fedDetail.jmxConnectionID);
    this.displayConfirmAlert(`Do you want to Start Cluster - ${fedDetail.clusterName}?`, thePayload)
  }


  stop(fedDetail:any):void {
    const thePayload = this.constructPayloadForInvokeOper("stop", fedDetail.clusterName, fedDetail.jmxConnectionID);
    this.displayConfirmAlert(`Do you want to Stop Cluster - ${fedDetail.clusterName}?`, thePayload)
  }

  replicateAll(fedDetail:any):void {
    const thePayload = this.constructPayloadForInvokeOper("replicateAll", fedDetail.clusterName, fedDetail.jmxConnectionID);
    this.displayConfirmAlert(`Do you want to Replicate all to Cluster - ${fedDetail.clusterName}?`, thePayload)
  }

  displayConfirmAlert(iMsgDescription:string, iPayload:any) {
    const dialog: any = {
      template: ConfirmModalComponent,
      data: {
        description: iMsgDescription,
        showNoButton:true,
      }
    }
    this.commonService.openDialog(dialog, (res: any) => {
      if (res) {
        this.clusterService.invokeFedOperation(iPayload).subscribe((response: any) => {
          this.refreshView();
        });
          }
    });
  }

}
