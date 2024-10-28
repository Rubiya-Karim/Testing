import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { EceOperationService } from '../../ece-operation.service';
interface DbData {
  key: string;
  value: string;
  status: string; 
}


@Component({
  selector: 'app-cache',
  templateUrl: './cache.component.html',
  styleUrls: ['./cache.component.scss']
})
export class CacheComponent {
btnStatus: boolean = true;
resourceValue!:any;
tableData!:any
rows: any;
siteCount:number = 0;
siteList:number[]= [];
filteredCacheData: any[] = []; // Array to hold filtered data
selectedStatus: string = ''; // Variable to hold selected status filter


  constructor(private location: Location,private eceService:EceOperationService){
  // this.filteredCacheData = this.resourceValue; 
  }

  ngOnInit(){
    this.getCacheState()
  }

  getCacheState(){
    this.eceService.getCacheState().subscribe((response)=>{
      this.resourceValue = response;
      this.siteCount = this.getSiteCount();
      this.filteredCacheData = [...this.resourceValue];   
  })
  }


  back(): void {
    this.location.back();
  }

  getCellData(cacheData:any, index:number):string {
    var aReturnVal = '-';
    if (index <= this.siteList.length) {
      const count = cacheData.find((count: any) => count.key === this.siteList[index - 1]);
      aReturnVal = count? count.value : '-';
    }
    return aReturnVal;
  }

  applyStatusFilter() {
    if (!this.selectedStatus) {
      this.filteredCacheData = this.resourceValue; // No filter selected, show all data
    } else {
      if (this.selectedStatus === 'NA') {
        // Filter for 'OK', 'NOT OK', and 'NA' statuses
        this.filteredCacheData = this.resourceValue.filter((cache: any) =>
          cache.statusData.cacheData.status === this.selectedStatus ||
          cache.statusData.dbData.status === this.selectedStatus ||
          cache.statusData.cacheVsDb.status === this.selectedStatus
        );
      } else {
        // Filter for 'OK' and 'NOT OK' statuses
        this.filteredCacheData = this.resourceValue.filter((cache: any) =>
          cache.statusData.cacheData.status === this.selectedStatus
        );
      }
    }
  }


  getSiteCount():number {
    var aReturnVal = 0;
    if (!this.resourceValue || this.resourceValue.length === 0) 
      aReturnVal = 0;
    let maxObject = null;
    let siteListFromMax: number[] = [];

    let maxCount = -1;

    this.resourceValue.forEach((obj:any)=> {
      const theList = Object.keys(obj.statusData);
      theList.forEach((key:any)=> {
        const count = obj.statusData[key].counts.length;
        if (count > maxCount) {
          maxCount = count;
          maxObject = obj;
          siteListFromMax = obj.statusData[key].counts.map((data:any)=>data.key);
        }
      })
    })
    this.siteList = siteListFromMax ? siteListFromMax : [];
    aReturnVal = maxCount;
    return aReturnVal;
  }

  generateArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  getStatusClass(status: string): string[] {
    switch (status) {
      case 'OK':
        return ['status-badge', 'status-ok'];
      case 'NOT OK':
        return ['status-badge', 'status-not-ok'];
      case 'NA':
        return ['status-badge', 'status-na'];
      default:
        return [];
    }
  }

}
