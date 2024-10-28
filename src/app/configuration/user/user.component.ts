import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { CommonService } from 'src/app/services/common.service';
import { RolesService } from 'src/app/services/roles.service';
import { UsersService } from 'src/app/services/users.service';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { CreateUpdateModalComponent } from 'src/app/shared/components/create-update-modal/create-update-modal.component';
import { MessageService, MessageType } from 'src/app/services/message.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent {
  rows: any;
  tableData: any;
  roles:any;
  // filterCategory = ['firstName', 'lastName', 'userName', 'status', 'roles', 'dateModified'];
  filterCategory = ['First Name', 'Last Name', 'EmailID', 'Status', 'Role Name', 'Last Modified'];
  statusFilterList: { [key: string]: string[] } = {'Status' : ["Active", "Inactive", "Locked"]};
  calendarTypeKeys = {'Last Modified' : 2};
  tableQuery!:string;
  noDataMsg:string = 'No Users found';

  selectedFilterCategory = 'EmailID';
  sortCategory = 'dateModified';
  headerButtonTitle = "Create User";
  dialogRef: any;
  hasAccess:boolean = true;
  sortDirec: 'asc' | 'desc' = "desc";
  pageIndex = 0;
  pageSize = 10;
  totalRecords: number = 0;
  public message: { type: MessageType; text: string } | null = null;

  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  
  constructor (private commonService: CommonService, public usersService: UsersService, public rolesService: RolesService, 
               private  dialog:  MatDialog, private messageService: MessageService,) {

  }  

  ngOnInit() {}
  refreshData(event:any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    // this.tableQuery = "";

    this.getRoles();
    this.getUsers();    
  }
  getRoles() {
    this.rolesService.getRoles(this.sortCategory, this.sortDirec).subscribe((response:any) => {
      if (response?.code == 200 && response?.hasOwnProperty("records") && Array.isArray(response?.records)) {
        const roleList = response?.records;
        this.totalRecords = response?.totalRecords;
        // roleList.sort((a:any, b:any) => {
        //   if (a.dateModified > b.dateModified)
        //     return -1;
        //   else
        //     return 1;
        // });
        const roles = roleList?.map((item:any) => item.roleName);
        this.roles = roles;
      }
    })
  
  }

  getUsers() {
    const theQuery = this.tableQuery?.length ? this.tableQuery : "";

    this.usersService.getUsers(this.pageIndex,
      this.pageSize,
      this.sortCategory, this.sortDirec, theQuery).subscribe((response:any) => {
      if (!this.commonService.checkForAccessDenied(response)) {
        this.hasAccess = true;
        if (response?.code == 200 && response?.hasOwnProperty("records") && Array.isArray(response?.records)) {
          this.rows = response?.records;
          this.totalRecords = response?.totalRecords;
        this.rows.forEach((row:any) => {
          row.roles = row?.roles?.roleName;
          row.deleteBtnDisabled = row.status === "Inactive"
        });
        this.tableData = {
          list: this.rows,
          columns: [
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'userName', label: 'EmailID' },
            { key: 'roles', label: 'Role Name' },
            { key: 'status', label: 'Status' },
            { key: 'dateModified', format:'date', label: 'Last Modified', enableSort: true},
            { key: 'Action', label: 'Action', type: 'action', edit: true, view: false, delete: true }
          ],
          uniqueKey: 'userName'
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
    this.tableQuery = "&filterField=" + event.filterKey + "&filterValue=" + filterValue; 
    this.pageIndex = 1;
  } else {
    this.tableQuery = "";
  }
  this.getUsers();
}


onEdit(row: any) {
  this.dialogRef = this.dialog.open(CreateUpdateModalComponent, {height: '450px', width: '473px', data:{title:"Edit User", obj:row, isNew:false, parentType:1, roles:this.roles }});
  this.dialogRef.afterClosed().subscribe((result: any) => {
    this.getUsers();
  }); }

  onDelete(row: any) {
    const dialog: any = {
      template: ConfirmModalComponent,
      data: {
        description: `Delete the <br> selected User?`,
        userName: row.userName,
        image:"assets/images/trash-red-outline.svg",
        showNoButton:true,
        yesButton:"Delete"
      }
    }
    this.commonService.openDialog(dialog, (res: any) => {
      if (res) {
        this.usersService.deleteUserById(dialog.data.userName).subscribe(data => {
          var isSuccess = data.code == 200 ? true : false;
          const message = data?.desc ? data.desc : data.description
          this.handleApiResponse(isSuccess, message);
          this.getUsers();
          this.yes();
        })
      }
    });
  }

  onUnlock(row:any) { 

  }

  buttonEvent(value:any) {
    this.createUser(value);
  }

  createUser(obj:any) {
    this.dialogRef = this.dialog.open(CreateUpdateModalComponent,{height: '450px', width: '473px', data:{title:"Create New User", obj:null, isNew: true, parentType:1, roles:this.roles}});
    this.dialogRef.afterClosed().subscribe((result: any) => {
      this.getUsers();
    }); 
  }
  
  private handleApiResponse(isSuccess: boolean, messageText: string): void {
    const messageType = isSuccess ? MessageType.Success : MessageType.Error;
    this.message = { type: isSuccess ? MessageType.Success : MessageType.Error, text: messageText };
    this.messageService.showMessage(messageText, messageType);
  }
  
  yes() {
    this.dialogRef?.close(true)
  }

}
