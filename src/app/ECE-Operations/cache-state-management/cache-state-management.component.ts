import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-cache-state-management',
  templateUrl: './cache-state-management.component.html',
  styleUrls: ['./cache-state-management.component.scss']
})
export class CacheStateManagementComponent {
  radioForm!: FormGroup;
  responseData: any;
  // onHideViewBtn: boolean = false;
  backbtn: boolean = false;
  btnStatus: boolean = true;
  link: any;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private route: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {
    debugger
    this.radioForm = this.fb.group({
      option: ['']
    });
  }

  formHasValue():boolean {
    return this.radioForm?.value?.option !== '' && !this.btnStatus;
  }

  onSubmit() {
    this.btnStatus = false;
    if(this.radioForm.value.option){
      this.radioForm.disable
    }
    if (this.radioForm.value.option === 'cache') {
       this.router.navigate(['cache'], {
       relativeTo: this.route
      });
      // this.onHideViewBtn = false;
      this.btnStatus = false;
      this.backbtn = true;

    } else if (this.radioForm.value.option === 'ece') {
      this.router.navigate(['ece-state'], {
        relativeTo: this.route
      });
      // this.onHideViewBtn = false;
      this.btnStatus = false;
      this.backbtn = true;
    } else {
      // this.onHideViewBtn = true;
      this.btnStatus = true;
      this.backbtn = false;
    }


  }

  back(): void {
    this.location.back();
    this.radioForm.reset();
    // this.onHideViewBtn = false;
    this.backbtn = false;
    this.btnStatus = true;
  }


}
