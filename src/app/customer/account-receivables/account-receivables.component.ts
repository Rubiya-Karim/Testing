import { Component } from '@angular/core';
import { CustomerService } from 'src/app/services/customer.service';
import { CustomerDataService } from '../customer-data.service';

@Component({
    selector: 'app-account-receivables',
    templateUrl: './account-receivables.component.html',
    styleUrls: ['./account-receivables.component.scss']
})
export class AccountReceivablesComponent {
    receivables!: any;
    tableSectionData: { [key: string]: any[] } = {};
    noDataMsg:string = "There is no Receivable available for this account";
    isDataAvailable: boolean = false;
  
    constructor(private customerService: CustomerService, private dataService: CustomerDataService) { }

    ngOnInit() {
        const obj = this.dataService.constructPayload();
        this.getARInfo(obj);
    }
    getARInfo(obj: any) {
        this.customerService.getARInfo(obj).subscribe((response) => {
            if (response && response.length && response[0].errorCode == 200 && Array.isArray(response)) {
                this.tableSectionData["Payments"] = this.getARInfoForCategory("Payment", response)
                this.tableSectionData["Adjustments"] = this.getARInfoForCategory("Adjustment", response)
                this.tableSectionData["Others"] = response?.filter((arInfo: any) => (arInfo.name !== "Adjustment" && arInfo.name !== "Payment"));
                this.isDataAvailable = true;
            } else {
                if (response && response.length == 0) {
                  this.isDataAvailable = false;
                }
            }
        })
    }

    getARInfoForCategory(categoryName: string, list: any): Array<any> {
        return list?.filter((arInfo: any) => (arInfo.name === categoryName));
    }

    getSections():Array<string> {
        return this.tableSectionData?Object.keys(this.tableSectionData):[];
    }
}
