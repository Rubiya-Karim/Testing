import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerDataService } from '../customer/customer-data.service';

@Component({
  selector: 'app-secondary-header',
  templateUrl: './secondary-header.component.html',
  styleUrls: ['./secondary-header.component.scss']
})

export class SecondaryHeaderComponent {
  @Input()routeInfo!: any[];
  @Input()isCustomerModule: boolean = false;
  @Input()primaryData!:string;
  @Input()secondaryData!:string;
  @Input() isHidden: boolean = false;
  @Input() activeTabIndex: number = 0; // Input from parent to track active tab



  constructor(private router: Router, private route: ActivatedRoute, private dataService:CustomerDataService) {}

  ngOnInit() {
    if (this.isCustomerModule)
      this.selectTab(0);
  }

  getImgPath(route:any, index:number) {
    return "assets/images/" + (this.selectedTabIndex() === index ? route.activeImgPath : route.imgPath) + ".svg";
  }

  tabSelected(index:number):void {
    if(sessionStorage.getItem('sessionToggleData')) {
      sessionStorage.removeItem('sessionToggleData')
    }   
    this.dataService.setSelectedTabIndex(index); 
  }
  
  selectTab(index: number): void {
    this.dataService.setSelectedTabIndex(index);
    if (this.routeInfo) {
      const aTabRouterLink:any = this.routeInfo[this.dataService.getSelectedTabIndex()];  
      this.router.navigate([aTabRouterLink?.componentLink], { relativeTo: this.route })
    }

  }

  selectedTabIndex():number {
    return this.dataService.getSelectedTabIndex();
  }
  // Method to set the active tab when a tab is clicked
setActiveTab(index: number) {
  this.activeTabIndex = index;
}

}
