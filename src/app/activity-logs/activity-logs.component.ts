import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivitylogsService } from 'src/app/services/activitylogs.service';
import { RolesService } from 'src/app/services/roles.service';

@Component({
  selector: 'app-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss']
})
export class ActivityLogsComponent {
  private initialLoad = true;
  operations: any;
  activities: any;
  users: any;
  roles: any;
  data: any;
  rolematched: any;
  pageIndex = 0;
  pageSize = 10;
  totalRecords: number = 0;
  sortCategory = 'activityTime';
  tableQuery!: string;
  tableData!:any; 
  sortDirec: 'asc' | 'desc' = "desc";
  activityForm!: FormGroup;
  isFormEmpty:boolean = false;
  constructor(private activityService: ActivitylogsService, private roleService: RolesService, private fb: FormBuilder) { }
  
  ngOnInit() {
    this.getOperationsList();
    this.getActivityList();
    this.getRolesList();
    this.activeForm();
    // this.getActivityLogs();
  }

  getOperationsList() {
    this.activityService.getOperations().subscribe((response: any) => {
      if (typeof response === 'object' && response !== null && response?.hasOwnProperty("operations")) {
        this.operations = response.operations
      }
    })
  }

  getActivityList() {
    this.activityService.getActivity().subscribe((response: any) => {
      if (typeof response === 'object' && response !== null && response?.hasOwnProperty("activites")) {
        this.activities = response.activites;
      }
    })
  }

  getRolesList() {
    this.activityService.getRoles().subscribe((response: any) => {
      if (typeof response === 'object' && response !== null && response?.hasOwnProperty("roles")) {
        this.roles = response.roles;
      }      
      // const roleName = localStorage.getItem('roleName')
      // if (roleName !== 'ADMIN') {
      //   // this.activityForm.get('userName')?.disable()
      //   // this.activityForm.get('roleName')?.disable()
      //   this.roleDisable = true;
      //   this.userDisable = true;
      // }
    })

  }

  isAdmin():boolean {
    return localStorage.getItem('roleName') === 'ADMIN' ? true : false;
  }

  onRoleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;
    const [roleId, roleName] = selectedValue.split(': ');

    if (roleName) {
      this.activityService.getUsers(roleName).subscribe((response: any) => {
        if (typeof response === 'object' && response !== null && response?.hasOwnProperty("userDetails")) {
          this.users = response.userDetails || [];
          this.activityForm.get('userName')?.setValue('');
        } else {
          this.users = [];
        }
      });
    } else {
      this.users = [];
    }
  }

  activeForm() {
    this.activityForm = this.fb.group({
      operationDesc: [''],
      service: [''],
      userName: [''],
      roleName: [''],
      logFromDate: [Date],
      logToDate: [Date]
    });
  }
  
  clearForm() {
    this.activeForm();
    if (this.tableData)
      this.tableData = 'empty';
    this.initialLoad = true;
    this.isFormEmpty = false;
    this.getActivityLogs();
  }

  getActivityLogs() {
    if (this.activityForm?.valid) {
      const formData = this.activityForm.value;
      const userRole = localStorage.getItem('roleName');
      const loggedInUserName = localStorage.getItem('username');
      const roleFromForm = formData?.roleName || '';
      const userNameFromForm = formData?.userName || '';
      const fromDate = formData?.logFromDate?.length === 7 ? "" : formData?.logFromDate;
      const toDate = formData?.logToDate?.length === 7 ? "" : formData?.logToDate;

      const payload: any = {
        "service": formData?.operationDesc || "",
        "operationDesc": formData?.service || "",
        "userName": this.initialLoad || !this.isAdmin() ? loggedInUserName : userNameFromForm,
        "roleName": this.initialLoad || !this.isAdmin() ? userRole : roleFromForm,
        "logFromDate": fromDate || "",
        "logToDate": toDate || ""
      };
    
      if (userRole === 'ADMIN') {
        this.activityService.queryAllLogs(this.pageIndex, this.pageSize, this.sortCategory, this.sortDirec, payload).subscribe((response: any) => {
          this.loadData(response);
        });
      } else {
        this.activityService.queryLogs(payload, this.pageIndex, this.pageSize, this.sortCategory, this.sortDirec).subscribe((response: any) => {
          this.loadData(response);
        });
      }
      // this.initialLoad = false; // Set the flag to false after the initial load
    }
  }

  loadData(response:any) {
    if (response?.code == 200 && response?.hasOwnProperty("records") && response?.records?.hasOwnProperty("activity") && Array.isArray(response?.records?.activity)) {
      const rows = response?.records?.activity;
      this.totalRecords = response?.totalRecords;
      // rows.sort((a: any, b: any) => new Date(b.activityTime).getTime() - new Date(a.activityTime).getTime());
      this.tableData = {
        list: rows,
        columns: [
          { key: 'service', label: ' Operations' },
          { key: 'operationDesc', label: ' Activity', format: 'status'},
          { key: 'userName', label: ' User ID' },
          { key: 'displayName', label: ' Name' },
          { key: 'userRole', label: 'Role '},
          { key: 'activityTime', label: 'Timestamp', format: 'date' }
        ],
        uniqueKey: 'activityTime'
      };
    } else {
      this.totalRecords = 0;
      this.tableData = "empty";
    }
}

  areAllFormControlsEmpty(): boolean {
    // Get all form controls
    const controls = this.activityForm.controls;

    // Loop through each control and check if it's empty
    for (const key in controls) {
      const theFormControlValue = controls[key].value;
      if (theFormControlValue && ((typeof theFormControlValue === 'string' && controls[key].value.trim() !== '') || (typeof theFormControlValue !== 'string' && theFormControlValue?.length != 7))) {
        return false; // If any control is not empty, return false
      }
    }
    return true; // All controls are empty
  }

  ApplyFilter() {
    this.isFormEmpty = this.areAllFormControlsEmpty();
    if (!this.isFormEmpty) {
      this.initialLoad = false; // Set the flag to false after the filter is used
      this.pageIndex = 0;
      this.getActivityLogs();  
    }
  }

  refreshData(event:any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getActivityLogs();  
  }

}