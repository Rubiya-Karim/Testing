import { Component } from '@angular/core';
import { CustomerService } from 'src/app/services/customer.service';
import { CustomerDataService } from '../customer-data.service';

@Component({
  selector: 'app-bill-details',
  templateUrl: './bill-details.component.html',
  styleUrls: ['./bill-details.component.scss']
})
export class BillDetailsComponent {
  accountNumber!:any;
  billedData:any[]=[];
  billedTableDetails:any;
  billedItemData:any[]=[];
  billedItemDataList:any = {};
  billedTableHeaders = [{"key":"billNo","label": "Bill Number"},{"key":"name","label": "Name"},{"key":"state","label": "State"},{"key":"startTime","label": "Bill Start Date"},{"key":"endTime","label": "Bill End Date"},{"key":"previousTotal","label": "Previous Total"},{"key":"subordsTotal","label": "Subords"},{"key":"total","label": "Total"},{"key":"currentTotal","label": "Current Total"},{"key":"totalDue","label": "Total Due"},{"key":"recvd","label": "Paid"},{"key":"due","label": "Due Amount"},{"key":"dueTime","label": "Due Date"}]
  billedItemTableHeaders = [{"key":"name","label": "Name"},{"key":"itemNo","label": "Item No"}, {"key":"poidString","label": "Item POID"}, {"key":"itemTotal","label": "Item Total"},{"key":"statusString","label": "Status"},{"key":"adjusted","label": "Adjusted"},{"key":"recvd","label": "Paid"},{"key":"transferred","label": "Transferred"},{"key":"due","label": "Due Amount"}]
  pageIndex = 0;
  pageSize = 1;
  totalRecords: number = 0;
 
  sortDirec: 'asc' | 'desc' = "asc";
  noDataMsg:string = 'No Bills found';
  fieldname:string = 'billNo';
  fieldname1:string = 'itemNo';


  constructor(private customerService:CustomerService, private dataService: CustomerDataService) {}
  ngOnInit(){
  }
  refreshData(event:any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getBilledDetails(); 
  }

  getBilledItemDetails(event:any){
    const billPOID = event?.element?.billPoid
    const obj = {"billPoid": this.dataService.poidString(billPOID)};
    this.customerService.billedItemDetails(event?.pageIndex, event?.pageSize, this.sortDirec, this.fieldname1 ,obj).subscribe((data:any) => {
 
      if (data.records && data.records.length && data.records[0].errorCode == 200) {
        data.records.forEach((row:any) => {

        row.poidString = this.dataService.poidString(row.itemPoid);
      });

      const anIndex = event?.index;
      this.billedItemDataList[anIndex] = data;  
      this.billedItemData = this.billedItemDataList;      
    }
  });
  }
  
getBilledDetails(){
  const obj = this.dataService.constructPayload();
  this.customerService.billedDetails(this.pageIndex, this.pageSize, this.sortDirec,this.fieldname,obj).subscribe((data:any) => { 
    this.billedData = data.records;
      this.totalRecords = data?.totalRecords;

      //  this.billedTableDetails={list:[{dataKeys:[[{"key":"billNo","label": "Bill Number"}, {"key":"startTime","label": "Bill Start Date"}, {"key":"total","label": "Total"},{"key":"due","label": "Due Amount"}],
      //                                            [{"key":"name","label": "Name"}, {"key":"endTime","label": "Bill End Date"}, {"key":"currentTotal","label": "Current Total"}, {"key":"dueTime","label": "Due Date"}],
      //                                            [{"key":"state","label": "State"}, {"key":"previousTotal","label": "Previous Total"}, {"key":"subordsTotal","label": "Subords"}, {"key":"recvd","label": "Paid"}]
      //                                           ]}],
      //                           data:this.billedData, filterKey:"billNo" , filterValue:"billNo", subTableTitle:"Bill Item Details", isNestedTable:true};    
      this.billedTableDetails={data:this.billedData, filterKey:"billNo" , filterValue:"billNo", subTableTitle:"Bill Item Details", isNestedTable:true}

    })

  

}


loadData(event:any) {
  this.getBilledItemDetails(event);
}

}
