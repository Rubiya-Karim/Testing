import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { RolesService } from 'src/app/services/roles.service';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { Role } from 'src/app/shared/model/role';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  dialogRef: any;
  rows: any;
  tableData!:any;
  // filterCategory = ['roleName', 'status'];
  filterCategory = ['ID', 'Role Name', 'Description', 'Status', 'Last Modified'];
  statusFilterList: { [key: string]: string[] } = {'Status' : ["Active", "Inactive", "Locked"]};
  selectedFilterCategory = 'Role Name';
  calendarTypeKeys = {'Last Modified' : 2};
  tableQuery!:string;

  sortCategory = 'dateModified';
  sortDirec: 'asc' | 'desc' = "desc";

  selectedRole!: Role;
  hasAccess:boolean = true;
  totalRecords: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  headerButtonTitle = "Create Role"
  noDataMsg:string = 'No Roles found';

  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  constructor (private commonService: CommonService, public rolesService: RolesService,  private  dialog:  MatDialog,
    private router:Router, private route: ActivatedRoute) {

}  

  ngOnInit() {
  }
  refreshData(event:any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    // this.tableQuery = "";
    this.getRoles();  
  }
  getRoles() {
    const theQuery = this.tableQuery?.length ? this.tableQuery : "";

    this.rolesService.getRoles(this.sortCategory, this.sortDirec, this.pageIndex,
      this.pageSize, theQuery).subscribe((response:any) => {
      if (!this.commonService.checkForAccessDenied(response)) {
        this.hasAccess = true;
        if (response?.code == 200 && response?.hasOwnProperty("records") && Array.isArray(response?.records)) {
          this.rows = response?.records;
          this.totalRecords = response?.totalRecords;

          this.tableData = {
            list: this.rows,
            columns: [
              { key: 'roleId', label: 'ID' },
              { key: 'roleName', label: 'Role Name' },
              { key: 'description', label: 'Description' },
              { key: 'status', label: 'Status' },
              { key: 'dateModified', label: 'Last Modified', format:'date' },
              { key: 'Action', label: 'Action', type: 'action', customIcon:true, customIconTooltip:"Assign Privileges", customIconName:"star-outline", edit: true, view: true, delete: true }
            ],
            uniqueKey: 'roleId'
          }      
      } else {
        this.tableData = "empty";
      }
      }
      else {
        this.hasAccess = false;
      } 
    })
    
  }

  assignPrivilege(row:any) {
    sessionStorage.setItem('roleSelectedInRoleList', JSON.stringify(row))
    this.router.navigate(['/configurations/privileges'], {relativeTo: this.route});
  }

  onServerSearch(event:any) {
    var filterValue = event.searchText;
    if (filterValue) {
      this.tableQuery = "&filterField=" + event.filterKey + "&filterValue=" + filterValue; 
      this.pageIndex = 1;
    } else {
      this.tableQuery = "";
    }
    this.getRoles();
  }


  onEdit(row: any) {
    sessionStorage.setItem('roleSelectedInRoleList', JSON.stringify(row))
    this.router.navigate(['/edit-role-component'], {relativeTo: this.route});
  }

   onDelete(row: any) {
    const obj: any = {
      template: ConfirmModalComponent,
      data: {
        description: `Delete the <br> selected Role?`,
        image:"assets/images/trash-red-outline.svg",
        showNoButton:true,
        yesButton:"Delete",
        rowID:row.roleId
      }
    }
    this.commonService.openDialog(obj, (res: any) => {
      if (res) {
        this.rolesService.deleteRoleByName(obj.data.rowID).subscribe(data=> {
          var isSuccess = data.code == 200 ? true : false;

          const dialog: any = {
            template: ConfirmModalComponent,
            data: {
              description: isSuccess ? `Role Deleted <br> Successfully!` : `Role Delete <br> failed`,
              showNoButton: false,
            }
          }
          this.commonService.openDialog(dialog, (res: any) => {
            if (res) {
              this.getRoles();
              this.yes();
            }
          });
        })
      }
    });
  }

  onView(row: any) {
    sessionStorage.setItem('roleSelectedInRoleList', JSON.stringify({data:row, isView:true}))
    this.router.navigate(['/view-role-component'], {relativeTo: this.route});
  }
  
  createRole(obj:any) {
    sessionStorage.removeItem("roleSelectedInRoleList");
    this.router.navigate(['/create-role-component'], {relativeTo: this.route});
  }

  // checkboxClicked(obj:any) {
  //   this.selectedRole = obj.element;
  //   sessionStorage.setItem('roleSelectedInRoleList', JSON.stringify(obj.element));
  // }
  
  buttonEvent(value:any) {
    this.createRole(value);
  }

  // assignPrivileges(obj:any) {
  //   if (this.selectedRole?.roleId) {
  //     this.router.navigate(['configurations/privileges']);
  //   } else {
  //     const obj: any = {
  //       template: ConfirmModalComponent,
  //       data: {
  //         description: `Please select a Role to assign privileges.`,
  //       }
  //     }
  //     this.commonService.openDialog(obj, (res: any) => {
  //     });
  
  //   }
  // }

  yes() {
    this.dialogRef?.close(true)
  }
}
