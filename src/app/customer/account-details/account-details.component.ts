import { Component, ElementRef } from '@angular/core';
import { CustomerService } from 'src/app/services/customer.service';
import { CustomerDataService } from '../customer-data.service';
import { CommonService } from 'src/app/services/common.service';
@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss']
})
export class AccountDetailsComponent {
  accountNumber!: string;
  serviceId!: string;
  data!: any;
  hierarchyData: any = [];
  rows: any;
  filterCategory = ['Account No'];
  selectedFilterCategory = 'Account No';
  sortCategory = 'accountNo';
  sortDirec: 'asc' | 'desc' = "desc";
  pageSize: number = 10;
  pageIndex: number = 0;
  noDataMsg: string = 'No child accounts available for the selected account.';
  nodes: any = [];
  isSingleAccount: boolean = false;
  formattedChartData!: any[];
  // Array to store breadcrumb navigation
  breadcrumb: Array<{ name: string, data: any[] }> = [];
  currentTableData!: any;
  selectedView: 'chart' | 'table' = 'chart';

  constructor(private customerService: CustomerService, private dataService: CustomerDataService, private commonService: CommonService, private elRef: ElementRef) {
  }


  ngOnInit() {
    this.accountNumber = this.dataService.getAccountNumber();
    this.serviceId = this.dataService.getMSISDN();

    const obj = this.dataService.constructPayload();
    const emptyObj = {};

    if (!this.commonService.checkNullOrUndefined(obj) && !(JSON.stringify(obj) === JSON.stringify(emptyObj))) {
      this.customerService.getCustomerAccount(obj).subscribe(response => {
        if (response && response.errorCode === "200") {
          this.data = response;
          this.dataService.setAccountNumber(this.data?.accountNo);
          this.dataService.setAccountStatus(this.data?.statusString);
          this.accountNumber = this.dataService.getAccountNumber();
        }
      })
    }
    this.formatChartData();
  }

  applyDynamicStyling(): void {
    // Query all elements with the class 'ngx-org-title' inside ngx-org-chart
    const elements = this.elRef.nativeElement.querySelectorAll('.ngx-org-title');

    // Loop through each element and set the dynamic content
    elements.forEach((element: HTMLElement, index: number) => {
      if (element?.textContent) {
        const nodeData = this.findItemById(this.formattedChartData, element?.textContent);
        element.style.setProperty('--dynamicTitleName', `"${nodeData.status ? nodeData.status : ''}"`);
      }
    });
  }

  formatChartData() {
    const obj = this.dataService.constructPayload();

    this.customerService.getHierarchy(obj).subscribe((response) => {
      this.hierarchyData = response;

      const formattedChartData: any[] = [];

      if (this.hierarchyData.parentAccountNo) {
        const statusCSS = this.hierarchyData.parentStatusString?.toLowerCase();
        const parentAccount: any = {
          id: this.hierarchyData.parentAccountNo,
          name: this.hierarchyData.parentName,
          cssClass: this.hierarchyData.parentPaytype == 10001 ? 'has-icon ngx-org-ceo ' + statusCSS : 'no-icon ngx-org-ceo ' + statusCSS,
          image: '/assets/images/user-circle-blue.svg',
          title: this.hierarchyData.parentAccountNo,
          status: this.hierarchyData.parentStatusString,
          childs: [] as any[],
        };
        formattedChartData.push(parentAccount);
      }
      const currentStatusCSS = this.hierarchyData.currentStatusString?.toLowerCase();
      const currentAccount: any = {
        id: this.hierarchyData.currentAccountNo,
        name: this.hierarchyData.currentName,
        cssClass: this.hierarchyData.currentPaytype == 10001 ? 'has-icon ngx-org-ceo ' + currentStatusCSS : 'no-icon ngx-org-ceo ' + currentStatusCSS,
        image: '/assets/images/user-circle-orenge.svg',
        title: this.hierarchyData.currentAccountNo,
        status: this.hierarchyData.currentStatusString,
        childs: [] as any[],
      };
      // Child accounts
      if (this.hierarchyData.childAccountNo) {
        currentAccount.childs = this.hierarchyData.childAccountNo.map((child: any) => ({
          id: child.accountNo,
          name: child.childName,
          cssClass: child.childPaytype == 10001 ? 'has-icon ngx-org-ceo ' + child.childStatusString?.toLowerCase() : 'no-icon ngx-org-ceo ' + child.childStatusString?.toLowerCase(),
          image: '/assets/images/user-circle-blue.svg',
          title: child.accountNo,
          status: child.childStatusString,
          childs: [] as any[],
        }));
      } else {
        this.isSingleAccount = true;
      }
      formattedChartData.push(currentAccount);
      this.formattedChartData = formattedChartData;
      setTimeout(() => {
        this.applyDynamicStyling();
      }, 0);
      if (!this.isSingleAccount) {
        if (this.hierarchyData.parentAccountNo) {
          const parentAccount: any = {
            id: this.hierarchyData.parentAccountNo,
            name: this.hierarchyData.parentName,
            status: this.hierarchyData.parentStatusString,
            payType: this.hierarchyData.parentPaytype,
            children: [] as any[],
          };
          this.breadcrumb.push(parentAccount);
        }
        const currentAccount: any = {
          id: this.hierarchyData.currentAccountNo,
          name: this.hierarchyData.currentName,
          status: this.hierarchyData.currentStatusString,
          payType: this.hierarchyData.currentPaytype,
          children: [] as any[],
        };
        if (this.hierarchyData.childAccountNo) {
          currentAccount.children = this.hierarchyData.childAccountNo.map((child: any) => ({
            id: child.accountNo,
            name: child.childName,
            status: child.childStatusString,
            payType: child.childPaytype,
            children: [] as any[],
          }));
        }
        this.breadcrumb.push({ name: currentAccount.id, data: currentAccount.children });
        this.loadTableData(currentAccount.children)
      }
    });
  }

  onRowClick(row: any) {
    const obj = {
      accountNo: row.id
    };

    this.customerService.getHierarchy(obj).subscribe((response) => {
      if (response?.hasOwnProperty("childAccountNo") && response.childAccountNo) {
        row.children = response.childAccountNo.map((grandchild: any) => ({
          id: grandchild.accountNo,
          name: grandchild.childName,
          status: grandchild.childStatusString,
          payType: grandchild.childPaytype,
          children: [] as any[],
        }));
      }
      this.breadcrumb.push({ name: row.id, data: row.children?.length > 0 ? row.children : [] });
      this.loadTableData(row.children);
    })
  }

  // Function to handle breadcrumb click
  goToTable(index: number) {
    this.loadTableData(this.breadcrumb[index].data);
    // Remove any tables that came after the clicked breadcrumb
    this.breadcrumb = this.breadcrumb.slice(0, index + 1);
  }

  loadTableData(iList: any[]) {
    if (iList?.length > 0) {
      this.currentTableData = {
        list: iList,
        columns: [
          { key: 'id', label: 'Account No' },
          { key: 'name', label: 'Account Name' },
          { key: 'status', label: 'Status' },
          { key: 'payType', label: 'Pay Type' },
        ],
        uniqueKey: 'id'
      };
    } else {
      this.currentTableData = 'empty';
    }
  }

  test(event: any) {
    const obj = {
      accountNo: event.id
    };

    this.customerService.getHierarchy(obj).subscribe((response) => {
      this.hierarchyData = response;
      const clickedItem = this.findItemById(this.formattedChartData, event.id);

      if (clickedItem) {
        if (this.hierarchyData.childAccountNo) {
          clickedItem.childs = this.hierarchyData.childAccountNo.map((grandchild: any) => ({
            id: grandchild.accountNo,
            name: grandchild.childName,
            cssClass: grandchild.childPaytype == 10001 ? 'has-icon ngx-org-ceo ' + grandchild.childStatusString.toLowerCase() : 'no-icon ngx-org-ceo ' + grandchild.childStatusString.toLowerCase(),
            image: '/assets/images/user-circle-blue.svg',
            title: grandchild.accountNo,
            status: grandchild.childStatusString,

            childs: [] as any[],
          }));
        }
      }
      this.formattedChartData = [...this.formattedChartData];

      setTimeout(() => {
        this.applyDynamicStyling();
      }, 0);
    });
  }

  findItemById(data: any[], id: string): any {
    for (const item of data) {
      if (item.id === id) {
        return item;
      }

      if (item.childs && item.childs.length > 0) {
        const foundItem = this.findItemById(item.childs, id);
        if (foundItem) {
          return foundItem;
        }
      }
    }

    return null;
  }

  toggleView(event:any) {
    if (event?.value && event?.value === 'chart') {
      setTimeout(() => {
        this.applyDynamicStyling();
      }, 0);      
    }
  }
  

  moveDown() {
    this.scrollToChart();
  }
  scrollToChart() {
    const chartSection = document.getElementById('chartSection');
    if (chartSection) {
      chartSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  statusColorClass(status: string): string {
    return this.dataService.getStatusColorClass(status);
  }
  getPhoneNumberListValue(iList: any): string {
    var phoneValue: string = "";
    iList?.forEach((ele: any) => {
      phoneValue = phoneValue + ele.phone + '<br>';
    })
    return phoneValue;
  }

}
