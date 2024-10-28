import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerDataService } from 'src/app/Main/customer/customer-data.service';
import { CommonService } from 'src/app/services/common.service';
import { ChangeDetectorRef } from '@angular/core';



interface DetailedData {
  list: ListData[];
  data: [];
  isNestedTable: boolean;
  subTableTitle:string;
  filterKey:string;
  filterValue:string;
}

interface ListData {
  title : string;
  titleKey: string;
  titleImg: string;
  dataKeys : [];
  dataTable : [];
}


@Component({
  selector: 'app-collapsible-table',
  templateUrl: './collapsible-table.component.html',
  styleUrls: ['./collapsible-table.component.scss'],
  animations: [
    trigger('rotate', [
      state('expanded', style({ transform: 'rotate(-180deg)' })),
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      transition('expanded <=> collapsed', animate('0.3s ease-in-out'))
    ])
  ]
})
export class CollapsibleTableComponent {
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  constructor(private router: Router, private dataService: CustomerDataService, private commonService: CommonService, private route: ActivatedRoute,private cdr: ChangeDetectorRef) {}
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0;
  @Input() data: any[] = [];
  @Input() detailedData!: DetailedData;
  @Input() headers:any[] = [];
  @Input() isExpandable:boolean = false;
  @Input() isRoutable:boolean = false;
  @Input() subTableData:any;
  @Input() subTableIndex!:number;
  @Input() subTableHeaders:any;
  @Input() noDataFoundMessage:any;
  @Input() sessionToggle:boolean = false;
  @Output() loadDataFromServer = new EventEmitter();
  @Output() navigateToComponent = new EventEmitter();
  @Output() emitPaginationEmit = new EventEmitter();
  @Input() sortListBy!: string;
  @Input() subTablePageSize: number = 10;
  @Input() subTablePageIndex: number = 0;
  isLoading:Boolean = false;
  sortedData: any[] = [];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  @Input() element: any;
  expandedRows: number[] = [];
  showOriginalData: boolean = true;
  showImage: boolean = false;
  headerHovered: { [key: string]: boolean } = {};
  sortingDirection: { [key: string]: 'asc' | 'desc' } = {};
  ngOnInit () {
    this.sortedData = this.data?.slice();
    if (this.sessionToggle) {
      const theSessionToggleData = sessionStorage.getItem("sessionToggleData");
      if (theSessionToggleData) {
        const toggleData = JSON.parse(theSessionToggleData);
        if (toggleData) {
          this.expandedRows = toggleData.hasOwnProperty('expandedRows') ? toggleData.expandedRows : this.expandedRows;
          this.pageIndex = toggleData.hasOwnProperty('pageIndex') ? toggleData.pageIndex - 1 : this.pageIndex;
          this.pageSize = toggleData.hasOwnProperty('pageSize') ? toggleData.pageSize : this.pageSize;
        }
      }
    }
  }
  ngAfterViewInit() {
    this.getPaginationData(this.pageIndex, this.pageSize);
    this.paginator.length = this.totalRecords;

  }
  toggleImageVisibility(headerKey: string): void {
    this.headerHovered[headerKey] = !this.headerHovered[headerKey];
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  
    this.sortedData = this.data.slice().sort((a, b) => {
      const valueA = a[column] ? a[column].toString().toLowerCase() : '';
      const valueB = b[column] ? b[column].toString().toLowerCase() : '';
  
      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      } else if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
    this.showOriginalData = false;
  }
  toggleSorting(column: string) {
    this.showOriginalData = !this.showOriginalData;
      if (!this.showOriginalData) {
      this.sortData(column);
    }
  }
  refreshSubTableData(event:any,element:any,index:number) {
    // this.subTablePageIndex = event.pageIndex;
    // this.subTablePageSize = event.pageSize;
    this.loadDataFromServer.emit({element:element, index:index, pageIndex:event.pageIndex, pageSize:event.pageSize}); 
  }

  toggleRow(index: number, element:any) {
    const currentIndex = this.expandedRows.indexOf(index);
    if (currentIndex === -1) {
      this.expandedRows.push(index); 
    } else {
      this.expandedRows.splice(currentIndex, 1); 
    }
    if (this.sessionToggle)
      sessionStorage.setItem("sessionToggleData", JSON.stringify({'expandedRows': this.expandedRows, 'pageIndex':this.pageIndex, 'pageSize':this.pageSize}));
  }
  
  getPaginationData(pageIndex: number, pageSize: number) {
    const theIndex = pageIndex + 1;    
    if (this.sessionToggle)
      sessionStorage.setItem("sessionToggleData", JSON.stringify({'expandedRows': this.expandedRows, 'pageIndex':theIndex, 'pageSize':pageSize}));

    this.emitPaginationEmit.emit({pageIndex:theIndex, pageSize:pageSize});
  }
  
  isRowExpanded(index:number):boolean {
    return (this.isExpandable && this.expandedRows && this.expandedRows.includes(index));
  }

  filterData(list:any, parentItem:any):any {
    var aReturnVal:any = [];
    if (list.filterKey && list.filterKey.length) {
      const parentKey = list.filterValue;
      aReturnVal = list.data.filter((item: any) => item[list.filterKey] === parentItem[parentKey]);
    } else {
      aReturnVal = list.data;
    }
    return aReturnVal;
  }

  statusColorClass(status:string):string {
    return this.dataService.getStatusColorClass(status);
  }

  getGridColumnClass (count:number):string {
    return "column-"+count;
  }

  checkForNull(value:any):boolean {
    return this.commonService.checkNullOrUndefined(value);
  }

  chkForDate(value:string):boolean {
    return this.commonService.chkForDate(value);
  }

  routeToComponent(data: any) {
    this.dataService.setSelectedBillItem(data);
    this.navigateToComponent.emit(data);
  } 

  pushComponent(event:any) {
    this.dataService.isNavigatingToBilled = true;
    this.router.navigate(['/unbilled'], {relativeTo: this.route});

  }

  getKeys(obj:any) {
    return Object.keys(obj);
  }

  isValidDateTimeString(str:string) {
    // Regular expression to match the format yyyy-mm-ddThh:mm
    var regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
    return regex.test(str);
  }
}
