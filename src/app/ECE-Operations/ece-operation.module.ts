import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EceOperationRoutingModule } from './ece-operation-routing.module';
import { FederationManagementComponent } from './federation-management/federation-management.component';
import { CacheStateManagementComponent } from './cache-state-management/cache-state-management.component';
import { SharedImportsModule } from 'src/app/shared/shared-imports.module';
import { FailoverRecoverComponent } from './failover-recover/failover-recover.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SubscriberTraceComponent } from './subscriber-trace/subscriber-trace.component';

@NgModule({
  declarations: [
    FederationManagementComponent,
    CacheStateManagementComponent,
    FailoverRecoverComponent,
    SubscriberTraceComponent
  ],
  imports: [
    CommonModule,
    EceOperationRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    SharedImportsModule
  ]
})
export class EceOperationModule { }
