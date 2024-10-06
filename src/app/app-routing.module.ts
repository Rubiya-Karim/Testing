import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigurationComponent } from '../app/Main/configuration/configuration.component'

const routes: Routes = [
  {path:'/configuration',loadChildren:()=>import('../app/Main/configuration/configuration.module').then(m=>m.ConfigurationModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    ConfigurationComponent
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
