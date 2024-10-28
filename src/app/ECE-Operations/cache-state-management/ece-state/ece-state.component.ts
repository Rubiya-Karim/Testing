import { Component } from '@angular/core';
import { EceOperationService } from '../../ece-operation.service';
import { Location } from '@angular/common';
import { ConnectionManagerService } from 'src/app/services/connection-manager.service';
import { ClusterService } from 'src/app/services/cluster.service';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-ece-state',
  templateUrl: './ece-state.component.html',
  styleUrls: ['./ece-state.component.scss']
})

export class EceStateComponent {
  connections!: any;
  clusterList:any;

  constructor(private EceOperationSer:EceOperationService,private location: Location, private connectionService:ConnectionManagerService, private clusterService:ClusterService, private dashboardService:DashboardService) { }

  ngOnInit(): void {
    this.getAllClusters();
  }

  getAllClusters() {
    this.clusterService.getAllClusters().subscribe((response: any) => {
      this.clusterList = response.records
      this.getECEStatus();
    })
  }

  getSiteClusterName(cluster: any): string {
    if (cluster && cluster.siteDetails && cluster.clusterName) {
      return `${cluster.siteDetails.siteName} - ${cluster.clusterName}`;
    }
    return '';
  }

  getDRType(cluster:any){
    return this.dashboardService.getDRTypeString(Number(cluster.deploymentType));
  }

  getECEStatus() {
    this.clusterList.forEach((cluster:any)=> {
      if (cluster.clusterGroup === '1' ) {
        this.connectionService.getAllConnections('clusterId', cluster.id).subscribe((response: any) => {
          if (response && Array.isArray(response)) {
            const theClusterConn = response.find(obj => obj["conType"] === "3");
            if (theClusterConn) {
              const payload = {
                attributeName :"stateName",
                className:"ECE State Machine:type=StateManager",
                domainName:"ECE State Machine",
                jmxConnectionID:theClusterConn.id
              } 
              this.EceOperationSer.getEceState(payload).subscribe(response => {
                cluster.eceStatus = response.attributeValue;
              });        
            }
          }
        })
      }
    })
  }

  back(): void {
    this.location.back();
  }

}
