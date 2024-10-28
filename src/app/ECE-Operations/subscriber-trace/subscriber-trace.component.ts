import { Component } from '@angular/core';
import { ClusterService } from 'src/app/services/cluster.service';
import { EceOperationService } from '../ece-operation.service';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-subscriber-trace',
  templateUrl: './subscriber-trace.component.html',
  styleUrls: ['./subscriber-trace.component.scss']
})
export class SubscriberTraceComponent {
  subscribersData: any;
  tabList = [{ image: "assets/images/user-add.svg", title: "Subscriber Trace", isSelected: true, inactiveImg: "assets/images/user-add-light.svg" }, { image: "assets/images/folder-open.svg", title: "Subscriber Logs", isSelected: false, inactiveImg: "assets/images/folder-open-light.svg" }];
  logsData: any;
  selectedSubcriber:any;
  refreshBtnTitle = "Refresh";
  logsRefreshBtnTitle = "Download";
  logsRefreshBtnIcon = "assets/images/download.svg";
  refreshBtnIcon = "assets/images/refresh.png";
  clusterList!: any;
  selectedCluster: any = "";
  subscriberMSISDN!: any;
  sortDirec: 'asc' | 'desc' = "asc";
  sortCategory = 'date';
  selectedList!: any;
  traceFilterCategory = ['Date', 'Subscriber ID', 'Trace Status', 'Added by'];
  logsFilterCategory = ['File Name', 'Date Created', 'Session ID', 'Subscriber ID'];
  tracefilterDropdownValues!: { [key: string]: string[] };
  traceSelectedFilterCategory = 'Subscriber ID';
  logsSelectedFilterCategory = 'Session ID';
  traceCalendarTypeKeys = { 'Date': 2 };
  logsCalendarTypeKeys = { 'Date Created': 1 };
  selectedTemplate: string = "trace";

  constructor(private clusterService: ClusterService, private eceService: EceOperationService, private commonService: CommonService) {
    this.tracefilterDropdownValues = { 'Trace Status': ["Enabled", "Disabled"] };

  }

  ngOnInit() {
    this.getAllClusters();
    this.getAllSubscribers();
  }

  disableHeaderBtn():boolean {
    return !this.selectedList || this.selectedList?.length == 0;
  }

  addSubscriber() {
    const payload = {
      "nameSpace": this.selectedCluster.nameSpace,
      "msisdns": [
        this.subscriberMSISDN.trim()
      ],
      "operationType": "1",
      "clusterId": this.selectedCluster.id.toString(),
    }
    this.eceService.enableOrDisableTrace(payload).subscribe((response: any) => {
      var isSuccess = response.code == 200 ? true : false;
      const message = response?.desc ? response.desc : response.description ? response.description : isSuccess ? `Log Trace Enabled <br> Successfully!` : `Log Trace enable <br> failed`;
      if (isSuccess)
        this.subscriberMSISDN = "";
      const dialog: any = {
        template: ConfirmModalComponent,
        data: {
          description: message,
          showNoButton: false,
        }
      }
      this.commonService.openDialog(dialog, (res: any) => {
        if (res) {
          this.getAllSubscribers();
          this.commonService.hideDialog();
        }
      });
    });

  }

  reset() {
    this.subscriberMSISDN = "";
  }

  checkboxClicked(event: any) {
    if (event.value) {
      if (!this.selectedList)
        this.selectedList = [];
      if (typeof event.element === "string" && event.element === "all") {
        this.selectedList = event.data;
      } else {
        this.selectedList = this.selectedList.concat(event.element);
      }
    } else {
      if (typeof event.element === "string" && event.element === "all") {
        this.selectedList = event.data;
      } else {
        this.selectedList = this.deleteElementByKey(this.selectedList, this.isTraceView() ? "msisdn" : "fileName", this.isTraceView() ? event.element?.msisdn : event.element?.fileName)
      }
    }
  }

  deleteElementByKey(array: Array<any>, key: string, value: string) {
    return array.filter(obj => obj[key] !== value);
  }

  refreshSubscriberList(event: any) {
    this.getAllSubscribers();
  }

  getAllSubscribers() {
    if (this.selectedCluster) {
      const payload = {
        "clusterId": this.selectedCluster.id,
      };

      this.eceService.getAllSubscribers(payload).subscribe((response: any) => {
        this.setUpSubscriberData(response);
      });
    }
  }

  setUpSubscriberData(response: any) {
    if (response && Array.isArray(response)) {
      this.selectedList = [];
      response.forEach((row: any) => {
        row.displayTraceFlag = (row.traceFlag == 1) ? "Enabled" : "Disabled";
        row.deleteBtnDisabled = row.traceFlag == 0;
      })
      this.subscribersData = {
        list: response,
        columns: [
          { key: 'Select', label: 'Select', type: 'checkbox' },
          { key: 'createDate', label: 'Date', format: 'date', filterType: 'Date' },
          { key: 'msisdn', label: 'Subscriber ID' },
          { key: 'displayTraceFlag', label: 'Trace Status', format: 'status' },
          { key: 'addedBy', label: 'Added by' },
          { key: 'clusterName', label: 'Cluster Name' },
          {
            key: 'Action', label: 'Action', type: 'action', multipleBtns: true, buttons: [{ btnId: "logs", buttonIconImg: "assets/images/folder-open-outline.svg", tooltipTitle: "Logs" }, { btnId: "disableTrace", buttonIconImg: "assets/images/x-circle.svg",btnIconClassName: "customIconBtn x-circle", tooltipTitle: "Disable Trace" }],
            delete: false
          }
        ],
        uniqueKey: 'msisdn'
      }
    } else {
      if (this.subscribersData)
        this.subscribersData = "empty";
    }
  }

  setUpLogsData(response: any) {
    if (response && Array.isArray(response)) {
      if (this.isLogView()) {
        this.logsFilterCategory = ['Subscriber ID', 'File Name', 'Date Created', 'Session ID'];
        this.logsSelectedFilterCategory = 'Subscriber ID';

        this.logsData = {
          list: response,
          columns: [
            { key: 'Select', label: 'Select', type: 'checkbox' },
            { key: 'msisdn', label: 'Subscriber ID' },
            { key: 'fileName', label: 'File Name', width: '100px' },
            { key: 'logDate', label: 'Date Created', format: 'date', filterType: 'Date' },
            { key: 'sessionId', label: 'Session ID' },
            // { key: 'clusterName', label: 'Cluster Name' },
            { key: 'Action', label: 'Action', type: 'action', button: true, buttonTitle: "Download", buttonIconImg: "assets/images/download.svg" }
          ],
          uniqueKey: 'fileName'
        }
      } else {
        this.logsFilterCategory = ['File Name', 'Date Created', 'Session ID'];
        this.logsSelectedFilterCategory = 'Session ID';

        response.forEach((obj:any)=> {
          obj.getLogs = true;
          obj.download = false;
        })
        this.logsData = {
          list: response,
          // columns: [
          //   { key: 'Select', label: 'Select', type: 'checkbox', width:'10px' },
          //   { key: 'fileName', label: 'File Name', width: '150px' },
          //   { key: 'logDate', label: 'Date Created', format: 'date', filterType: 'Date' },
          //   { key: 'sessionId', label: 'Session ID', width:'25px' },
          //   { key: 'Action', label: 'Action', type: 'action', multipleBtns: true, buttons: [{ btnId: "getLogs", buttonIconImg: "assets/images/get-logs.svg", buttonTitle:"Get Logs", tooltipTitle: "Get Logs"}, { btnId: "download", buttonIconImg: "assets/images/download.svg", buttonTitle:"Download", tooltipTitle: "Download Logs" }]},
          // ],

          columns: [
            { key: 'Select', label: 'Select', type: 'checkbox', width:'10px' },
            { key: 'fileName', label: 'File Name'},
            { key: 'logDate', label: 'Date Created', format: 'date', filterType: 'Date' },
            { key: 'sessionId', label: 'Session ID' },
            { key: 'Action', label: 'Action', width: '200px' , type: 'action', multipleBtns: true, buttons: [{ btnId: "getLogs", buttonIconImg: "assets/images/get-logs.svg", buttonTitle:"Get Logs", tooltipTitle: "Get Logs"}, { btnId: "download", buttonIconImg: "assets/images/download.svg", buttonTitle:"Download", tooltipTitle: "Download Logs" }]},
          ],
          uniqueKey: 'fileName'
        }
      }
    } else {
      if (this.logsData)
        this.logsData = "empty";
    }
  }


  openLogs(event?: any) {
    if (this.logsData)
    this.logsData = "empty";

    this.selectedTemplate = "logs"
    this.selectedSubcriber = event;
    const payload = {
      "clusterId": this.selectedCluster.id,
      "msisdn": event?.msisdn
    };
    this.eceService.viewSubscriberTraceLogs(payload).subscribe((response: any) => {
      this.setUpLogsData(response);
    });

  }

  getAllLogs() {
    this.selectedTemplate = "allLogs"

    this.eceService.getAllSubscriberLogs().subscribe((response: any) => {
      if (response && Array.isArray(response)) {
        const theFilteredList = response.filter((obj: any) => (obj.clusterId == this.selectedCluster.id))
        this.setUpLogsData(theFilteredList);
      }
    });
  }

  downloadAll(event: any) {
    const theList = this.selectedList?.map((obj:any)=>(this.isTraceView() ? obj.msisdn : obj.fileName))
    this.eceService.downloadSubscriberTraceLogs({"fileName":theList}).subscribe((response: any) => {
      response.forEach((obj:any) => {
        this.writeToFile(obj)
    })
  })
  }

  downloadLogs(event: any) {
    this.eceService.downloadSubscriberTraceLogs({"fileName":[event?.fileName]}).subscribe((response: any) => {
      if (response && Array.isArray(response) && response.length > 0) {
        response.forEach((obj:any) => {
          this.writeToFile(obj)
        })
      }
    });
  }

  writeToFile(fileData:any) {
    var fileType = 'application/octet-stream';
    const blob = new Blob([fileData?.fileContent], { type: fileType });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileData?.fileName;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  getLogsForSubscriber(event:any) {
    if (event?.btn?.btnId === "download") {
      this.downloadLogs(event?.element);
    } else {
      const payload = {"fileName":[event?.element?.fileName]};
      this.eceService.getSubscriberLogStatus(this.selectedSubcriber?.msisdn, this.selectedCluster.id).subscribe((response: { "status": number }) => {
        if (this.isObject(response) && response.hasOwnProperty('status')) {
          var msg = "";
          if (response.status == 1) {
            //InProgress
            msg = "Subscriber Log retreive is in progress";
            this.displayDialog(msg);
          } else {
            this.eceService.getSubscriberFileLogStatus(payload).subscribe((response: {"code" : number}) => {
              if (response && this.isObject(response) && response.hasOwnProperty('code') && response.code == 200) {
                event.element.download = true;
                event.element.getLogs = false;
              }
            })
          }  
        }  
      });

    }
  }

  getLogsForAllSelectedSubscribers(event:any) {
    const theList = this.selectedList?.map((obj:any)=>(obj.fileName));
    if (theList) {
      const payload = {"fileName":theList};
      this.eceService.getSubscriberLogStatus(this.selectedSubcriber?.msisdn, this.selectedCluster.id).subscribe((response: { "status": number }) => {
        if (this.isObject(response) && response.hasOwnProperty('status')) {
          var msg = "";
          if (response.status == 1) {
            //InProgress
            msg = "Subscriber Log retreive is in progress";
            this.displayDialog(msg);
          } else {
            this.eceService.getSubscriberFileLogStatus(payload).subscribe((response: {"code" : number}) => {
              if (response && this.isObject(response) && response.hasOwnProperty('code') && response.code == 200) {
                this.logsData.list.forEach((obj:any)=> {
                  obj.download = true;
                  obj.getLogs = false;
                })
              }
            })
          }  
        }  
      });
    }
  }


  displayDialog(iMsg: string) {
    const obj: any = {
      template: ConfirmModalComponent,
      data: {
        description: iMsg,
      }
    }
    this.commonService.openDialog(obj, (res: any) => {
      if (res) {
        this.commonService.hideDialog();
      }
    })
  }

  isObject(value: any): value is object {
    return typeof value === 'object' && value !== null;
  }

  onClickTableIcons(event: any) {
    const btn = event?.btn;
    const data = event?.element;    
    if (btn.btnId === "disableTrace") {
      this.disableTrace(data);
    } else if (btn.btnId === "logs") {
      this.openLogs(data);
    }
  }

  disableTraceForAll() {
    const obj: any = {
      template: ConfirmModalComponent,
      data: {
        description: `Are you sure you want to stop <br> tracing for all the subscribers?`,
        image: "assets/images/trash-red-outline.svg",
        showNoButton: true,
        yesButton: "Disable",
      }
    }
    this.commonService.openDialog(obj, (res: any) => {
      if (res) {
        const theList = this.selectedList?.map((obj:any) => (obj.msisdn));
        const payload = {
          "nameSpace": this.selectedCluster.nameSpace,
          "msisdns": theList,
          "operationType": "2",
          "clusterId": this.selectedCluster.id.toString(),
        }
        this.eceService.enableOrDisableTrace(payload).subscribe((response: any) => {
          var isSuccess = response.code == 200 ? true : false;
          const message = response?.desc ? response.desc : response.description ? response.description : isSuccess ? `Subscriber Trace Stopped <br> Successfully!` : `Subscriber Trace stop <br> failed`;

          const dialog: any = {
            template: ConfirmModalComponent,
            data: {
              description: message,
              showNoButton: false,
            }
          }
          this.commonService.openDialog(dialog, (res: any) => {
            if (res) {
              this.getAllSubscribers();
              this.commonService.hideDialog();
            }
          });
        })
      }
    });

  }

  disableTrace(row: any) {
    const obj: any = {
      template: ConfirmModalComponent,
      data: {
        description: `Are you sure you want to stop <br> tracing the subscriber?`,
        image: "assets/images/trash-red-outline.svg",
        showNoButton: true,
        yesButton: "Disable",
        rowID: row.msisdn
      }
    }
    this.commonService.openDialog(obj, (res: any) => {
      if (res) {
        const payload = {
          "nameSpace": this.selectedCluster.nameSpace,
          "msisdns": [
            row.msisdn
          ],
          "operationType": "2",
          "clusterId": this.selectedCluster.id.toString(),
        }
        this.eceService.enableOrDisableTrace(payload).subscribe((response: any) => {
          var isSuccess = response.code == 200 ? true : false;
          const message = response?.desc ? response.desc : response.description ? response.description : isSuccess ? `Subscriber Trace Stopped <br> Successfully!` : `Subscriber Trace stop <br> failed`;

          const dialog: any = {
            template: ConfirmModalComponent,
            data: {
              description: message,
              showNoButton: false,
            }
          }
          this.commonService.openDialog(dialog, (res: any) => {
            if (res) {
              this.getAllSubscribers();
              this.commonService.hideDialog();
            }
          });
        })
      }
    });
  }

  getAllClusters() {
    this.clusterService.getAllClusters().subscribe((response: any) => {
      if (response?.hasOwnProperty("records")) {
        this.clusterList = response.records;
        this.selectedCluster = this.clusterList[0];
        this.clusterSelectionChanged();
      }
    })
  }

  onKeyPress(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      // Invalid character entered, prevent it from being entered
      event.preventDefault();
    }
  }

  clusterSelectionChanged(event?: any) {
    if (this.isLogView()) {
      if (this.logsData)
        this.logsData = "empty";
      this.getAllLogs();
    }
    if (this.isTraceView()) {
      if (this.subscribersData)
      this.subscribersData = "empty";
      this.getAllSubscribers();
    }
  }

  onTabSelection(event: any): void {
    this.tabList.forEach((tab: any) => {
      tab.isSelected = !tab.isSelected;
    });
  }

  selectTemplate(template: 'trace' | 'logs' | 'allLogs'): void {
    this.selectedTemplate = template;
    if (this.isTraceView())
      this.getAllSubscribers();
    else if (this.isLogView())
      this.getAllLogs();
  }

  isLogView() {
    return this.selectedTemplate === "allLogs";
  }

  isTraceView() {
    return this.selectedTemplate === "trace";
  }

  isSubscriberLogView() {
    return this.selectedTemplate === "logs";
  }

  back(): void {
    this.selectedSubcriber = null;
    this.selectedTemplate = "trace";
    this.getAllSubscribers();
  }

}
