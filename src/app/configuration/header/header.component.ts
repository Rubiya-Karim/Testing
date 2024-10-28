import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor (private commonService: CommonService, private router: Router) {

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
}
