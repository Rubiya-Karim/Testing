import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ECEOperationComponent } from './ece-operation.component';
import { FederationManagementComponent } from './federation-management/federation-management.component';
import { FailoverRecoverComponent } from './failover-recover/failover-recover.component';
import { SubscriberTraceComponent } from './subscriber-trace/subscriber-trace.component';
import { MbeanComponent } from '../operations/mbean/mbean.component';

const federationManagementModuleData = { title: 'Federation Management', iconImg: 'assets/images/federation-hover.svg' };
const subscriberTraceModuleData = { title: 'Subscriber Trace', iconImg: 'assets/images/subscriber-trace-nav-icon.svg' };
const failoverRecoverModuleData = { title: 'Failover / Recover', iconImg: 'assets/images/Failover-hover.svg' };

const routes: Routes = [

  {path: '', component: ECEOperationComponent, children:[
      { path: 'ece-operation/federation-management', component: FederationManagementComponent, data: federationManagementModuleData },
      { path: 'ece-operation/subscriber-trace', component: SubscriberTraceComponent, data: subscriberTraceModuleData },
      { path: 'ece-operation/failover-recover', component: FailoverRecoverComponent, data: failoverRecoverModuleData },
      { path: 'ece-operation/mbean', component: MbeanComponent, data: { title: 'Mbeans', iconImg: 'assets/images/globe-alt-solid.svg' } },
      { path: 'ece-operation/cache-management', loadChildren: () => import(`./cache-state-management/cache-state-management.module`).then(m => m.CacheStateManagementModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EceOperationRoutingModule { }
