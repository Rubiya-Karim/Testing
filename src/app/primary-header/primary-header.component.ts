import { Component, Input, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-primary-header',
  templateUrl: './primary-header.component.html',
  styleUrls: ['./primary-header.component.scss']
})
export class PrimaryHeaderComponent {
  @Input() title!: string;
  @Input() subTitle!: string;
  @Input() imageSrc!: string;
  @ViewChild('matMenu') matMenu: MatMenu | undefined
  menuTriggerNav: any;

  constructor (private commonService: CommonService, private router: Router) {

  }  

  ngOnInit() {
 
  }


  onLogout() {
    const obj: any = {
      template: ConfirmModalComponent,
      data: {
        description: `Are you sure you want to log out?`,
        image:"assets/images/exclamation-circle.png",
        showNoButton:true,
        yesButton:"Log out"
      }
    }
    this.commonService.openDialog(obj, (res: any) => {
      if (res) {
        this.commonService.onLogout();
        this.router.navigate(['/login']);
      }
    });

  }

  getUserFullName() {
    return this.commonService.getUserFullName();
  }

  getUserInitials() {
    return this.commonService.getUserInitials();
  }

  getUserName() {
    return this.commonService.getUserName();
  }

  navMenuOpen(event:any) {
    this.menuTriggerNav.openMenu();
  }
}
