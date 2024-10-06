import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ConfigurationComponent } from './Main/configuration/configuration.component'

@NgModule({
  declarations: [
    AppComponent,
    SideBarComponent,
    ConfigurationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PopoverModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
