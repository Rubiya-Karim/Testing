import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplnConfigComponent } from './appln-config.component';

const routes: Routes = [
  {path: '', component: ApplnConfigComponent, children:[
    { path: 'appln-config', component: ApplnConfigComponent, data:{ title: 'Batch Template', iconImg: '../../assets/images/terminal 1.svg' } },

    { path: 'appln-config', loadChildren: () => import(`./appln-config.module`).then(m => m.ApplnConfigModule) },
  ]}
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplnConfigRoutingModule { }
