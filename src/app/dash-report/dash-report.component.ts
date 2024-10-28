import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ClusterService } from 'src/app/services/cluster.service';
import { CommonService } from 'src/app/services/common.service';
import { DashboardService } from 'src/app/services/dashboard.service';

type frameData = {
  url: string;
  height: any;
  width: any;
  id: number;
  enabled: boolean;
  sequence: number;
  clusterId: number;
  applicationName: string;
  hostName: string
};

@Component({
  selector: 'app-dash-report',
  templateUrl: './dash-report.component.html',
  styleUrls: ['./dash-report.component.scss']
})


export class DashReportComponent {
  globalHeight = 300;
  globalWidth = 500;
  shouldLoadFrames:boolean = false;
  data!:frameData[] | [];
  selectedTemplate: string = "first";
  selectedParameter!: any;
  selectedApplicationName!: any;
  selectedHostName!: any;
  parameterList!: any;
  grafanaData!:any;
  applications!:any;
  hosts!:any;
  constructor(private sanitizer: DomSanitizer, private dashService:DashboardService, private commonService:CommonService, private clusterService:ClusterService) {

  }

  ngOnInit() {
    this.getParameterList();
  }

  getParameterList() {
    this.clusterService.getClustersForDropdown().subscribe((response: any) => {
      if (response && Array.isArray(response) && response.length > 0) {
        this.parameterList = response.filter((obj:any)=> obj.clusterType === (this.isFirstTabSelected() ? "CNE" : "OnPrem"))
        this.selectedParameter = this.parameterList[0];
        this.selectedApplicationName = "All";
        this.selectedHostName = "All";
        if (this.isSecondTabSelected()) {
          this.clusterService.getApplicationNamesForDropdown().subscribe((applns: any) => {
            if (applns && Array.isArray(applns))
              this.applications = applns;
          });
          this.getAllHost();
        }
        this.loadData();
      } else {
        this.parameterList = [];
      }    
    });
  }

  loadData() {
    this.shouldLoadFrames = false;
    const category = this.isFirstTabSelected() ? "CNE" : "OnPrem";
    this.dashService.getMetricsDashboard(this.selectedParameter.value, category).subscribe((response:any) => {
      if (!this.commonService.checkForAccessDenied(response) && typeof response === 'object' && response !== null && !response.hasOwnProperty('exceptionName')) {
        if (response && Array.isArray(response) && response.length > 0) {
          this.grafanaData = response;
          this.filterData();        
        } else {
          this.grafanaData = [];
        }
      } else {
        this.grafanaData = [];
      }
    })
  }

  filterData() {
    if (this.grafanaData && Array.isArray(this.grafanaData) && this.grafanaData.length > 0) {
      const theResponse:any = JSON.parse(JSON.stringify(this.grafanaData));
      if (theResponse && Array.isArray(theResponse) && theResponse.length > 0) {
        theResponse?.forEach((obj:any)=> {
          obj.url = this.getSanitizedURL(obj);
          obj.width = (obj.width == 0) ? "100%" : obj.width;
          obj.height = (obj.height == 0) ? "100%" : obj.height;
        });
        var sortedList = theResponse?.sort((a:any, b:any) => a.sequence - b.sequence);
        if (this.isSecondTabSelected()) {
          if (!this.commonService.checkNullOrUndefined(this.selectedApplicationName) && this.selectedApplicationName !== "All") {
            sortedList = sortedList.filter((obj:any)=> obj.applicationName === this.selectedApplicationName)
          } 
          
          if (!this.commonService.checkNullOrUndefined(this.selectedHostName) && this.selectedHostName !== "All") {
            sortedList = sortedList.filter((obj:any)=> obj.hostName === this.selectedHostName)
          } 
        }
        this.data = sortedList;  
        this.shouldLoadFrames = true;    
      }
    }
}


  isSmallCard(iframe:any):boolean {
    return Number(iframe.width) <= this.globalWidth
  }

  getSanitizedURL(iFrame: any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(iFrame.url);
  }

  refreshIframes() {
    var iframes = document.getElementsByTagName('iframe');
    for (var i = 0; i < iframes.length; i++) {
      iframes[i].src = iframes[i].src;
    }
  }

isFirstTabSelected() {
    return this.selectedTemplate === "first";
  }

  isSecondTabSelected() {
    return this.selectedTemplate === "second";
  }

  selectTemplate(template: 'first' | 'second'): void {
    this.selectedTemplate = template;
    this.selectedHostName = "";
    this.selectedParameter = null;
    this.selectedApplicationName = "";
    this.getParameterList();
  }

  parameterSelectionChanged(event?: any) {
    this.selectedApplicationName = "All";
    this.selectedHostName = "All";
    if (this.isSecondTabSelected())
      this.getAllHost();
    this.loadData();
  }
  
  getAllHost() {
    this.clusterService.getHostNamesForDropdown(this.selectedParameter?.value).subscribe((response: any) => {
      if (response && !this.commonService.checkForAccessDenied(response) && Array.isArray(response)) {
        this.hosts = response;
        this.selectedHostName = "All";
      }  
    });
  }

  secondaryParamSelectionChanged(event:any) {
    this.clusterService.getHostNamesForDropdown(this.selectedParameter?.value, this.selectedApplicationName).subscribe((response: any) => {
      if (response && !this.commonService.checkForAccessDenied(response) && Array.isArray(response)) {
        this.hosts = response;
        this.selectedHostName = "All";
      }  
    });
    this.refreshData();
  }

  tertiaryParamSelectionChanged(event:any) {
    this.refreshData();
  }

  refreshData() {
    this.shouldLoadFrames = false;    
    this.data = [];
    this.filterData();  
  }
}
