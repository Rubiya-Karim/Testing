import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ClusterService } from 'src/app/services/cluster.service';
import { ProcessManagementService } from 'src/app/services/process-management.service';
import { CommonService } from 'src/app/services/common.service';


@Component({
  selector: 'app-view-cluster',
  templateUrl: './view-cluster.component.html',
  styleUrls: ['./view-cluster.component.scss']
})
export class ViewClusterComponent {
  cluster!:any;
  formattedCustomFields!: string;
  tableData!:any;
  pageIndex = 0;
  pageSize = 10;
  totalRecords: number = 0;
  sortCategory = 'clusterName';
  sortDirec: 'asc' | 'desc' = "desc";
  noDataMsg = 'No Details Found';

  constructor( private location: Location, private clusterService:ClusterService, private processManagementService:ProcessManagementService, private commonService:CommonService){}

  ngOnInit() {
    const data = history.state.data;
    this.viewCluster(data.id)
  }

  back(): void {
    this.location.back();
  }

  viewCluster(iClusterID:string) {
    this.clusterService.getClusterForID(iClusterID).subscribe((response) => {
        this.cluster = response;
        if (this.cluster?.clusterType === "CNE") {
          this.viewDeployments();
        } else {
          this.viewProcesses();
        }
    });
  }

  viewProcesses() {
    this.clusterService.getProcesses(this.cluster?.id).subscribe((response) => {
      if (response && !this.commonService.checkNullOrUndefined(response) && Array.isArray(response) && response?.length > 0) {
        this.totalRecords = response?.length;        
        this.tableData = {
          list: response,
          columns: [
            { key: 'serverName', label: 'Server Name' },
            { key: 'processName', label: 'Process Name'},
          ],
          uniqueKey: 'id'
        }
      } else {
        this.tableData = 'empty';
      }
    });
  }

  viewDeployments() {
    this.processManagementService.getAggregateDeploymentsForCluster(this.cluster?.clusterName, this.cluster?.nameSpace).subscribe((response) => {
      if (response && !this.commonService.checkNullOrUndefined(response) && response?.hasOwnProperty("deployments") && Array.isArray(response?.deployments) && response?.deployments?.length > 0) {
        this.totalRecords = response?.deployments?.length; 
        response?.deployments?.forEach((row:any) => {
          row.podCount = row.podDetails ? row.podDetails?.length: "0";
        });   
        this.tableData = {
          list: response?.deployments,
          columns: [
            { key: 'deploymentName', label: 'Deployment Name' },
            { key: 'deploymentType', label: 'Deployment Type'},
            { key: 'podCount', label: 'POD Count' },
            { key: 'status', label: 'Status'},
            { key: 'podCategory', label: 'POD Category' },
          ],
          uniqueKey: 'deploymentName'
        }
      } else {
        this.tableData = 'empty';
      }
    });
  }

  isCNE():boolean {
    return this.cluster?.clusterType === "CNE";
  }

  getDeploymentType():string {
    return this.clusterService.deploymentTypeMapping[this.cluster?.deploymentType]
  }
  
  getClusterGroup():string {
    return this.clusterService.clusterGroupMapping[this.cluster?.clusterGroup]
  }
}
