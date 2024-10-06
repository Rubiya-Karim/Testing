import { Component } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  menus =[
    {id:1,name:'Dashboard',expanded:false},
    {id:2,name:'Metrix-Dashboard',expanded:false},
    {id:3,name:'BRM Operations',expanded:false,submenu:[{name:'Process Management'},{name:'Billing & Invoicing'},{name:'Trial Bill'},{name:'Data Fix'},{name:'REL Management'},{name:'Report Framework'},]},
    {id:4,name:'ECE operations',expanded:false},
    {id:5,name:'Customer',expanded:false},
    {id:6,name:'Application Configuration',expanded:false},
    {id:7,name:'Configuration',expanded:false,submenu:[{name:'Roles'}]},
    {id:8,name:'Activity Logs',expanded:false},

  ]
}
