import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
import { ConnectionManagerService } from 'src/app/services/connection-manager.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { MessageService, MessageType } from 'src/app/services/message.service';

@Component({
  selector: 'app-connection-manager',
  templateUrl: './connection-manager.component.html',
  styleUrls: ['./connection-manager.component.scss'],
  animations: [
    trigger('rotate', [
      state('expanded', style({ transform: 'rotate(-180deg)' })),
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      transition('expanded <=> collapsed', animate('0.3s ease-in-out'))
    ])
  ]
})
export class ConnectionManagerComponent {
  hasAccess: boolean = true;
  displayData: any = {};
  expandedRows: number[] = [];
  i: number = 0;
  successMessage: string | null = null;
  expandedRowsAccordion1: number[] = [];
  expandedRowsAccordion2: number[] = [];
  expandedRowsAccordion3: number[] = [];
  expandedRowsAccordion4: number[] = [];

  Data: any;
  data: any;
  eceData: any;
  id: any;
  conCat: any;
  public message: { type: MessageType; text: string } | null = null;

  constructor(private fb: FormBuilder, private router: Router,
    private route: ActivatedRoute, public commonService: CommonService, private dialog: MatDialog, private change: ChangeDetectorRef,
    private connection: ConnectionManagerService, private messageService: MessageService) { }

  ngOnInit() {
    this.getAllConnections();
  }
  onEdit(row: any) {
    this.router.navigate(['configurations/connection-form'],
      {
        state: { data: { isEditMode: true, obj: row } }
      }
    );
  }
  onEditCM(row: any) {
    this.router.navigate(['configurations/connection-form'],
      {
        state: { data: { editMode: true, obj: row } }
      }
    );
  }
  onEditJMX(row: any) {
    this.router.navigate(['configurations/connection-form'],
      {
        state: { data: { EditMode: true, obj: row } }
      }
    );
  }
  onEditEceDatabase(row:any){
    this.router.navigate(['configurations/connection-form'],
    {
      state: { data: { eceEditMode: true, obj: row } }
    }
  ); 
  }
  onView(row: any) {
  }

  getAllConnections() {
    
    this.connection.getConnectionsForConType("4").subscribe((response: any) => {
      console.log("rgetConnectionsForConType esponse", response);
    });

    this.connection.getAllConnections().subscribe((response: any) => {
      console.log("response", response);
      response.forEach((category: any) => {
        this.conCat = category.conCategory;
        if (this.conCat == 1) {
          this.conCat = '1 - Production-Primary'
        }
        else if (this.conCat == 2) {
          this.conCat = '2 - Production-Secondary'
        }
        else if (this.conCat == 3) {
          this.conCat = '3 - Production-StandBy'
        }
        else if (this.conCat == 4) {
          this.conCat = '4 - Production-DR'
        }
        else if (this.conCat == 5) {
          this.conCat = '5 - PreProd'
        }
        else {
          this.conCat = '6 - Testing'
        }
      })
      const titles = this.getUniqueValues(response, "conType");
      titles.forEach((title: any) => {
        const rows = this.getValueFromList(response, title);
        if (title == 1) {
          rows.forEach((item) => {
            item.conCat = this.conCat;
            item.dataBaseNo = item?.conConfig?.dataBaseNo;
            item.dbHostUrl = item?.conConfig?.dbHostUrl;
            item.dbUserName = item?.conConfig?.dbUserName;
            item.dbPassword = item?.conConfig?.dbPassword;
            item.dbDriverClass = item?.conConfig?.dbDriverClass;
            item.masterDB = item?.conConfig?.masterDB;
            item.siteName = item?.conCluster?.siteDetails.siteName;
            item.clusterName = item?.conCluster?.clusterName;

          })
          rows.forEach((val) => {
            val.db_password = '**********';
          })
          const tableData = {
            list: rows,
            columns: [
              { key: 'id', label: 'Id' },
              { key: 'conName', label: 'Config Name' },
//              { key: 'conCat', label: 'Config Category' },
              { key: 'siteName', label: 'Site Name'},
              { key: 'clusterName', label: 'Cluster Name' },
              { key: 'dataBaseNo', label: 'Database Id' },
              { key: 'dbHostUrl', label: 'DB Host' },
              { key: 'dbUserName', label: 'DB Username' },
              { key: 'db_password', label: 'DB Password' },
              { key: 'dbDriverClass', label: 'DB Driver Class' },
              { key: 'masterDB', label: 'Master DB' },
              { key: 'Action', label: 'Action', type: 'action', edit: true, delete: true }
            ],
            uniqueKey: 'conName'
          };
          this.displayData = tableData;
        }
        else if (title == 2) {
          rows.forEach((item) => {
            item.conCat = this.conCat;
            item.cmHost_ = item?.conConfig?.cmHost;
            item.masterCM_ = item?.conConfig.masterCM;
            item.cmlogin_ = item?.conConfig?.cmlogin;
            item.cmPassword_ = item?.conConfig?.cmPassword;
            item.sslEnabled_ = item?.conConfig?.sslEnabled;
            item.sslWallet_ = item?.conConfig?.sslWallet;
            item.cmPort_ = item?.conConfig?.cmPort;
            item.masterDB_ = item?.conConfig?.masterDB;
            item.dataBaseNo_ = item?.conConfig?.dataBaseNo_;
            item.siteName = item?.conCluster?.siteDetails.siteName;
            item.clusterName = item?.conCluster?.clusterName;

          })
          rows.forEach((val) => {
            val.cm_password = '**********';
          })
          const CMData = {
            list: rows,
            columns: [
              { key: 'id', label: 'Id' },
              { key: 'conName', label: 'Config Name' },
//              { key: 'conCat', label: 'Config Category' },
              { key: 'siteName', label: 'Site Name'},
              { key: 'clusterName', label: 'Cluster Name' },
              { key: 'cmHost_', label: 'CM Host' },
              { key: 'cmPort_', label: 'CM Port' },
              { key: 'cmlogin_', label: 'CM UserName' },
              { key: 'cm_password', label: 'CM Password' },
              { key: 'masterCM_', label: 'CM Flag' },
              { key:'sslEnabled_', label: 'SSL Enabled'},
              { key:'sslWallet', label: 'SSL Wallet'},
              { key: 'Action', label: 'Action', type: 'action', edit: true, delete: true }
            ],
            uniqueKey: 'conName'
          };
          this.Data = CMData;
        }
        else if (title == 3) {
          rows.forEach((item) => {
            item.conCat = this.conCat;
            item.pinConfNameSpace = item?.conConfig?.pinConfNameSpace;
            item.pinConfUpdateToken = item?.conConfig?.pinConfUpdateToken;
            item.pinConfUpdateUrl = item?.conConfig?.pinConfUpdateUrl;
            item.JMXHostIP = item?.conConfig?.JMXHostIP;
            item.JMXHostPort = item?.conConfig?.JMXHostPort;
            item.siteName = item?.conCluster?.siteDetails.siteName;
            item.clusterName = item?.conCluster?.clusterName;

          })
          const JMXData = {
            list: rows,
            columns: [
              { key: 'id', label: 'Id' },
              { key: 'conName', label: 'Config Name' },
              { key: 'siteName', label: 'Site Name'},
              { key: 'clusterName', label: 'Cluster Name' },
              { key: 'conCat', label: 'Config Category' },
              { key: 'JMXHostIP', label: 'ECE Admin JMX Host' },
              { key: 'JMXHostPort', label: 'ECE Admin JMX Port' },
              { key: 'pinConfNameSpace', label: 'ECE Admin Namespace' },
              { key: 'pinConfUpdateUrl', label: 'ECE Admin REST URL' },
              { key: 'pinConfUpdateToken', label: 'ECE Admin REST Token' },
              { key: 'Action', label: 'Action', type: 'action', edit: true, delete: true }
            ],
            uniqueKey: 'conName'
          };
          this.data = JMXData;
          console.log("JMX DATA :",this.data)
        }
// ece data base 

else if (title == 4) {
  rows.forEach((item) => {
    item.conCat = this.conCat;
    item.pinConfNameSpace = item?.conConfig?.pinConfNameSpace;
    item.pinConfUpdateToken = item?.conConfig?.pinConfUpdateToken;
    item.pinConfUpdateUrl = item?.conConfig?.pinConfUpdateUrl;
    item.JMXHostIP = item?.conConfig?.JMXHostIP;
    item.JMXHostPort = item?.conConfig?.JMXHostPort;
    item.siteName = item?.conCluster?.siteDetails.siteName;
    item.clusterName = item?.conCluster?.clusterName;

    item.dataBaseNo = item?.conConfig.dataBaseNo;
    item.dbHostUrl = item?.conConfig.dbHostUrl;
    item.dbUserName = item?.conConfig.dbUserName;
    item.dbPassword = item?.conConfig.dbPassword;
    item.dbDriverClass = item?.conConfig.dbDriverClass;
    item.masterDB = item?.conConfig.masterDB;

  })
  rows.forEach((val) => {
    val.dbPassword = '**********';
  })
  const ECEData = {
    list: rows,
    columns: [
      { key: 'id', label: 'Id' },
      { key: 'conName', label: 'Config Name' },
      { key: 'siteName', label: 'Site Name'},
      { key: 'clusterName', label: 'Cluster Name' },
      { key: 'dataBaseNo', label: 'Database Id'},

      // { key: 'conCat', label: 'Config Category' },
       { key: 'dbHostUrl', label: 'DB Host' },
      { key: 'dbUserName', label: 'DB Username ' },
      { key: 'dbPassword', label: 'DB Password' },
      { key: 'dbDriverClass', label: 'DB Driver Class' },
      { key: 'masterDB', label: ' Master DB' },
      { key: 'Action', label: 'Action', type: 'action', edit: true, delete: true }
    ],
    uniqueKey: 'conName'
  };
  this.eceData = ECEData;
  console.log("ECE DATA :",this.eceData)
}

      });

    })
  }
  getAllConfigTitles(): string[] {
    return Object.keys(this.displayData);
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
      default:
        return false;
    }
  }
  getImagePath(title: String): string {
    var aReturnVal: string = '';
    if (title === ("1")) {
      aReturnVal = 'db icon';
    } else if (title === "2") {
      aReturnVal = 'globe-alt icon';
    } else if (title === "3") {
      aReturnVal = 'check-circle icon';

    }
    return "../../../assets/images/" + aReturnVal + '.svg';

  }
  getUniqueValues(theList: Array<any>, key: string) {
    const theUniqueValues = [...new Set(theList.map(obj => obj[key]))];
    return theUniqueValues;
  }

  getValueFromList(list: Array<any>, key: string) {
    return list.filter((item: any) => (item.conType === key));
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


  add() {
    this.router.navigate(['configurations/connection-form'],
      {
        state: { data: { isEditMode: false } }
      }
    );
  }
  addCM() {
    this.router.navigate(['configurations/connection-form'],
      {
        state: { data: { editMode: false } }
      }
    );
  }
  addJMX() {
    this.router.navigate(['configurations/connection-form'],
      {
        state: { data: { EditMode: false } }
      }
    );
  }
  addEceDatabase(){
    this.router.navigate(['configurations/connection-form'],
      {
        state: { data: { eceEditMode: false } }
      }
    ); 
  }
  onDeleteRow(row: any) {
    const dialog: any = {
      template: ConfirmModalComponent,
      data: {
        description: `Delete the selected <br> Connection?`,
        image: "assets/images/trash-red-outline.svg",
        showNoButton: true,
        yesButton: "Delete",
        id: row.id
      }
    }
    this.commonService.openDialog(dialog, (res: any) => {
      if (res) {
        this.connection.deleteConnection(dialog.data.id).subscribe(data => {
          var isSuccess = data.code == 200 ? true : false;
          this.handleApiResponse(isSuccess, data.status);
          this.getAllConnections();
        })
      }
    });

  }
  private handleApiResponse(isSuccess: boolean, messageText: string): void {
    const messageType = isSuccess ? MessageType.Success : MessageType.Error;
    this.message = { type: isSuccess ? MessageType.Success : MessageType.Error, text: messageText };
    this.messageService.showMessage(messageText, messageType);
  }
}