import { Component } from '@angular/core';
import { ClusterService } from 'src/app/services/cluster.service';
import { CommonService } from 'src/app/services/common.service';
import { SiteFormComponent } from '../site-form/site-form.component';
import {ConfirmModalComponent} from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-site-setup',
  templateUrl: './site-setup.component.html',
  styleUrls: ['./site-setup.component.scss']
})
export class SiteSetupComponent {

  rows: any;
  dialogRef: any;
  tableDataforSite: any;
  hasAccess:boolean = true;
  filterCategory = ['Site Id', 'Site Name', 'Site Description', 'Location', 'City', 'Country', 'Geo Coordinates', 'Network Bandwidth', 'Latency'];
  selectedFilterCategory = 'Site Name';
  tableQuery!:string;
  noDataMsg:string = 'No Sites found';

  headerButtonTitleforSite = "Add Site"
  sortCategory = 'id';
  sortDirec: 'asc' | 'desc' = "asc";
  pageIndex = 0;
  pageSize = 10;
  totalRecords: number = 0;


  constructor( public clusterService: ClusterService, 
    private commonService: CommonService, private router:Router,  
    private route: ActivatedRoute){}

  ngOnInit(){
  }
  refreshData(event:any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    // this.tableQuery = "";
    this.getSiteDetails();  
  }
  getSiteDetails() {
    const theQuery = this.tableQuery?.length ? this.tableQuery : "";

    this.clusterService.getClusterSite(this.pageIndex, this.pageSize,this.sortCategory, this.sortDirec, theQuery).subscribe(response => {
      if(!this.commonService.checkForAccessDenied(response)) {
        this.hasAccess = true;
        if (response?.code == 200 && response?.hasOwnProperty("records") && Array.isArray(response?.records)) {
          this.rows = response?.records;
          this.totalRecords = response?.totalRecords;

            this.tableDataforSite = {
          list: this.rows,
          columns: [
            { key: 'id', label: 'Site Id' },
            { key: 'siteName', label: 'Site Name' },
            { key: 'siteDesc', label: 'Site Description' },
            { key: 'location', label: 'Location' },
            { key: 'city', label: 'City' },
            { key: 'country', label: 'Country' },
            { key: 'geoLoc', label: 'Geo Coordinates' },
            { key: 'bandwidth', label: 'Network Bandwidth' },
            { key: 'latency', label: 'Latency' },
            { key: 'Action', label: 'Action', type: 'action', edit: true, view: false, delete: true }
          ],
          uniqueKey: 'userName'
        }
      }  else { 
        this.tableDataforSite = "empty";
      }
    } else {
      this.hasAccess = false;
    }
    });
  
  }

  onServerSearch(event:any) {
    var filterValue = event.searchText;
    if (filterValue) {
      this.tableQuery = "&filterField=" + event.filterKey + "&filterValue=" + filterValue; 
      this.pageIndex = 1;
    } else {
      this.tableQuery = "";
    }
    this.getSiteDetails();
  }


//   onEditSite(row:any){
//     this.router.navigate(['site-form', {data:{isEditMode: true }}], 
//     {relativeTo: this.route});
// }
onEditSite(row: any) {
  this.router.navigate(['site-form'], {
    relativeTo: this.route,
    state: { data: { isEditMode: true,siteData:row,id:row.id } }
  });
}

buttonEventSite(value:any){
  this.router.navigate(['site-form'], {relativeTo: this.route});  
}


onDeleteSite(row:any){
  const dialog: any = {
    template: ConfirmModalComponent,
    data: {
      description: `Delete the <br> selected Site?`,
      id: row.id,
      image:"assets/images/trash-red-outline.svg",
      showNoButton:true,
      yesButton:"Delete"
    }
  }
  this.commonService.openDialog(dialog, (res: any) => {
    if (res) {
      this.clusterService.deleteSiteDetails(dialog.data.id).subscribe(data => {
        this.getSiteDetails();
      })
    }
  });

}


}
