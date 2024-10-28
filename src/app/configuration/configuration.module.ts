import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserComponent } from './user/user.component';
import { SecurityComponent } from './security/security.component';
import { RolesComponent } from './roles/roles.component';
import { PrivilegesComponent } from './privileges/privileges.component';
import { NotificationChannelComponent } from './notification-channel/notification-channel.component';
import { ConfigurationRoutingModule } from './configuration-routing.module';
import { SharedImportsModule } from 'src/app/shared/shared-imports.module';
import { ConfigurationComponent } from './configuration.component';
import { HeaderComponent } from './header/header.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog'; 
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ClusterFormComponent } from './environment-setup/cluster-form/cluster-form.component';
import { EnvironmentSetupComponent } from './environment-setup/environment-setup.component';
import { SiteFormComponent } from './environment-setup/site-form/site-form.component';
import { CreateRoleComponent } from './roles/create-role/create-role.component';
import { ConnectionManagerComponent } from './connection-manager/connection-manager.component';
import { ConnectionFormComponent } from './connection-form/connection-form.component';


@NgModule({
  declarations: [
    UserComponent,
    SecurityComponent,
    RolesComponent,
    PrivilegesComponent,
    NotificationChannelComponent,
    ConfigurationComponent,
    HeaderComponent,
    ClusterFormComponent,
    EnvironmentSetupComponent,
    SiteFormComponent,
    CreateRoleComponent,
    ConnectionManagerComponent,
    ConnectionFormComponent
  ],
  imports: [
    SharedImportsModule,
    ConfigurationRoutingModule,
  ]
   
  
})
export class ConfigurationModule { }
