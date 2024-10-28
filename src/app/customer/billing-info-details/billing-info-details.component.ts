import { Component } from '@angular/core';
import { CustomerService } from 'src/app/services/customer.service';
import { BankAccountType, BillingCycle, BillingStatus, BillingStatusReason, CreditCardType, CustomerDataService, DeliveryPreference, PayType, StatusReason } from '../customer-data.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-billing-info-details',
  templateUrl: './billing-info-details.component.html',
  styleUrls: ['./billing-info-details.component.scss']
})
export class BillingInfoDetailsComponent {
  billInfoList: any;
  isDataAvailable: boolean =false;
  data!: any;
  noDataMsg:string = "There is no Billing Info details available for this account";
  noData: string = "There is no Pay Info details available for this account";


  
  constructor(private customerService:CustomerService, private dataService:CustomerDataService, private commonService:CommonService){}

   ngOnInit(){
    const obj = this.dataService.constructPayload();
    this.getBillInfo(obj);
   }

   getBillInfo(obj:any){
      this.customerService.getBillinfo(obj).subscribe((response: any) => {
        var resRec = response.records
         if (resRec?.length && resRec[0]?.errorCode == 200) {
          this.billInfoList = resRec;
        }      
      })  
   }

   getDisplayDueAmount(theBillInfo:any):string {
    return theBillInfo?.outStandingAmount + " " + theBillInfo?.resourceCode;
   }

   getDisplaySuppStatus(theBillInfo:any):string {
    return theBillInfo?.acctSuppressed == 0 ? "Billing Not Suppressed" : "Billing Suppressed";
   }

   getDisplayCurrentCollectionStatus(theBillInfo:any):string {
    return theBillInfo?.scenarioPoid?.id == 0 ? "Not In Collection" : "In Collection";
   }

   isExempted(theBillInfo:any):string {
    return theBillInfo?.exemptFromCollections == 0 ? "No" : "Yes"
   }

   getAddress(obj:any):string {
    return obj ? `${obj?.address ? obj?.address : ""}<br> ${obj?.city ? obj?.city : ""} <br> ${obj?.state ? obj?.state : ""} - ${obj?.zip ? obj?.zip : ""} <br> ${obj?.country ? obj?.country : ""}` : "";
   }

   getBillingCycle(theBillInfo:any):string | undefined {
     return this.dataService.getStringFromEnum(theBillInfo?.billWhen, BillingCycle);
   }

   getBillingStatus(theBillInfo:any):string | undefined {
    return this.dataService.getStringFromEnum(theBillInfo?.billingStatus, BillingStatus);
   }
   
   getPayType(theBillInfo:any):string | undefined {
    return this.dataService.getStringFromEnum(theBillInfo?.payType, PayType);
   }

   getStatusReason(theBillInfo:any):string | undefined {
    return this.dataService.getStringFromEnum(theBillInfo?.statusFlag, StatusReason);
   }

   getBillingStatusReason(theBillInfo:any):string | undefined {
    return this.dataService.getStringFromEnum(theBillInfo?.billingStatusFlag, BillingStatusReason);
   }

   getDeliveryPreference(thePayInfo:any):string | undefined {
    return this.dataService.getStringFromEnum(thePayInfo?.invInfo?.deliveryPrefer, DeliveryPreference);
   }

  getBankAccountType(thePayInfo:any):string | undefined {
    return this.dataService.getStringFromEnum(thePayInfo?.ddInfo?.type, BankAccountType);
  }

  // getMandateStatus(thePayInfo:any):string | undefined {
  //   return this.dataService.getStringFromEnum(thePayInfo?.ddInfo?.mandateStatus, MandateStatus);
  // }

  getSuppressionCycle(theBillInfo:any){ 
    return (theBillInfo?.suppressedCycleLeft + " cycles");
  }

  getCardType(thePayInfo:any):string | undefined  {
    return this.dataService.getStringFromEnum(thePayInfo?.ccInfo?.cardType, CreditCardType);
  }

  payInfoSubHeader(obj:any):string {
    return obj?.invInfo ? "INVOICE DETAILS" : (obj?.ccInfo ? "CARD DETAILS" : (obj?.ddInfo? "DIRECT DEBIT DETAILS" : " "));
  }

  chkForNull(value:string):boolean {
    return this.commonService.checkNullOrUndefined(value);
  }

   statusColorClass(status:string):string {
    return this.dataService.getStatusColorClass(status);
  }
  constructData(response: any) {
    if (response && response.length && response[0].errorCode == 200 && Array.isArray(response)) {
      this.data = response;
      this.isDataAvailable = true;
    }  else {
      if (response && response.length == 0) {
        this.isDataAvailable = false;
      }
    }
  }

  }
   
  
    
   
  
  












