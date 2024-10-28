import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnvironmentSetupComponent } from './environment-setup.component';
import { SiteSetupComponent } from './site-setup/site-setup.component';
import { ClusterSetupComponent } from './cluster-setup/cluster-setup.component';
import { ClusterFormComponent } from './cluster-form/cluster-form.component';
import { SiteFormComponent } from './site-form/site-form.component';
import { ViewClusterComponent } from './view-cluster/view-cluster.component';

const moduleData = { title: 'Environment Setup', iconImg: '../../assets/images/envi-setup-header-orange.svg' };

const routes: Routes = [
  {path: '', component: EnvironmentSetupComponent,children:[
    // {path: '',pathMatch :'full',redirectTo: 'configurations/environment-setup/site'},
    {path: 'site', component: SiteSetupComponent, data:moduleData },
    {path: 'cluster', component: ClusterSetupComponent,data:moduleData},
    {path: 'cluster/cluster-form', component: ClusterFormComponent,data:moduleData},
    {path: 'cluster/view-cluster', component: ViewClusterComponent,data:moduleData},
    {path: 'site/site-form', component: SiteFormComponent,data:moduleData}
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnvironmentSetupRoutingModule { }
