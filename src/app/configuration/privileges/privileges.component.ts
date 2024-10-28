import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { MessageService, MessageType } from 'src/app/services/message.service';
import { PrivilegesService } from 'src/app/services/privileges.service';
import { RolesService } from 'src/app/services/roles.service';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { Location } from '@angular/common';


interface Activity {
  activity: string;
  category: string;
  createPrivilage: boolean;
  deletePrivilage: boolean;
  modifyPrivilage: boolean;
  viewPrivilage: boolean;
  description: string;
  id: string;
  
}

@Component({
  selector: 'app-privileges',
  templateUrl: './privileges.component.html',
  styleUrls: ['./privileges.component.scss'],
  animations: [
    trigger('rotate', [
      state('expanded', style({ transform: 'rotate(-180deg)' })),
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      transition('expanded <=> collapsed', animate('0.3s ease-in-out'))
    ])
  ]
})


export class PrivilegesComponent {
  public message: { type: MessageType; text: string } | null = null;
  roles: any;
  modules: any;
  data: any;
  responseData: any;
  updates!:any;
  isNewRole:boolean = false;
  expandAll!:boolean;
  hasAccess:boolean = true;
  expandedRows: number[] = [];
  selectedRole: any;
  @Input() selectedRoleId!: string;
  @Input() shouldUpdate:boolean = false;
  @Input() isReadOnly:boolean = false;
  @Input() navigatedFromRoles:boolean = false;
  @Output() onClickUpdateEmit = new EventEmitter();
  @Output() onClickEditEmit = new EventEmitter();
  
  totalRecords: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  sortCategory = 'dateModified';
  sortDirec: 'asc' | 'desc' = "asc";
  role: any;


  constructor(public rolesService: RolesService, public privilegesService: PrivilegesService, public commonService: CommonService,
              private route: ActivatedRoute,private messageService: MessageService, private location: Location
    ) {

  }

  ngOnInit() {
    // const roleID = this.route.snapshot.paramMap.get('id');

    // this.selectedRoleId = roleID ? roleID : "";
    const theSelectedRole:any = sessionStorage.getItem('roleSelectedInRoleList');

    if (theSelectedRole) {
      const obj = JSON.parse(theSelectedRole);
      this.selectedRole = obj?.hasOwnProperty("data") ? obj.data : obj;
      this.selectedRoleId = this.selectedRole?.roleId;      
    } else {
      this.selectedRoleId = "";
    }
    this.getRoles();
  }

  isRedirectedFromRoles() {
    return (!this.navigatedFromRoles && sessionStorage.getItem('roleSelectedInRoleList')) ? true : false;
  }

  getImagePath(title:string) {
    return `assets/images/${title}.svg`;
  }

  changeRole(e: any) {
   // this.selectedRole = e?.target?.value;
   // this.selectedRoleId = this.selectedRole.roleId;
   this.selectedRoleId = e?.target?.value;
    this.getRoleActivity(this.selectedRoleId);
  }

  getRoles() {
    this.rolesService.getRoles(this.sortCategory, this.sortDirec, this.pageIndex).subscribe((response:any) => {
      if (!this.commonService.checkForAccessDenied(response)) {
        this.hasAccess = true;
        if (response?.code == 200 && response?.hasOwnProperty("records") && Array.isArray(response?.records)) {
          this.roles = response?.records;
          this.totalRecords = response?.totalRecords;
          
          if (this.selectedRoleId) {
            response?.records?.map((res:any) => this.selectedRole = (res.roleId.toString() === this.selectedRoleId) ? res : this.selectedRole);
            this.getRoleActivity(this.selectedRoleId);
          } else {
             this.selectedRole = response.records[0];
            this.selectedRoleId = this.selectedRole?.roleId;
            this.getRoleActivity(this.selectedRole?.roleId);
          }
        }
      }
      else{
        this.hasAccess = false;
      }
    })
  
  }

  getRoleActivity(roleId: any) {
    this.privilegesService.getRoleActivity(roleId).subscribe(response => {
      if (!this.commonService.checkForAccessDenied(response)) {
        this.hasAccess = true;
        const emptyObj = {};
        if (JSON.stringify(response) === JSON.stringify(emptyObj)) {
          this.isNewRole = true;
  
          this.privilegesService.getUserActivities().subscribe(newRoleActivities => {
            this.responseData = {"roleId":this.selectedRoleId, "roleName":this.selectedRole?.roleName, "activity":newRoleActivities};
            console.log('response data',this.responseData)
            this.rearrangeDataForDisplay();
          })
          
   
        } else {
          this.isNewRole = false;
          this.responseData = response;
          console.log('response data',this.responseData)

          this.rearrangeDataForDisplay();
        }
      } 
      else {
        console.log('response data',this.responseData)

        this.hasAccess = false;
      }

    }
    )
  }

  rearrangeDataForDisplay () {
    this.data = this.responseData?.activity?.map((obj: any) => ({...obj}));

    this.data = this.data?.reduce((group: { [key: string]: Activity[] }, item: Activity) => {
      if (!group[item.category]) {
        group[item.category] = [];
      }
      group[item.category].push(item);
      return group;
    }, {});
    this.modules = Object.keys(this.data);
  }

  checkboxClicked(event: any, activityData: any) {
    const chkboxData = event.target.id?.split("_");
    const aCrudText = chkboxData[0];
    const objID = chkboxData[1];

    const updatedObj = this.responseData.activity.find((obj: any) => {
      return obj.id === objID;
    });
    this.updates = {key:aCrudText , value:updatedObj};
    updatedObj[aCrudText] = event.target.checked;
  }

  onSubmit() {
    console.log(this.selectedRole)
    if (this.isReadOnly) {
      this.isReadOnly = false;
      this.onClickEditEmit.emit();
    } else {
      if (this.shouldUpdate && this.navigatedFromRoles) {
        this.onClickUpdateEmit.emit();
      }
      if (this.isNewRole) {
        this.responseData?.activity?.map((res:any) => {
          res.createPrivilage = (this.commonService.checkNullOrUndefined(res.createPrivilage)) ? false : res.createPrivilage;
          res.deletePrivilage = (this.commonService.checkNullOrUndefined(res.deletePrivilage)) ? false : res.deletePrivilage;
          res.modifyPrivilage = (this.commonService.checkNullOrUndefined(res.modifyPrivilage)) ? false : res.modifyPrivilage;
          res.viewPrivilage = (this.commonService.checkNullOrUndefined(res.viewPrivilage)) ? false : res.viewPrivilage;
        })
        this.expandAll = true;
  
        this.privilegesService.postRoleActivity(this.responseData).subscribe(response => {
          var isSuccess = response?.code == 200 ? true : false;
          const message = response?.description ? response.description : isSuccess ? 'New RoleActivity Created successfully!' : 'New RoleActivity Creation failed';
            this.handleApiResponse(isSuccess, message);
          },
          (error) => {
            this.handleApiResponse(false, 'New RoleActivity Creation failed');
          });
        this.expandAll = false;
      } else {
        this.expandAll = true;
        this.privilegesService.updateRoleActivity(this.responseData, this.selectedRoleId).subscribe(response => {
          var isSuccess = response?.code == 200 ? true : false;
          // const dialog: any = {
          //   template: ConfirmModalComponent,
          //   data: {
          //     description: isSuccess? `New RoleActivity Updated <br> Successfully!` : `New RoleActivity Updation <br> failed!`,
          //     showNoButton: false,
          //   }
          // }
          const message = response?.description ? response.description : isSuccess ? ' RoleActivity updated successfully!' : ' RoleActivity updation failed';
            this.handleApiResponse(isSuccess, message);
          },
          (error) => {
            this.handleApiResponse(false, ' RoleActivity updation failed');
          });
          this.expandAll = false;
  
          // this.commonService.openDialog(dialog, (res: any) => {
          //   if (res) {
          //     this.yes();
          //     this.getRoleActivity(this.selectedRoleId);
          //   }
          // });
         
      }
    }

  }
  private handleApiResponse(isSuccess: boolean, messageText: string): void {
    const messageType = isSuccess ? MessageType.Success : MessageType.Error;
    this.message = { type: isSuccess ? MessageType.Success : MessageType.Error, text: messageText };
    this.messageService.showMessage(messageText, messageType);
  }

  toggleRow(index: number) {
    const currentIndex = this.expandedRows.indexOf(index);
    if (currentIndex === -1) {
      this.expandedRows.push(index); // Expand if not already expanded
    } else {
      this.expandedRows.splice(currentIndex, 1); // Collapse if already expanded
    }
  }

  isRowExpanded(index: number): boolean {
    return (this.expandedRows?.includes(index));
  }

  back(): void {
    this.location.back();  
    sessionStorage.removeItem("roleSelectedInRoleList");  
  }

  cancel():void {
    this.back();
    sessionStorage.removeItem("roleSelectedInRoleList");  
  }

  ngOnDestroy():void {
    sessionStorage.removeItem("roleSelectedInRoleList");  
  }

yes() {
  this.commonService.hideDialog();
}
}
