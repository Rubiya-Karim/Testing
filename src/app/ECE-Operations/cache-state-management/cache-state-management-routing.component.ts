import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CacheComponent } from './cache/cache.component';
import { EceStateComponent } from './ece-state/ece-state.component';
import { CacheStateManagementComponent } from './cache-state-management.component';
const cacheStateManagementModuleData = {title: 'Cache/ECE State Management', iconImg: 'assets/images/federation-hover.svg'};
const cacheManagementModuleData = { title: 'Cache Management', iconImg: 'assets/images/ECE cache.svg' };
const eceManagementModuleData = { title: 'ECE State Management', iconImg: 'assets/images/lightning-bolt-hover.svg' };

const routes: Routes = [

    {path: '', component: CacheStateManagementComponent, data: cacheStateManagementModuleData, children: [
   
        {
           path:'', redirectTo:'cache-management', pathMatch: 'full'
        },

        {
            path:'cache', component: CacheComponent, data:cacheManagementModuleData
        },
        {
            path:'ece-state', component: EceStateComponent, data:eceManagementModuleData
        }

    ] }
    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CacheStateRoutingModule { }
