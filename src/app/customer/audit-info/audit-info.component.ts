import { Component } from '@angular/core';
import { CustomerDataService } from '../customer-data.service';
import { CustomerService } from 'src/app/services/customer.service';
import { CommonService } from 'src/app/services/common.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-audit-info',
  templateUrl: './audit-info.component.html',
  styleUrls: ['./audit-info.component.scss'],
  animations: [
    trigger('rotate', [
      state('expanded', style({ transform: 'rotate(-180deg)' })),
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      transition('expanded <=> collapsed', animate('0.3s ease-in-out'))
    ])
  ]
})
export class AuditInfoComponent {
  serviceinfo: any
  productInfo: any
  discountInfo: any
  accountNumber: any;
  serviceId: any;
  Audit: any;
  BillinfoAudit: any;
  i: number = 0;
  expandedRowsAccordion1: number[] = [];
  expandedRowsAccordion2: number[] = [];
  expandedRowsAccordion3: number[] = [];
  expandedRowsAccordion4: number[] = [];
  expandedRowsAccordion5: number[] = [];


  constructor(private customerService: CustomerService, private dataService: CustomerDataService,
    private commonService: CommonService) { }


  ngOnInit() {

    const obj = this.dataService.constructPayload();

    this.customerService.getAuditInfo(obj).subscribe((response: any) => {
      this.Audit = response;
    });

    this.customerService.getBillinfoAudit(obj).subscribe((response: any) => {
      this.BillinfoAudit = response;
    });

    this.getServiceAuditInfo(obj)
    this.getPurchaseProductAudInfo(obj)
    this.getPurchaseDiscountAudInfo(obj)
  }
  isRowExpanded(accordionIndex: number, row: number): boolean {
    switch (accordionIndex) {
      case 1:
        return this.expandedRowsAccordion1.includes(row);
      case 2:
        return this.expandedRowsAccordion2.includes(row);
      case 3:
        return this.expandedRowsAccordion3.includes(row);
        case 4:
          return this.expandedRowsAccordion4.includes(row);
          case 5:
            return this.expandedRowsAccordion5.includes(row);

      default:
        return false;
    }
  }
  toggleRow(accordionIndex: number, row: number) {
    let expandedRows: number[];
    switch (accordionIndex) {
      case 1:
        expandedRows = this.expandedRowsAccordion1;
        break;
      case 2:
        expandedRows = this.expandedRowsAccordion2;
        break;
      case 3:
        expandedRows = this.expandedRowsAccordion3;
        break;
        case 4:
        expandedRows = this.expandedRowsAccordion4;
        break;
        case 5:
        expandedRows = this.expandedRowsAccordion5;
        break;
      default:
        expandedRows = [];
    }
  
    const currentIndex = expandedRows.indexOf(row);
    if (currentIndex === -1) {
      expandedRows.push(row); // Expand if not already expanded
    } else {
      expandedRows.splice(currentIndex, 1); // Collapse if already expanded
    }
  }
  getServiceAuditInfo(obj: any) {
    this.customerService.getServiceAuditInfo(obj).subscribe((response) => {
      this.serviceinfo = response
    })
  }
  getPurchaseProductAudInfo(obj: any) {
    this.customerService.getPurchaseProductAuditInfo(obj).subscribe((response) => {
      this.productInfo = response
    })
  }
  getPurchaseDiscountAudInfo(obj: any) {
    this.customerService.getPurchaseDiscountAuditInfo(obj).subscribe((response) => {
      this.discountInfo = response
    })
  }



}
