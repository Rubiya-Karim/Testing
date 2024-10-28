import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClusterService } from 'src/app/services/cluster.service';
import { MessageService, MessageType } from 'src/app/services/message.service';
import { Location } from '@angular/common';
import { ProcessManagementService } from 'src/app/services/process-management.service';


@Component({
  selector: 'app-site-form',
  templateUrl: './site-form.component.html',
  styleUrls: ['./site-form.component.scss']
})
export class SiteFormComponent {
  isEditMode! : boolean;
  addSiteForm!:FormGroup;
  data!:any;
  countryList!:any;
  public message: { type: MessageType; text: string } | null = null;
  constructor(private fb: FormBuilder,
    private clusterService: ClusterService,
    private messageService: MessageService,
    private processManagementService: ProcessManagementService,
    private location: Location){}

  ngOnInit(){
    this.data = history.state.data;
    this.getCountries();

  this.isEditMode = this.data ? this.data.isEditMode === true : false;
    this.addSiteForm = this.fb.group({
      siteName: [''],
      siteDesc: [''],
      location:[''],
      city:[''],
      country:[''],
      geoLoc:[''],
      bandwidth:[''],
      latency:['']
    });
    if (this.isEditMode) {
      const {city, country } = this.data.siteData;
      console.log(this.data.siteData);
      this.addSiteForm.patchValue({
        
        id: this.data.siteData.id,
        siteName: this.data.siteData.siteName,
        siteDesc: this.data.siteData.siteDesc,
        location: this.data.siteData.location,
        city: city,
        country:country,
        geoLoc: this.data.siteData.geoLoc,
        bandwidth: this.data.siteData.bandwidth,
        latency: this.data.siteData.latency
      });
    }
  }

  addSite(){
    if (this.addSiteForm.valid) {
      const formData = this.addSiteForm.value;
      if (this.isEditMode) {
        const payload = {
          ...formData,
          ["id"]: this.data.id
        };
                
        this.clusterService.updateSite(payload).subscribe(response => {
          var isSuccess = response.code == 200 ? true : false;
          this.handleApiResponse(isSuccess, response.desc);
          this.back();
        },
        (error) => {
          this.handleApiResponse(false, 'Site updation failed');
        });
        // this.addSiteForm.reset()
      } else {
      const prefix = "Site-";
      if (!formData.siteName.startsWith(prefix)) {
        // If not present, add the prefix
        formData.siteName = prefix + formData.siteName;
      }
        this.clusterService.addSite(formData).subscribe(response => {
          var isSuccess = response.code == 200 ? true : false;
          this.handleApiResponse(isSuccess, response.desc);
          this.back();
        },
        (error) => {
          this.handleApiResponse(false, 'Site addition failed');
        
        });
        // this.addSiteForm.reset()

      }
    }
    
}

getCountries():any {
  this.processManagementService.getCountries().subscribe(response => {
    this.countryList = response;
  });
}


private handleApiResponse(isSuccess: boolean, messageText: string): void {
  const messageType = isSuccess ? MessageType.Success : MessageType.Error;
  this.message = { type: isSuccess ? MessageType.Success : MessageType.Error, text: messageText };
  this.messageService.showMessage(messageText, messageType);
}
back(): void {
  this.location.back();    
}
cancelSite() {
  this.back();    

}
}
