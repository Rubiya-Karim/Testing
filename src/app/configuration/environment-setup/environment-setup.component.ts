import { Component } from '@angular/core';

@Component({
  selector: 'app-environment-setup',
  templateUrl: './environment-setup.component.html',
  styleUrls: ['./environment-setup.component.scss']
})
export class EnvironmentSetupComponent {
  routeInfo!:any;

  constructor () {
      this.routeInfo = [ {componentLink: "site", title: "Site", imgPath: "globe-alt", activeImgPath: "globe-alt-solid"},
      {componentLink: "cluster", title: "Cluster", imgPath: "puzzle-outline", activeImgPath: "puzzle-orange"}
    ]  
  }
  
  ngOnInit(){

  }
}
