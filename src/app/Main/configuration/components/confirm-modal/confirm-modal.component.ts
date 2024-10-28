import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';


@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {
  asPrimaryForm!:FormGroup;
  constructor(
    public dialogRef: MatDialogRef<ConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public builder:FormBuilder, private commonService:CommonService) { }
  ngOnInit(): void {
  //  console.log(this.data);
  this.asPrimaryForm = this.builder.group({
    type: this.builder.control('')
  })
  }
  yes() {
    this.dialogRef?.close(true);
    if(this.asPrimaryForm.value.type){
      const primaryData = this.asPrimaryForm.value.type;
      console.log(primaryData);
      this.commonService.changePrimary(primaryData)
    }
    

  }

  siteValue(event:any){
    console.log(event.target.value);
  localStorage.setItem('toBePrimarySiteName',event.target.value);
  }
}
