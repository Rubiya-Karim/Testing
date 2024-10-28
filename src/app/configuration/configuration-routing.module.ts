import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecurityComponent } from './security/security.component';
import { NotificationChannelComponent } from './notification-channel/notification-channel.component';
import { RolesComponent } from './roles/roles.component';
import { UserComponent } from './user/user.component';
import { PrivilegesComponent } from './privileges/privileges.component';
import { ConfigurationComponent } from './configuration.component';
import { CreateRoleComponent } from './roles/create-role/create-role.component';
import { ConnectionManagerComponent } from './connection-manager/connection-manager.component';
import { ConnectionFormComponent } from './connection-form/connection-form.component';
import { EnvironmentSetupComponent } from './environment-setup/environment-setup.component';

const routes: Routes = [
  {path: '', component: ConfigurationComponent, children:[
    { path: 'configurations/security', component: SecurityComponent, data:{ title: 'General Config', iconImg: '../../assets/images/general-config-header-orange.svg' } },
    { path: 'configurations/connection-manager', component: ConnectionManagerComponent, data:{ title: 'BRM ECE Connection Manager', iconImg: '../../assets/images/Frame 5.svg' } },
    { path: 'configurations/connection-form', component: ConnectionFormComponent, data:{ title: 'BRM ECE Connection Manager', iconImg: '../../assets/images/general-config-header-orange.svg' } },
    { path: 'configurations/notification-channel', component: NotificationChannelComponent, data:{ title: 'Notification Channels', iconImg: '../../assets/images/notification-header-orange.svg' } },
    { path: 'configurations/roles', component: RolesComponent, data:{ title: 'Roles', iconImg: '../../assets/images/roles-header-orange.svg' } },
    { path: 'configurations/user', component: UserComponent, data:{ title: 'Users', iconImg: '../../assets/images/users-header-orange.svg' } },
    { path: 'configurations/privileges', component: PrivilegesComponent, data:{ title: 'Privileges', iconImg: '../../assets/images/privileges-header-orange.svg' } },
    { path: 'create-role-component', component: CreateRoleComponent, data:{ title: 'Roles', iconImg: '../../assets/images/roles-header-orange.svg' } },
    { path: 'edit-role-component', component: CreateRoleComponent, data:{ title: 'Roles', iconImg: '../../assets/images/roles-header-orange.svg' } },
    { path: 'view-role-component', component: CreateRoleComponent, data:{ title: 'Roles', iconImg: '../../assets/images/roles-header-orange.svg' } },
    { path: 'configurations/environment-setup', component: EnvironmentSetupComponent, data:{ title: 'Environment Setup', iconImg: '../../assets/images/envi-setup-header-orange.svg' }},

   { path: 'configurations/environment-setup', loadChildren: () => import('./environment-setup/environment-setup.module').then(m => m.EnvironmentSetupModule) },

    { path: 'configuration', loadChildren: () => import(`./configuration.module`).then(m => m.ConfigurationModule) },
  ]}
];
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class ConfigurationRoutingModule { }