import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnvironmentSetupRoutingModule } from './environment-setup-routing.module';
import { SiteSetupComponent } from './site-setup/site-setup.component';
import { ClusterSetupComponent } from './cluster-setup/cluster-setup.component'; 
import { SharedImportsModule } from 'src/app/shared/shared-imports.module';
import { ViewClusterComponent } from './view-cluster/view-cluster.component';




@NgModule({
  declarations: [
    SiteSetupComponent,
    ClusterSetupComponent,
    ViewClusterComponent
  ],
  imports: [
    CommonModule,
    EnvironmentSetupRoutingModule,
    SharedImportsModule
  ]
})
export class EnvironmentSetupModule { }
