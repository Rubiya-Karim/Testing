import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CacheComponent } from './cache/cache.component';
import { EceStateComponent } from './ece-state/ece-state.component';
import { CacheStateRoutingModule } from './cache-state-management-routing.component';
import { SharedImportsModule } from 'src/app/shared/shared-imports.module';

@NgModule({
  declarations: [
    CacheComponent,
    EceStateComponent
  ],
  imports: [
    CommonModule,
    CacheStateRoutingModule,
    SharedImportsModule
  ]
})
export class CacheStateManagementModule { }
