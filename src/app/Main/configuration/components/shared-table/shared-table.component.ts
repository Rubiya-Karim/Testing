import { Component, OnInit, Input, ViewChild, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonService } from '../../../services/common.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { environment } from 'src/environments/environment';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-shared-table',
  templateUrl: './shared-table.component.html',
  styleUrls: ['./shared-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class SharedTableComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  dataSource!: MatTableDataSource<any>;

  columnDefinitions: any = [];
  tableObj: any;
  filterTable = '';
  allChecked = false;
  selectedRowIndex: number = -1;
  showDropdown:boolean = false;
  hideSearchbox:boolean = false;
  // Properties for date range filters
  startDate: any = null;
  endDate: any = null;
  serverSearchText!:string;
  expandedElement:any = null;
  greenCodedLabels: string[] = ['Active', 'Open', 'Settled', 'Completed', 'Enabled', 'in progress', 'create', 'Running'];
  darkGreyCodedLabels: string[] = ['scheduled'];
  lightGreyCodedLabels: string[] = ['locked'];
  redCodedLabels: string[] = ['Closed', 'Pending', 'Disabled', 'Cancelled', 'inactive', 'delete', 'Not Running'];

  @Input() totalRecords!: number;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0;
  @Output() onCheckboxClickEmit = new EventEmitter();
  @Output() onViewRowEmit = new EventEmitter();
  @Output() onRedirectRowEmit = new EventEmitter();
  @Output() onButtonClickRowEmit = new EventEmitter();
  @Output() onDownloadRowEmit = new EventEmitter();
  @Output() onEditRowEmit = new EventEmitter();
  @Output() onDeleteRowEmit = new EventEmitter();
  @Output() onUnlockRowEmit = new EventEmitter();
  @Output() emitPaginationEmit = new EventEmitter();
  @Output() onHeaderButtonEmit = new EventEmitter();
  @Output() onSecHeaderButtonEmit = new EventEmitter();
  @Output() onCustomHeaderButttonEmit = new EventEmitter();
  @Output() RelCustomButttonEmit = new EventEmitter();
  @Output() onAssignPrivilegesButtonEmit = new EventEmitter();
  @Output() onTestSmsRowEmit = new EventEmitter();
  @Output() onTestEmailRowEmit = new EventEmitter();
  @Output() onTestTeamsRowEmit = new EventEmitter();
  @Output() onExtLinkClickEmit = new EventEmitter();
  @Output() onServerSearchEmit = new EventEmitter();
  @Output() onClickCustomIconEmit = new EventEmitter();
  @Output() onAddConnectionButtonEmit = new EventEmitter();
  @Output() onRowClickActionEmit = new EventEmitter();
  @Input() isServerSearch:boolean = false;
  @Input() isSearch!: boolean;
  @Input() isSearchFilter: boolean = true;
  @Input() isAddEnabled: boolean = true;
  @Input() isAddConnection: boolean = false;
  @Input() isCustomHeaderButton: boolean = false;
  @Input() RelCustomButton: boolean = false;
  @Input() isAssignPrivilege: boolean = false;
  @Input() tableHeader: any;
  @Input() disable: any;
  @Input() url: any;
  @Input() headerButtonTitle!: string;
  @Input() customHeaderBtnTitle!: string;
  @Input() RelcustomButtonTitle!:string;
  @Input() customHeaderBtnIcon!: string;
  @Input() RelcustomButtonIcon!: string;
  @Input() filterCategoryList!: Array<string>;
  @Input() filterCategoryDropdownData!: { [key: string]: string[] };
  @Input() filterCategoryCalendarType!: { [key: string]: number };
  @Input() selectedFilterCategory!: string;
  @Input() sortListBy!: string;
  @Input() sortDirec: 'asc' | 'desc' = "desc";
  @Input() testsms:boolean = false;
  @Input() testemail:boolean=false;
  @Input() testteams:boolean=false;
  @Input() shouldShowFilterCalender:boolean = false;
  @Input() shouldShowFilterCalenderPeriod:boolean = false;
  @Input() viewIconImgPath!: string;
  @Input() noDataFoundMessage!: string;
  @Input() externalLink:boolean = false;
  @Input() showFilterLabel:boolean = true;
  @Input() viewTooltip:string = "View";
  @Input() editTooltip:string = "Update";
  @Input() deleteTooltip:string = "Delete";
  @Input() accessoryBtnTitle = "Assign Privileges";
  @Input() connectionButton = "Add Connection";
  @Input() isExpandable:boolean = false;
  @Input() isDatasourcePaginator:boolean = false;
  @Input() alignColumn:boolean = false;
  @Input() statsHeaderKey!:string;    
  @Input() disableCustomHeaderBtn = false;
  @Input() isSecondaryHeaderButton:boolean = false;
  @Input() disableSecHeaderBtn:boolean = false;
  @Input() secHeaderBtnIcon:string = "";
  @Input() secHeaderBtnIconDisabled:string = "";
  @Input() isSecHeaderBtnRed:boolean = false
  @Input() secHeaderButtonTitle:string = "";
  @Input() set tableData(res: any) {
    if (res == 'empty') {
      // this.defaultValues();
      this.allChecked = false;
      this.tableObj = null;
      this.dataSource = new MatTableDataSource();
      this.serverSearchText = '';
      this.startDate = null;
      this.endDate = null; 
      this.selectedRowIndex = -1; 
      return;
    }
    this.defaultValues();
    if (!this.commonService.checkNullOrUndefined(res)) {
      this.tableObj = res;
      this.tableDataFunc(res)
    }
  }

  @Input() showCheckAll = true;
  @Input() selectedSchduleName!: string;

  defaultValues() {
    this.allChecked = false;
    // this.serverSearchText = '';
    this.tableObj = null;
    this.dataSource = new MatTableDataSource();
    this.columnDefinitions = [];
    this.selectedRowIndex = -1; 
  }

  baseUrl = environment.url;

  constructor(public commonService: CommonService) { }
  ngOnInit() {
  }
  
  ngAfterViewInit() {
    // this.pageIndex = 0;
    this.getPaginationData(this.pageIndex, this.pageSize);
    this.paginator.length = this.totalRecords;

  }

  onBackspace(event: any): void {
    // Handle Backspace key press
    if (event.target?.value?.length == 1) 
      this.onSearchClear();
  }

  onEnter(event: any) {
    event.preventDefault(); // Prevent the default behavior of the Enter key
    this.onServerSearch(event);
  }

  onKeyUpEvent(event: any): void {
    if ((event.key === 'Delete' || event.key === 'Backspace') && event.target.value === "")
      this.onSearchClear();
  }
 
  changeFilterType(event:any) {
    this.startDate = null;
    this.endDate = null; 
    const targetValue = event.target.value;
    // To chk if the filter options have predefined values for the filter key
    this.showDropdown = this.filterCategoryDropdownData && this.filterCategoryDropdownData.hasOwnProperty(targetValue) && this.filterCategoryDropdownData[targetValue] instanceof Array;
    if (this.filterCategoryCalendarType?.hasOwnProperty(targetValue)) {
      this.shouldShowFilterCalender = this.filterCategoryCalendarType[targetValue] == 1 ? true : false;
      this.shouldShowFilterCalenderPeriod = this.filterCategoryCalendarType[targetValue] == 2 ? true : false;
    } else {
      this.shouldShowFilterCalender = false;
      this.shouldShowFilterCalenderPeriod = false;
      // this.startDate = null;
      // this.endDate = null;  
    }

    this.hideSearchbox = (this.showDropdown || this.shouldShowFilterCalender || this.shouldShowFilterCalenderPeriod) ? true :false;

    this.dataSource.filter = "";
    this.allChecked = false;
    this.setupFilter(targetValue);
    this.serverSearchText = "";
    if (this.isServerSearch) {
      this.onServerSearchEmit.emit({filter:this.selectedFilterCategory, filterKey:this.keyFordisplayLabel(this.selectedFilterCategory)?.key});
    } 
  }

  setupFilter(column: string) {
    if (!this.isServerSearch) {
      if (this.shouldShowFilterCalender) {
        const dateColumns = this.dateColumns(column);
        this.dataSource.filterPredicate = (data, filter) => {
          return dateColumns.some(element => {
            var aKey:string = element['key'];
            const dateString = data[aKey];
            const dateObject = new Date(dateString);
            return this.formattedDate(dateObject) === filter ? true: false;
          }
        );
        }
      } else {
        if (!this.shouldShowFilterCalenderPeriod) {
          const key = this.keyFordisplayLabel(column).key;
          this.dataSource.filterPredicate = (data, filter) => {
            // handle columns with number value
            var theText = data[key];
            if (typeof data[key] === 'number') {
              theText = theText.toString();
            }
            return theText?.toLowerCase().indexOf(filter) != -1;
          }
        }
      }
    }
  }

  applyFilter(event: Event, shouldEmit?:boolean) {
    if (this.isServerSearch) {
      if (!this.shouldShowFilterCalenderPeriod) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.serverSearchText = filterValue;      
        // Do search on selection of the dropdown values
        if (shouldEmit)
          this.onServerSearchEmit.emit({searchText:this.serverSearchText.trim(), filter:this.selectedFilterCategory, filterKey:this.keyFordisplayLabel(this.selectedFilterCategory)?.key});
      }
    } else {
      if (this.shouldShowFilterCalenderPeriod) {
        if (this.startDate && this.endDate) {
          const dateColumns = this.dateColumns("Date");
          this.dataSource.filterPredicate = (data: any, filter: string) => { 
            return dateColumns.some(element => { 
              var aKey:string = element['key']; 
              var selectedKey = this.keyFordisplayLabel(this.selectedFilterCategory)?.key;
              if (aKey === selectedKey) {
                const dateString = data[aKey]; 
                return this.isDateWithinPeriod(dateString, this.startDate, this.endDate);
              } else {
                return false
              }
            });
          }
          const filterValue = (event.target as HTMLInputElement).value;
          // search is case-insensitive
          this.dataSource.filter = filterValue?.trim()?.toLowerCase();
          this.allChecked = false;        
        }
      } else {
        const filterValue = (event.target as HTMLInputElement).value;
        // search is case-insensitive
        this.dataSource.filter = filterValue?.trim()?.toLowerCase();
        this.allChecked = false;      
      }
    }
  }
  
  onServerSearch(event?:any){
    if (this.isServerSearch) {
      if (this.shouldShowFilterCalenderPeriod) {
        const theStartDate = new Date(this.startDate);
        const theEndDate = new Date(this.endDate);
        if (theStartDate <= theEndDate) {
          const theText = this.startDate + "&toDate=" + this.endDate;
          this.onServerSearchEmit.emit({searchText:theText, filter:this.selectedFilterCategory, filterKey:this.keyFordisplayLabel(this.selectedFilterCategory)?.key});
        }
      } else {
        this.onServerSearchEmit.emit({searchText:this.serverSearchText, filter:this.selectedFilterCategory, filterKey:this.keyFordisplayLabel(this.selectedFilterCategory)?.key});
      }
    } 
  }

  endDateBeforeStartDateValidator():boolean {
    var aReturnVal = false;
    const theStartDate = new Date(this.startDate);
    const theEndDate = new Date(this.endDate);
    if (this.endDate && (theStartDate > theEndDate)) {
      aReturnVal = true;
    }
    return aReturnVal;
   }

  isDateWithinPeriod(dateString:string, startDateString:string, endDateString:string):any {
    const date = new Date(dateString);
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    if (isNaN(date.getTime()) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false; // Handle invalid date strings
    }
    return date >= startDate && date <= endDate || (this.formattedDate(date) === this.formattedDate(startDate)) || (this.formattedDate(date) === this.formattedDate(endDate)) ;
  }
    
  formattedDate(iDate:Date):string {
    const year = iDate.getFullYear();
    const month = String(iDate.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(iDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  
  onSearchClear() {
    this.dataSource.filter = "";
    this.serverSearchText = "";
    // this.onServerSearch();
    this.onServerSearchEmit.emit({searchText:this.serverSearchText, filter:this.selectedFilterCategory, filterKey:this.keyFordisplayLabel(this.selectedFilterCategory)?.key});
  }

  reset() {
  }

  dateColumns(col:any):[] {
    return this.columnDefinitions.filter((res: any) => res.filterType == col)
  }
  

  getPaginationData(pageIndex: number, pageSize: number) {
    const theIndex = pageIndex + 1;    
    setTimeout(() => {
      this.emitPaginationEmit.emit({pageIndex:theIndex, pageSize:pageSize});
    }, 0);
  }

  tableDataFunc(data: any) {
    this.dataSource = new MatTableDataSource();
    if (!this.commonService.checkNullOrUndefined(data.list)) {
      if (data.list.length) {
        this.tableDataUpdate(data.list);
      }
    }

    if (!this.commonService.checkNullOrUndefined(data.list) && data.list.length) {

      this.columnDefinitions = [];

      data.columns.forEach((cols: any) => {
        const obj: any = {
          def: cols.key,
          label: cols.label,
          filterType: cols.filterType ? cols.filterType : '',
          type: cols.type ? cols.type : '',
          hide: cols.hide ? cols.hide : false,
          ...cols
        }
        this.columnDefinitions.push(obj)
      })
    }
  }

  displayLable(col: any) {
    return this.columnDefinitions.find((res: any) => res.def == col)
  }

  
  keyFordisplayLabel(label: any) {
   return this.columnDefinitions.find((res: any) => res.label == label)
  }

  checkAll(event: any) {
    this.selectedRowIndex = -1;
    const checked = event.target.checked;
    this.allChecked = checked ;
    let list = [...this.dataSource.data];
    list.map(res => {
      if (this.dataSource.filteredData.some(resp => resp[this.tableObj.uniqueKey] === res[this.tableObj.uniqueKey])) {
        res.checked = checked ? true : false
      }
    })
    const obj = { value: checked, element: 'all', data: checked ? list : [] };
    this.onCheckboxClickEmit.emit(obj);
  }

  graycheckBox(element:any){
    if(element.scheduleName === this.selectedSchduleName){
      return false;
    }
    else if(element.scheduleName === this.selectedSchduleName){
      return true;
    }
  }

  graycheckBoxrow(element:any){
    if(element.scheduleName === undefined){
      return false;
    }
    else if(element.scheduleName === this.selectedSchduleName){
      return true;
    }
  }

  checkboxClick(event: any, element: any, index:number) {
    const checked = event.target.checked;
    this.selectedRowIndex = checked ? index : -1;
    let list = [...this.dataSource.data];
    list.map(res => res.checked = res[this.tableObj.uniqueKey] === element[this.tableObj.uniqueKey] ? checked ? true : false : this.showCheckAll ?  res.checked : false)
    const allChecked = list.every((obj:any) => obj.checked === true);
    const allUnChecked = list.every((obj:any) => obj.checked === false);
    var obj = {};
    if (this.showCheckAll && (allChecked || allUnChecked)) {
      this.checkAll(event);
    } else {
      this.allChecked = false ;
      obj = { value: checked, element: element, data: list };
    }
    this.onCheckboxClickEmit.emit(obj);
  }

  tableDataUpdate(data: any) {
    this.dataSource = new MatTableDataSource(data);
    // mapping paginator to datasource when server loading on pagination is not required
    if (this.isDatasourcePaginator)
      this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  buttonEvent(value: any) {
    this.onHeaderButtonEmit.emit(value);
  }

  secondaryBtnEvent(value: any) {
    this.onSecHeaderButtonEmit.emit(value);
  }

  buttonAddConnection(row: any) {
    this.onAddConnectionButtonEmit.emit(row);
  }

  rightBtnEvent(value:any) {
    this.onCustomHeaderButttonEmit.emit(value);
  }
  RelCustombtn(value:any) {
    this.RelCustomButttonEmit.emit(value);
  }
  onViewRow(row: any) {
    this.onViewRowEmit.emit(row)
  }

  onRedirectRow(row: any) {
    this.onRedirectRowEmit.emit(row)
  }

  onButtonClickRow(element: any, btn:any) {
    this.onButtonClickRowEmit.emit({"element":element, "btn":btn})
  }

  onDownloadRow(row: any) {
    this.onDownloadRowEmit.emit(row)
  }

  onEditRow(row: any) {
    this.onEditRowEmit.emit(row)
  }

  onClickCustomIcon(row:any) {
    this.onClickCustomIconEmit.emit(row);
  }

  onDeleteRow(row: any) {
    this.onDeleteRowEmit.emit(row)
  }
  onExtLinkClick(row: any){
    this.onExtLinkClickEmit.emit(row)
  }


  onUnlockRow(row:any) {
    this.onUnlockRowEmit.emit(row)
  }

  sendTestSms(row:any){
    this.onTestSmsRowEmit.emit(row)
  }

  sendTestEmail(row:any){
    this.onTestEmailRowEmit.emit(row)
  }
  sendTestTeams(row:any){
    this.onTestTeamsRowEmit.emit(row) 
  }

  assignPrivileges(value: any) {
    this.onAssignPrivilegesButtonEmit.emit(value);
  }

  confirmationPopup(value: any, callBack: any) {
    const obj = {
      template: ConfirmModalComponent,
      data: {
        description: `Do you want to <span class='in-active-text'>${value}</span> the job status`,
        // yes: `Yes! ${value}`,
        // buttonClass: `${value}-btn`,
        // isConfirmModal: true
      }
    }
    this.commonService.openDialog(obj, (res: any) => {
      callBack(res)
    })
  }

  getDisplayedColumns() {
    if (this.dataSource && this.dataSource.data && !this.commonService.checkNullOrUndefined(this.dataSource.data)) {
      return this.columnDefinitions.filter((cd: any) => !cd.hide).map((cd: any) => cd.def);
    }
  }

  selectRow(row: any, index: any) {
  }

  showMatToolip(event: any, customText?:any) {
    const theToolTip = (customText?.length > 0) ? customText : event;
    if (theToolTip && theToolTip.length >= 14) {
      return theToolTip
    } else {
      return null
    }
  }

  getCellClass(element: any): string {
    if (typeof element === 'string' && this.alignColumn) {
      return 'left-align'; // Apply left-align style for strings
    } else if (typeof element === 'number' && this.alignColumn) {
      return 'center-align'; // Apply center-align style for numbers
    } else {
      return ''; // Default or additional styles for other types
    }
  }

  getStatusColorCode(iStatus:string) {
    // Settled Collected Completed Success Running Enabled
    // Pending Inactive Stopped Disabled
    var aReturnVal = "transparent";
    if (this.checkStringExistence(this.greenCodedLabels, iStatus))
      aReturnVal = "active";
    if (this.checkStringExistence(this.darkGreyCodedLabels, iStatus))
      aReturnVal = "inactive"
    if (this.checkStringExistence(this.lightGreyCodedLabels, iStatus))
      aReturnVal = "locked"
    if (this.checkStringExistence(this.redCodedLabels, iStatus))
      aReturnVal = "closed"
    if (iStatus.toLowerCase() === "view") {
      aReturnVal = "view"
    } else if (iStatus.toLowerCase() === "search") {
      aReturnVal = "search"
    } else if (iStatus.toLowerCase() === "update") {
      aReturnVal = "warning"
    }
    return aReturnVal;
  }

  checkStringExistence(iList: string[], iInput: string): boolean {
    return iList.some(item => item.toLowerCase() === iInput.toLowerCase());
  }

  onRowClick(event:any) {
    this.onRowClickActionEmit.emit(event);
  }

}
