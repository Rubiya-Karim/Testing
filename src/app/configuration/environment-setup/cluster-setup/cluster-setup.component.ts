import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClusterService } from 'src/app/services/cluster.service';
import { CommonService } from 'src/app/services/common.service';
import {ConfirmModalComponent} from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { Router, ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-cluster-setup',
  templateUrl: './cluster-setup.component.html',
  styleUrls: ['./cluster-setup.component.scss']
})
export class ClusterSetupComponent {

  rows: any;
  dialogRef: any;
  tableData!:any;
  pageIndex = 0;
  pageSize = 10;
  totalRecords: number = 0;
  sortCategory = 'modifiedAt';
  filterCategory = ['Cluster Name', 'Cluster Type', 'Deployment Type', 'Cluster Group', 'Last Modified'];
  predefinedFilterList: { [key: string]: string[] } = {'Cluster Type' : ["CNE", "onPrem"], "Deployment Type" : Object.values(this.clusterService.deploymentTypeMapping), 'Cluster Group': Object.values(this.clusterService.clusterGroupMapping)};

  calendarTypeKeys = {'Last Modified' : 2};
  selectedFilterCategory = 'Cluster Name';
  tableQuery!:string;
  noDataMsg:string = 'No Clusters found';
  hasAccess:boolean = true;
  headerButtonTitle = "Add Cluster"
  podsData:any;
  sortDirec: 'asc' | 'desc' = "desc";

  constructor( public clusterService: ClusterService,private  dialog:  MatDialog, private commonService: CommonService, private router:Router,  private route: ActivatedRoute){}

  ngOnInit(){
  }
  refreshData(event:any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    // this.tableQuery = "";
    this.getCluster();

  }
  
getFormattedKubeConfig(filePath: string | undefined | null): string {
  if (!filePath) {
    return ''; // Return an empty string if the filePath is undefined or null
  }
  const parts = filePath.split('/');
  return `../${parts.pop()}`; // pop() gets the last part of the path
}

  
  
  getCluster() {
    const theQuery = this.tableQuery?.length ? this.tableQuery : "";

    this.clusterService.getCluster(this.pageIndex, this.pageSize,this.sortCategory, this.sortDirec,
      theQuery).subscribe(response => {
      if(!this.commonService.checkForAccessDenied(response)) {
        this.hasAccess = true;
        if (response?.code == 200 && response?.hasOwnProperty("records") && Array.isArray(response?.records)) {
        this.rows = response?.records;
        this.totalRecords = response?.totalRecords;
        this.rows.forEach((row:any) => {
            row.siteName = row?.siteDetails?.siteName;
            row.deploymentType = this.clusterService.deploymentTypeMapping[row.deploymentType];
            row.clusterGroup = this.clusterService.clusterGroupMapping[row.clusterGroup];
          });
          
        this.tableData = {
          
          list: this.rows,
          columns: [
            { key: 'clusterName', label: 'Cluster Name' },
            { key: 'clusterType', label: 'Cluster Type'},
            { key: 'deploymentType', label: 'Deployment Type'},
            { key: 'isPrimary', label: 'Is Primary'},
            { key: 'siteName', label: 'Site Name' },
            { key: 'clusterGroup', label: 'Cluster Group' },
            { key: 'modifiedAt', label: 'Last Modified',format:'date' },
            { key: 'Action', label: 'Action', type: 'action', edit: true, view: true, delete: true }
          ],
          uniqueKey: 'id'
        }
        
      } else { 
        this.tableData = "empty";
      }
    } else {
      this.hasAccess = false;
    }
    });
  
}

onServerSearch(event:any) {
  var filterValue = event.searchText;
  if (filterValue) {
    if (event.filterKey === "deploymentType") {
      filterValue = this.getKeyByValue(this.clusterService.deploymentTypeMapping, filterValue);
    }
    if (event.filterKey === "clusterGroup") {
      filterValue = this.getKeyByValue(this.clusterService.clusterGroupMapping, filterValue);
    }

    this.tableQuery = "&filterField=" + event.filterKey + "&filterValue=" + filterValue; 
    this.pageIndex = 1;
  } else {
    this.tableQuery = "";
  }
  this.getCluster();
}

getKeyByValue(mapping:{ [key: number]: string }, value: string): number | undefined {
  const entry = Object.entries(mapping).find(([key, val]) => val === value);
  return entry ? Number(entry[0]) : undefined;
}

onDelete(row: any) {
  const dialog: any = {
    template: ConfirmModalComponent,
    data: {
      description: `Delete the <br> selected Cluster?`,
      id: row.id,
      image:"assets/images/trash-red-outline.svg",
      showNoButton:true,
      yesButton:"Delete"
    }
  }
  this.commonService.openDialog(dialog, (res: any) => {
    if (res) {
      this.clusterService.deleteCluster(dialog.data.id).subscribe(data => {
        this.getCluster()
      })
    }
  });
}

onEdit(row: any) {
  this.router.navigate(['cluster-form'], {
    relativeTo: this.route,
    state: { data: { isEditMode: true,clusterData:row,id:row.id } }
  });

}
onView(row: any) {
  console.log('on view');
  this.router.navigate(['view-cluster'], {
    relativeTo: this.route,
    state: { data: { id: row.id } } 
  });
}

buttonEvent(row:any) {
  this.router.navigate(['cluster-form'], {relativeTo: this.route});
//   const dialogRef = this.dialog.open(ClusterFormComponent, {
//     width: '629px',
   
// });
// dialogRef.afterClosed().subscribe((result: any) => {
//   this.getCluster();
// });
}

yes() {
  this.dialogRef?.close(true)
}


}
