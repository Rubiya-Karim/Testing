import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService, MessageType } from 'src/app/services/message.service';
import { RolesService } from 'src/app/services/roles.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.scss']
})
export class CreateRoleComponent {
  form!: FormGroup;
  submitted = false;
  title: string = "";
  entity: any;
  roleID!:any;
  isNew: boolean = true;
  isView: boolean = true;
  showAssignPrivileges: boolean = false;
  public message: { type: MessageType; text: string } | null = null;
  sortDirec: 'asc' | 'desc' = "desc";
  pageIndex = 0;
  pageSize: number = 1;
  totalRecords: number = 0;
  sortCategory = 'dateModified';

  constructor(public rolesService: RolesService,
    private formBuilder: FormBuilder, private route: ActivatedRoute, private messageService: MessageService, private location: Location) {
  }

  ngOnInit() {
    const theSelectedRole = sessionStorage.getItem('roleSelectedInRoleList');
    if (theSelectedRole) {
      const obj = JSON.parse(theSelectedRole);
      this.entity = obj.hasOwnProperty("data") ? obj.data : obj;
      this.isView = obj.hasOwnProperty("isView") ? obj.isView : false;
    } else {
      this.isView = false;
    }
    this.showAssignPrivileges = theSelectedRole ? true : false;
    this.isNew = theSelectedRole ? false : true;
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['']
    })
    if (!this.isNew) {
      this.form.patchValue({
        name: this.entity.roleName,
        description: this.entity.description,
      })
    }
}

ngOnDestroy():void {
  sessionStorage.removeItem("roleSelectedInRoleList");
}


get f() { return this.form.controls; }

editCicked() {
  this.isView = false;
}

onSubmit() {
  if (this.isView)
    this.isView = !this.isView;
  else {
    var obj = {
      "roleName": this.form.controls['name'].value,
      "description": this.form.controls['description'].value,
    }

    if (this.isNew)
      this.createRole(obj);
    else
      this.editRole(obj);
  }
}

  cancel() {
    this.back();
  }

  createRole(obj:any) {
    this.rolesService.createRole(obj)
    .subscribe(data => {
      var isSuccess = data.code == 200 ? true : false;
      const message = data?.desc ? data.desc : data.description
      this.handleApiResponse(isSuccess, message);
      if (isSuccess) {
  
        this.rolesService.getRoles(this.sortCategory, this.sortDirec, this.pageIndex, this.pageSize).subscribe(response => {
          if (response?.code == 200 && response?.hasOwnProperty("records") && Array.isArray(response?.records)) {
            const roles = response?.records;
            this.entity = roles[0];
            this.form.get("name")?.disable()
            this.form.get("description")?.disable()
            this.showAssignPrivileges = true;
          }
        });
      
      
    }
    });
   }
  
  editRole(obj: any) {
    this.rolesService.updateRole(obj, this.entity.roleId)
      // .pipe(finalize(() => this.resetForm()))
      .subscribe(data => {
        var isSuccess = data.code == 200 ? true : false;
        const message = data?.desc ? data.desc : data.description
        this.handleApiResponse(isSuccess, message);
        this.back();
      });
  }
  
  private handleApiResponse(isSuccess: boolean, messageText: string): void {
    const messageType = isSuccess ? MessageType.Success : MessageType.Error;
    this.message = { type: isSuccess ? MessageType.Success : MessageType.Error, text: messageText };
    this.messageService.showMessage(messageText, messageType);
  }
  

//   private resetForm() {
//     this.form.reset();
//     const formValues = this.form.value;
//   this.form = this.formBuilder.group({
//     });
// this.form.patchValue(formValues);
//   }

  back(): void {
    sessionStorage.removeItem("roleSelectedInRoleList");
    this.location.back();
  }
}

