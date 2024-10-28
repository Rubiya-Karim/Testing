import { NgModule } from '@angular/core';
import { ApplnConfigComponent } from './appln-config.component';
import { ApplnConfigRoutingModule } from './appln-config-routing.module';
import { SharedImportsModule } from 'src/app/shared/shared-imports.module';



@NgModule({
  declarations: [
    ApplnConfigComponent
  ],
  imports: [
    SharedImportsModule,    
    ApplnConfigRoutingModule
  ]
})
export class ApplnConfigModule { }
