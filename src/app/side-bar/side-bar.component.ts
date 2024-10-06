import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  path = '';
  isHovered!: boolean;
  isHoveredIndex !: number;
  showSideBar!:boolean;
  isExpanded = false;
  isPopoverActive:boolean = false;
  expandedMenuId: number | null = null;
  isDropdownOperationEnabled: boolean = false;
  isDropdownConfigEnabled: boolean = true;
  menus = [ { id: 1, name: 'Dashboard', expanded: false , routerLink:"/dashboard", cssclass:"dashboard-image"},
            { id: 2, name: 'Metric Dashboard', expanded: false , routerLink:"/dash-report", cssclass:"dashboard-metric-image"},
            { id: 4, name: 'BRM Operations', expanded: false ,  cssclass:"operations-image", vector:"assets/images/vector-operations.png", vectorCSS:"vectorimg",
                submenu:[{name:"Process Management", routerLink:"operation/process-management-dashboard", cssclass:"processimg", imgPopoverPath:"assets/images/process-outline.svg", imgPath:"assets/images/process-solid.svg"},
                         {name:"Billing & Invoicing", routerLink:"operation/schedule-list", cssclass:"scheduleimg", imgPopoverPath:"assets/images/Job-outline.svg", imgPath:"assets/images/Schedule Job.svg"},
                         //{name:"Mbean", routerLink:"operation/mbean", cssclass:"mbeanimg", imgPopoverPath:"assets/images/globe-alt.svg", imgPath:"assets/images/globe-alt-solid.svg"},
                         {name:"Trial Bill", routerLink:"operation/trial-bill", cssclass:"trialbillimg", imgPopoverPath:"assets/images/Trail-bill-outline.svg", imgPath:"assets/images/Trialbill-solid.svg "},
                         {name:"Data Fix", routerLink:"operation/data-fix", cssclass:"trialbillimg", imgPopoverPath:"assets/images/data-fix-clipboard-copy.svg", imgPath:"assets/images/clipboard-copy-orange.svg "},
                         {name:"REL Management", routerLink:"operation/rel-jobs", cssclass:"trialbillimg", imgPopoverPath:"assets/images/presentation-chart-line.svg", imgPath:"assets/images/REL Management - Solid.svg "},
                         {name:"Report Framework", routerLink:"operation/report-framework", cssclass:"trialbillimg", imgPopoverPath:"assets/images/chip.svg", imgPath:"assets/images/chip orange.svg"},
                         {name:"Custom Scripts", routerLink:"operation/custom-scripts", cssclass:"trialbillimg", imgPopoverPath:"assets/images/terminal.svg", imgPath:"assets/images/terminal 1.svg"},
                         {name:"Compare Reports", routerLink:"operation/compare-reports", cssclass:"trialbillimg", imgPopoverPath:"assets/images/compare.svg", imgPath:"assets/images/compare-selected.svg"},
                         {name:"Recycle Suspend CDR", routerLink:"operation/recycle-suspend", cssclass:"trialbillimg", imgPopoverPath:"assets/images/recycle.svg", imgPath:"assets/images/recycle-orange.svg"},
                        ]},
            { id: 3, name: 'ECE Operations', expanded: false , cssclass:"ECEoperations-image", vector:"assets/images/ece-operations-hover.svg", vectorCSS:"vectorimg",
                submenu:[{name:"Federation Management", routerLink:"ece-operation/federation-management", cssclass:"processimg", imgPopoverPath:"assets/images/federation.svg", imgPath:"assets/images/federation-hover.svg"},

    { name: "Failover / Recover", routerLink: "ece-operation/failover-recover", cssclass: "scheduleimg", imgPopoverPath: "assets/images/Failover.svg", imgPath: "assets/images/Failover-hover.svg" },
    { name: "Cache State / ECE State", routerLink: "ece-operation/cache-management", cssclass: "scheduleimg", imgPopoverPath: "assets/images/cache.svg", imgPath: "assets/images/lightning-bolt-hover.svg" },
    { name: "Subscriber Trace", routerLink: "ece-operation/subscriber-trace", cssclass: "scheduleimg", imgPopoverPath: "assets/images/subscriber-trace.svg", imgPath: "assets/images/subscriber-trace-hover.svg" },

    { name: "Mbean", routerLink: "ece-operation/mbean", cssclass: "mbeanimg", imgPopoverPath: "assets/images/globe-alt.svg", imgPath: "assets/images/globe-alt-solid.svg" },
    ]
  },
  { id: 5, name: 'Customer', expanded: false, routerLink: "/account-details", cssclass: "customer-image", },
  { id: 7, name: 'Application Configuration', expanded: false , routerLink:"/appln-config", cssclass:"appln-config-image",
    submenu: [{name: "Batch Template", routerLink: "/appln-config", cssclass:"processimg", imgPopoverPath:"assets/images/process-outline.svg", imgPath:"assets/images/process-solid.svg" },
    ]},
  {
    id: 6, name: 'Configuration', expanded: false, cssclass: "config-image", vector: "assets/images/vector-configurations.png", vectorCSS: "vectorimg1",
    submenu: [{ name: "General Config", routerLink: "/configurations/security", cssclass: "securityimg", imgPopoverPath: "assets/images/color-swatch.svg", imgPath: "assets/images/color-swatch-solid.svg" },
    { name: "Connection Manager", routerLink: "/configurations/connection-manager", cssclass: "connection-image", imgPopoverPath: "assets/images/connection manager nav icon.svg", imgPath: "assets/images/Connection Manager-orange.svg" },
    { name: "Notification Channel", routerLink: "configurations/notification-channel", cssclass: "notifyimg", imgPopoverPath: "assets/images/bell-out.svg", imgPath: "assets/images/bell-solid.svg" },
    { name: "Roles", routerLink: "configurations/roles", cssclass: "rolesimg", imgPopoverPath: "assets/images/roles-Icon.svg", imgPath: "assets/images/roles-Icon-solid.svg" },
    { name: "Users", routerLink: "configurations/user", cssclass: "usersimg", imgPopoverPath: "assets/images/users-outline.svg", imgPath: "assets/images/users-solid.svg" },
    { name: "Privileges", routerLink: "configurations/privileges", cssclass: "privilegesimg", imgPopoverPath: "assets/images/star-outline.svg", imgPath: "assets/images/star-solid.svg" },
    { name: "Environment Setup", routerLink: "configurations/environment-setup", cssclass: "clusterimg", imgPopoverPath: "assets/images/sun-outline.svg", imgPath: "assets/images/sun-solid.svg" }],
  },{
     id: 7, name: 'Activity Logs', expanded: false , routerLink:"activity-logs", cssclass:"logs-image",
  }];

  @ViewChild('sidebar', { static: true }) sidebarRef!: ElementRef;

  toggleMenu(menu: any, fromMouseEnter?: boolean): void {
    if (this.isExpanded) {
      // Restricting mouse over in expanded mode
      if (!fromMouseEnter) {
        // if a menu item with submenu is clicked
        if (menu.submenu) {
          // Toggle the clicked menu
          menu.expanded = !menu.expanded;
          // Close the previously expanded menu if any
          if (this.expandedMenuId !== null) {
            this.menus.find((m) => m.id === this.expandedMenuId)!.expanded = false;
          }

          // Update the expanded menu ID
          this.expandedMenuId = menu.expanded ? menu.id : null;
        } else {
          // if a menu item without submenu is clicked, if a menu item with submenu is already expanded then collapse it
          if (this.expandedMenuId !== null) {
            this.menus.find((m) => m.id === this.expandedMenuId)!.expanded = false;
            this.expandedMenuId = null;
          }
        }
      }
    } else {
      if (menu.submenu && !(fromMouseEnter && this.expandedMenuId)) {
        // Close the previously expanded menu if any
        if (this.expandedMenuId !== null) {
          this.menus.find((m) => m.id === this.expandedMenuId)!.expanded = false;
        }
        // Toggle the clicked menu
        menu.expanded = !menu.expanded;

        // Update the expanded menu ID
        this.expandedMenuId = menu.expanded ? menu.id : null;
      }
    }
  }

  onSubMenuMouseEnter(i: any) {
    this.isHovered = true;
    this.isHoveredIndex = i
  }

  onSubMenuMouseLeave() {
    this.isHovered = false;
  }

  subMenuItemClicked(menu: any) {
    menu.expanded = !menu.expanded;
    this.expandedMenuId = null;
  }

  hidePopover(event: any) {
    this.isHovered = false;
    if (!this.isExpanded) {
      const menu = this.menus.find((m) => m.id == this.expandedMenuId);
      if (menu) {
        menu.expanded = false;
      }
      this.expandedMenuId = null;
    }
  }



  constructor(private router: Router, private location: Location) {
    this.router.events.subscribe((val) => {
      this.path = this.location.path();
      if ((this.path === "/login") || (this.path === "/forgot-password") || (this.path === "/renew-password") || (this.path === "/reset-password"))
        this.showSideBar = false;
      else
        this.showSideBar = true;
    });
  }
  
}
