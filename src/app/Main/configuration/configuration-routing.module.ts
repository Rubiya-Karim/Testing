import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolesComponent} from '../configuration/roles/roles.component'

const routes: Routes = [
    {path:'/configuration/roles',component:RolesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    RolesComponent
    
  ],
  exports: [RouterModule]
})
export class ConfigurationComponent{}