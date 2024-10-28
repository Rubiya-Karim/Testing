
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { SharedTableComponent } from '../../../shared/components/shared-table/shared-table.component';
import { CommonService } from 'src/app/services/common.service';
import { GeneralConfigsService } from 'src/app/services/general-configs.service';
import { CreateUpdateModalComponent } from 'src/app/shared/components/create-update-modal/create-update-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss'],
  animations: [
    trigger('rotate', [
      state('expanded', style({ transform: 'rotate(-180deg)' })),
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      transition('expanded <=> collapsed', animate('0.3s ease-in-out'))
    ])
  ]
})
export class SecurityComponent {
  hasAccess: boolean = true;
  rows: any;
  tableData: any;
  displayData: any = {};
  dialogRef: any;
  desc: any;
  expandedRows: number[] = [];
  sortCategory = 'configName';
  sortDirec: 'asc' | 'desc' = "asc";

  constructor(private fb: FormBuilder, private general: GeneralConfigsService, public commonService: CommonService, private dialog: MatDialog, private change: ChangeDetectorRef
  ) { }


  ngOnInit() {
    this.getAllConfig();
  }

  getAllConfig() {
    this.general.getAllConfig().subscribe((response: any) => {
      if (response?.code == 200 && response?.hasOwnProperty("records") && Array.isArray(response?.records)) {
        const theResponse = response?.records;
        const titles = this.getUniqueValues(theResponse, "configCategory");
        titles.forEach((title: any) => {
          const rows = this.getValueFromList(theResponse, title);
          rows?.forEach((row: any) => {
            const value = row.configValue ? row.configValue : "";
            const unit = row.configUnit ? " (" + row.configUnit + ")" : "";
            row.configDisplayValue = value + unit;
          });
          const tableData = {
            list: rows,
            columns: [
              { key: 'configName', label: 'Config Name' },
              { key: 'configDisplayValue', label: 'Config Value (Unit)' },
              { key: 'encryptedFlag', label: 'Encrypted Flag' },
              { key: 'configDesc', label: 'Description' },
              { key: 'Action', label: 'Action', type: 'action', edit: true, view: true }
            ],
            uniqueKey: 'configName'
          };
          this.displayData[title] = tableData;
          console.log(this.displayData[title]);
        });
      }
    });
  }

  getImagePath(title:String):string {
    var aReturnVal:string = '';
    if (title === 'Security') {
      aReturnVal = 'general-config-shield';
    } else if (title === "JMX Mbean Configuration") {
      aReturnVal = 'globe-alt-solid-black';
    } else if (title === "ECE Admin Access") {
      aReturnVal = 'check-circle';
    } else if (title === "Bill Run Env Configurations") {
      aReturnVal = 'general-config-bill';
    } else if (title === "BRM Database Connection") {
      aReturnVal = 'general-config-database';
    } else if (title === "Trail Bill Run Configuration") {
      aReturnVal = 'general-config-bill';
    } else if (title === "TRIAL_BILL_ACC_PURGE_PERIOD") {
      aReturnVal = 'document-text-black';
    } else if (title === "Invoice Gen Env Configurations") {
      aReturnVal = 'Invoice-bill-generation-config';
    } else if (title === 'PODRestartManagement') {
      aReturnVal = 'restart-pod';
    } else if (title === 'DefaultZoneId') {
      aReturnVal = 'default-zone-id';
    } else if (title === 'REL Configuration') {
      aReturnVal = 'REL-config';
    } else if (title === 'Invoice Export Env Configurations') {
      aReturnVal = 'invoice-export';
    } else if (title === 'ProcessManagement Configuration') {
      aReturnVal = 'process-outline';
    } else if (title === 'ECE Configs') {
      aReturnVal = 'flash';
    } else if (title === 'MbeansClientConfiguration') {
      aReturnVal = 'globe-alt-solid-black'
    } else if (title === 'DashboardConfiguration') {
      aReturnVal = 'DashBoardManagement';
    } else if (title === 'Subscriber Trace Configuration') {
      aReturnVal = 'subscriber-trace';
    } else if (title === 'SQL List') {
      aReturnVal = 'chip';
    } else if (title === 'URL') {
      aReturnVal = 'url';
    } else if (title === 'Env Configurations') {
      aReturnVal = 'sun-outline';
    } else if (title === 'JobSchedule') {
      aReturnVal = 'process-outline';
    } else if (title === 'UserLogActivity') {
      aReturnVal = 'UserActiveLogsManagement';
    } else if (title === 'ProcessManagement') {
      aReturnVal = 'process-outline'; 
    } else if (title === 'onprem') {
      aReturnVal = 'sun-outline'; 
    } else if (title === 'paginationDefaultValue') {
      aReturnVal = 'pagination'
    }
    return "assets/images/" + aReturnVal + '.svg';
  }
  

  getAllConfigTitles(): string[] {
    console.log(this.displayData);
    console.log(Object.keys(this.displayData));
    return Object.keys(this.displayData);
  }



  getUniqueValues(theList: Array<any>, key: string) {
    const theUniqueValues = [...new Set(theList.map(obj => obj[key]))];
    return theUniqueValues;
  }

  getValueFromList(list: Array<any>, key: string) {
    return list.filter((item: any) => (item.configCategory === key));
  }


  onEdit(row: any) {
    this.dialogRef = this.dialog.open(CreateUpdateModalComponent, { data: { title: "Edit Configs", obj: row, parentType: 3 } });

    this.dialogRef.afterClosed().subscribe((result: any) => {
      this.getAllConfig();

    });
  }
  onView(row: any) {
    this.desc = row.configDesc;
    this.dialogRef = this.dialog.open(CreateUpdateModalComponent, { height: '370px', width: '453px', data: { title: "Details", obj: row, parentType: 7 ,isviewbtn:true} });
  }

  toggleRow(index: number) {
    const currentIndex = this.expandedRows.indexOf(index);
    if (currentIndex === -1) {
      this.expandedRows.push(index); // Expand if not already expanded
    } else {
      this.expandedRows.splice(currentIndex, 1); // Collapse if already expanded
    }
  }

  isRowExpanded(index: number): boolean {
    return (this.expandedRows?.includes(index));
  }

}

