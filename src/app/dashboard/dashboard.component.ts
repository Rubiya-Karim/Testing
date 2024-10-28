import { Component, ViewChild } from '@angular/core';
import * as Chartist from 'chartist';
import { PieChart } from 'chartist';
import { DashboardService } from 'src/app/services/dashboard.service';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { CommonService } from 'src/app/services/common.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
NoDataToDisplay(Highcharts);

HC_exporting(Highcharts);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent { 

  eceStatusData!:any;
  jobCountData!:any;
  billingSummary!:any;
  nextSchedules!:any;
  jobScheduleSummary!:any;
  processManagementSummary!:any;
  pdcSummary!:any;
  accountSummary!:any;
  accountTrends!:any;
  cdrCurrentStatus!:any;

  jobScheduleChartData!:number[][];
  jobScheduleChart!: Highcharts.Chart;
  jobScheduleDetailChart!:Highcharts.Chart;
  clustersChartData!:number[][];
  clustersChart!: Highcharts.Chart;
  currentStartIndex = 0;
  chart!: Chartist.BarChart;
  visibleBarsCount = 4;
  recycleKeys!:any;
  reasons!:any;
  selectedRecycleKey:string = "";
  selectedReasonKey:string = "";
  showEceState:boolean = false;
  showSchedule:boolean = false;
  showAccountInfo:boolean = false;
  showProcessManagement:boolean = false;
  showActiveRecurring:boolean = false;
  showRelTrends:boolean = false;
  showCDRTrends:boolean = false;
  showCDRStatus:boolean = false;
  showNextScheduleTable = false; 
  displayedColumns: string[] = ['scheduleName', 'scheduleDate'];
  dataSource!: MatTableDataSource<any>;
  totalSchedules:number = 0;
  pageSize = 3;
  @ViewChild(MatPaginator, {static:false}) paginator!: MatPaginator;
  
  lineChartOptions: Highcharts.Options = {
    chart: {
      type: 'line',
      backgroundColor: '#F1F5F9',
      borderWidth: 0,
      borderRadius: 0,
      plotShadow: false,
      plotBorderWidth: 0
    },
    navigation: {
      buttonOptions: {
        enabled: false 
      }
    },
    credits: {
      enabled: false 
    },
    title: {
      style: {
        color: '#FA7A55' 
    },

    },
    legend: {
      align: 'right', // Align legend to the right
      verticalAlign: 'top', // Align legend to the top
      layout: 'horizontal', // Display legend items vertically
      symbolWidth: 12,
      symbolHeight: 12,
      symbolPadding: 4,
      symbolRadius: 4,
      squareSymbol: true,
      y:-45
    },
    xAxis: {
      categories: [],
      title: {
        text: 'Dates'
      },
      min:0
    },
    yAxis: {
      lineWidth: 1
    },
  };

  constructor(private dashboardService:DashboardService,private commonService:CommonService, private router: Router){}
  ngOnInit() {
    this.getRecycleKeys();
    this.getReasonList();
    this.getECEStatus();
    this.getJobCount();
    this.getJobScheduleSummary();

    this.getBillingSummary();
    this.getNextSchedules();
    this.getProcessManagementSummary();
    this.getPDCSummary();

    this.getAccountSummary();
    this.getAccountTrend();
    this.getRELTrend();
    this.getCDRStatus();
    this.getCDRTrend();
  }  

  renderJobScheduleChart() {
    this.jobScheduleChartData = this.jobScheduleSummary?.body.map((obj:any)=> [parseInt(obj.runningSchedules.total), parseInt(obj.futureSchedules.total)]);
    const theRunningList = this.jobScheduleSummary?.body.map((obj:any)=> (parseInt(obj.runningSchedules.total)));
    const theFutureList = this.jobScheduleSummary?.body.map((obj:any)=> (parseInt(obj.futureSchedules.total)));
    const theList:any = [{ "data":theFutureList.slice(this.currentStartIndex, this.currentStartIndex + this.visibleBarsCount)},
                     { "data":theRunningList.slice(this.currentStartIndex, this.currentStartIndex + this.visibleBarsCount)}];
    const data = {
      labels: (this.jobScheduleSummary?.body?.map((obj:any)=> obj.jobName)).slice(this.currentStartIndex, this.currentStartIndex + this.visibleBarsCount),
      series: theList

    };
    this.jobScheduleChart?.xAxis[0].update({categories: data.labels})
    this.jobScheduleChart?.update(data);
}

  scrollLeft(chartName:string) {
    if (chartName === 'Schedules') {
      const rect = document.querySelector('#chart-shadow-overlay');
      rect?.remove();

      if (this.currentStartIndex > 0) {
        this.currentStartIndex -= this.visibleBarsCount;
        this.renderJobScheduleChart();
      }
    } else {

    }
  }

  scrollRight(chartName:string) {
    if (chartName === 'Schedules') {
      const rect = document.querySelector('#chart-shadow-overlay');
      rect?.remove();

      if ((this.currentStartIndex + this.visibleBarsCount) < this.jobScheduleChartData.length) {
        this.currentStartIndex += this.visibleBarsCount;
        this.renderJobScheduleChart();
      }
    } else {

    }
  }

  getECEStatus() {
    this.dashboardService.getECEStatus().subscribe((response:any) => {
      this.showEceState = !this.commonService.checkForAccessDenied(response);
      if (typeof response === 'object' && response !== null && !response.hasOwnProperty('exceptionName')) {
        if (response.hasOwnProperty('body') && response.body != null)
          this.eceStatusData = response;
      }
    })
  }

  getJobCount() {
    this.dashboardService.getJobCount().subscribe((response:any) => {
      this.showActiveRecurring = !this.commonService.checkForAccessDenied(response);
      if (this.showActiveRecurring && response && !this.commonService.checkNullOrUndefined(response) && typeof response === 'object' &&  !response.hasOwnProperty('exceptionName') && response.hasOwnProperty('body')) {
        const allZero = Object.values(response?.body).every(value => value === "0");
        if (allZero) {
          this.jobCountData = null;
        } else {
          this.jobCountData = response;
          const dataOptions: any = {
            labelInterpolationFnc: function(value: any, index:number) {
              return `${ Math.round(percentages[index])}%`;
            },
            showLabel: true,
            labelPosition:'outside',
            labelDirection:'explode',
            labelOffset:5,
            donut: true,
            donutSolid: true,
          };          
          const labels = Object.keys(response.header);
          const series = labels.map(key => parseInt(response.body[key.toLowerCase()]));
  
          // Calculate the total sum of values
          const totalSum: number = series.reduce((acc, curr) => acc + curr, 0);
  
          // Calculate percentage for each value
          const percentages: number[] = series.map(value => (value / totalSum) * 100);
  
          const data = {
            labels: labels,
            series: percentages
          };
          new PieChart('.recurr-ct-chart', data, dataOptions);        
        }
      } else {
        this.jobCountData = null;
      }
    })
  }

  getBillingSummary() {
    this.dashboardService.getBillingSummary().subscribe((response:any) => {
      if (typeof response === 'object' && response !== null && !response.hasOwnProperty('exceptionName')) {
        this.billingSummary = response;
      }
    })
  }

  getNextSchedules() {
    this.dashboardService.getNextScheduledJobs().subscribe((response:any) => {
      this.showNextScheduleTable = !this.commonService.checkForAccessDenied(response);
      if (typeof response === 'object' && response !== null && !response.hasOwnProperty('exceptionName')) {
        if (response?.hasOwnProperty("body")) {
          const allZero = Object.values(response?.body).every(value => value === "0");
          if (allZero) {
            this.nextSchedules = null;
          } else {
            this.nextSchedules = response;
            var tableData: any[] | undefined = [];
            this.nextSchedules?.body?.forEach((obj:any) => {
              obj.jobList?.forEach((job:any) => {
                tableData?.push({"scheduleName":`${job.jobName} - ${obj.scheduleName}`, "scheduleDate":obj.scheduleDate});
              })
            })
            this.dataSource = new MatTableDataSource<any>(tableData);
            this.totalSchedules = tableData.length;
            this.dataSource.paginator = this.paginator;
          }        
        }
      } else {
        this.nextSchedules = null;
      }
    })
  }

  getJobScheduleSummary() {
    this.dashboardService.getJobScheduleSummary().subscribe((response:any) => {
      this.showSchedule = !this.commonService.checkForAccessDenied(response);
      if (this.showSchedule && response && !this.commonService.checkNullOrUndefined(response) && typeof response === 'object' &&  !response.hasOwnProperty('exceptionName') && response.hasOwnProperty('body')) {
        const allZero = Object.values(response?.body).every((item:any) => item.totalSchedules == 0);
        if (allZero) {
          this.jobScheduleSummary = null;
        } else {
          this.jobScheduleSummary = response;
          this.jobScheduleChartData = this.jobScheduleSummary?.body?.map((obj:any)=> [parseInt(obj.runningSchedules.total), parseInt(obj.futureSchedules.total)]);
          const theRunningList = this.jobScheduleSummary?.body?.map((obj:any)=> (parseInt(obj.runningSchedules.total)));
          const theFutureList = this.jobScheduleSummary?.body?.map((obj:any)=> (parseInt(obj.futureSchedules.total)));
          const theList:any = [{ "data":theFutureList?.slice(this.currentStartIndex, this.currentStartIndex + this.visibleBarsCount),maxPointWidth: 32},
                           { "data":theRunningList?.slice(this.currentStartIndex, this.currentStartIndex + this.visibleBarsCount),maxPointWidth: 32}];
          const data = {
            labels: (this.jobScheduleSummary?.body?.map((obj:any)=> obj.jobName))?.slice(this.currentStartIndex, this.currentStartIndex + this.visibleBarsCount),
            series: theList
  
          };
          var colors = ['#D9F99F', '#FBBF24'];
          this.jobScheduleChart = Highcharts.chart('chartDiv_jobs', {
            chart: {
                type: 'column',
                backgroundColor: '#F1F5F9',
                borderWidth: 0,
                borderRadius: 0,
                plotShadow: false,
                plotBorderWidth: 0, 
                events:{
                  load: function () {
                    const series = this.series[0]; // Assuming you have only one series
                    const firstPoint:any = series.data[0]; // Get the first point of the series
    
                    // Check if the first point exists
                    if (firstPoint) {
                        const renderer = firstPoint.series.chart.renderer; // Get the chart renderer
                        if (renderer) {
                          // Get a reference to the rectangle element you want to remove
                          const rect = document.querySelector('#chart-shadow-overlay');
                          rect?.remove();
                        }
                        renderer
                        .rect(firstPoint.plotX - 10, firstPoint.plotY - 100, firstPoint.pointWidth * 2, firstPoint.shapeArgs.brBoxHeight + firstPoint.shapeArgs.height + firstPoint.shapeArgs.y)
                        .attr({
                          fill: 'var(--Neutral-200, #E2E8F0)',
                          zIndex: 1,
                          id: 'chart-shadow-overlay'
                        }).add();                      
                        // this.updateJobDetailData(firstPoint.category);
                    }
                  }
                }         
            },
            title: {
              text: ""
            },
            lang: {
              noData: 'You haven’t scheduled any jobs yet'
            },
            navigation: {
              buttonOptions: {
                enabled: false 
              }
            },
            credits: {
              enabled: false 
            },
            xAxis: {
                categories: data.labels,
                title: {
                  text: "Jobs"
                },
                labels: {
                  useHTML: true,
                  allowOverlap: false,
                  overflow:'justify',
                  style: {
                    width: 80,
                    textAlign: 'center'
                    // wordBreak: 'break-all',
                  }
                }
            },
            yAxis: {
              stackLabels: {
                enabled: true,
                style:{
                  fontWeight: 'normal'
                },
              },
              title: {
                text: "Number of Jobs"
              },
              gridLineWidth: 0, // Set gridLineWidth to 0 to hide gridlines
  
              lineWidth: 1, // Control the thickness of the Y-axis line
              tickLength: 0, // Hide ticks
              labels: {
                  enabled: false // Hide labels
              }
            },
            legend: {
              enabled: false
          },
          plotOptions: {
            bar: {
              borderWidth:0,
              pointPadding:0
            },
            column: {
              borderWidth:0,
              pointPadding:0,
              dataLabels: {
                  enabled: true,
                  inside: true, // Show data labels inside the bars
                  style:{
                    fontWeight: 'normal',
                    textOutline: "none",
                  },
                  formatter: function() {
                    if (this.y) {
                      return this.y;
                    }
                  }
                }
            },
            series: {
              stacking: 'normal',
                point: {
                  events: {
                    click: (event:any)=> {
                      const renderer =  event.point.series.chart.renderer;
                      if (renderer) {
                        // Get a reference to the rectangle element you want to remove
                        // const rect = renderer.getElementById('chart-shadow-overlay');
                        const rect = document.querySelector('#chart-shadow-overlay');
                        rect?.remove();
                      }
                      const numberOfSeries = event.point.series.chart.series.length;
                      var topY = 0;
                      const topSeries = event.point.series.chart.series[numberOfSeries - 1]; // Get the topmost series
                      const topPoint = topSeries.data[event.point.index]; // Get the top point for this category
                      topY = topPoint.shapeArgs.y; // Get the Y-coordinate of the top-most bar
                      event.point.series.chart.renderer
                        .rect(event.point.plotX + 2, topY - 70, event.point.pointWidth * 2, event.point.plotY + event.point.shapeArgs.brBoxHeight + event.point.shapeArgs.y + topPoint.shapeArgs.height)
                        .attr({
                          fill: 'var(--Neutral-200, #E2E8F0)',
                          zIndex: 1,
                          id: 'chart-shadow-overlay'
                        }).add();
                        
                        this.updateJobDetailData(event.point.category);
                      }
                    }
                  }
                }
              },
              colors:colors,
              series: data.series
            });
            const jobName = (data?.labels?.length > 0) ? data?.labels[0] : "Billing";
            this.renderJobDetailChart(jobName)
  
          }
      } else {
        this.jobScheduleSummary = null;
      }
      })
    }

    updateJobDetailData(iJobName:string) {
      const theJobScheduleData = this.jobScheduleSummary?.body.find((job:any)=> (job.jobName === iJobName));
      const theOneTimeCount:Number = Number(theJobScheduleData?.runningSchedules?.oneTime) + Number(theJobScheduleData?.futureSchedules?.oneTime);
      const theRecurringCount:Number = Number(theJobScheduleData?.runningSchedules?.recurring) + Number(theJobScheduleData?.futureSchedules?.recurring);
      const theManualCount:Number = Number(theJobScheduleData?.runningSchedules?.manual);
      const series= [{y:Number(theOneTimeCount),color:"#4C7B0F"}, {y:Number(theRecurringCount),color:"#F59E0B"}, {y:Number(theManualCount),color:"#981B1B"}];
      this.jobScheduleDetailChart.series[0].setData(series);

      // Update chart title
      this.jobScheduleDetailChart.setTitle({ text: iJobName });
  
    }

    renderJobDetailChart(iJobName:string) {
      const theJobScheduleData = this.jobScheduleSummary?.body.find((job:any)=> (job.jobName === iJobName));
      const theOneTimeCount:Number = Number(theJobScheduleData?.runningSchedules?.oneTime) + Number(theJobScheduleData?.futureSchedules?.oneTime);
      const theRecurringCount:Number = Number(theJobScheduleData?.runningSchedules?.recurring) + Number(theJobScheduleData?.futureSchedules?.recurring);
      const theManualCount:Number = Number(theJobScheduleData?.runningSchedules?.manual);
      const data = {
        labels: ["One Time", "Recurring", "Manual"],
        series: [{y:theOneTimeCount,color:"#4C7B0F"}, {y:theRecurringCount,color:"#F59E0B"}, {y:theManualCount,color:"#981B1B"}]
      };
      const colors = ["#4C7B0F", "#F59E0B", "#981B1B"]
      const chartOptions:any =  {
        chart: {
            type: 'bar',
            backgroundColor: '#E2E8F0',
            marginLeft: 85,

        },
        title: {
            text: iJobName,
            style: {
              color: '#FA7A55' 
          }
        },
        xAxis: {
          categories: data.labels,
          labels: {
            style: {
              color: '#000',
              fontFamily: 'Poppins',
              fontWeight:'normal',
              fontSize:'12'
            },
            x: -70,
            align: 'left',
          },
          lineWidth: 0, // Hide the x-axis line
          tickWidth: 0, // Hide the x-axis ticks
          title: {
              text: null
          },
        },
        yAxis: {
          visible: false,
          title: {
              text: null
          },
        },
        lang: {
          noData: 'You haven’t scheduled any jobs yet'
        },
        plotOptions: {
          bar: {
              borderRadius: '50%',
              dataLabels: {
                  enabled: true,
                  style:{
                    fontWeight: 'bold'
                  },
                  align: 'left',
                  useHTML: 'true',
                  // x: 600 //offset
            },
              pointPadding: 0, // Set the padding between points to 0
              groupPadding: 0.1, // Set the padding between points to 0
          },
          colors:colors
        },
        credits: {
          enabled: false
        },
        navigation: {
          buttonOptions: {
            enabled: false 
          }
        },
        legend: {
          enabled: false 
        },
      };
      
      chartOptions.series = [{type:'bar', data:data.series, maxPointWidth: 10}];
      this.jobScheduleDetailChart = Highcharts.chart('chartDiv_jobs_detail', chartOptions)
    }
  getProcessManagementSummary(): void {
    this.dashboardService.getProcessManagementSummary().subscribe((response: any) => {
      this.showProcessManagement = response && !response.exceptionName;
      if (this.showProcessManagement) {
        this.processManagementSummary = response.body || [];
        const theClusters = this.processManagementSummary.map((obj: any) => obj.clusterName);
        if (theClusters?.length > 0)
          this.setClusterChartData(theClusters[0]);
      }
    });
  }
  
   onClusterSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const clusterName = target.value;
    this.setClusterChartData(clusterName);
  }

  setClusterChartData(clusterName:string) {
    const clusterData = this.processManagementSummary?.find((obj: any) => obj.clusterName === clusterName);
    if (clusterData) {
      const runningData = clusterData.podStatusStats.map((stat: any) => parseInt(stat.running));
      const notRunningData = clusterData.podStatusStats.map((stat: any) => parseInt(stat.notRunning));
      const categories = clusterData.podStatusStats.map((stat: any) => stat.categoryName);

      this.renderChart(categories, runningData, notRunningData);
    }
  }

  renderChart(categories: string[], runningData: number[], notRunningData: number[]): void {
    if (!document.getElementById('chartDiv_clusters')) {
      console.error('Chart container not found');
      return;
    }
  
    this.clustersChart = Highcharts.chart('chartDiv_clusters', {
      chart: {
        type: 'column',
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        borderRadius: 0,
        plotShadow: false,
        plotBorderWidth: 0
      },
      title: {
        text: ""
      },
      navigation: {
        buttonOptions: {
          enabled: false
        }
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: categories,
        title: {
          text: "Pod Category"
        },
        labels: {
          useHTML: true,
          allowOverlap: false
        }
      },
      yAxis: {
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'normal'
          },
        },
        title: {
          text: "Number of Pods"
        },
        gridLineWidth: 0,
        lineWidth: 1,
        tickLength: 0,
        labels: {
          enabled: false
        }
      },
      lang: {
        noData: 'No Data Available'
      },
      legend: {
        enabled: true,  
        align: 'right', 
        verticalAlign: 'top',  
        layout: 'horizontal',  
        itemStyle: {
          fontWeight: 'normal',
          color: '#333' 
        }
      },
      plotOptions: {
        series: {
          stacking: 'normal' 
        },
        column: {
          pointWidth: 35,
          borderWidth: 0,
          pointPadding: 0,
          dataLabels: {
            style: {
              fontWeight: 'normal',
              textOutline: "none",
            },
            enabled: true,
            inside: true,
            formatter: function () {
              if (this.y) {
                return this.y;
              }
            }
          }
        }
      },
      series: [
        { type: 'column', name: 'Running Pods', data: runningData, color: '#82CB15' }, 
        { type: 'column', name: 'Not Running Pods', data: notRunningData, color: '#EF4343' }  
      ]
    });
  }
  
  
        
  getPDCSummary() {
    this.dashboardService.getPDCSummary().subscribe((response:any) => {
      if (typeof response === 'object' && response !== null && !response.hasOwnProperty('exceptionName')) {
        this.pdcSummary = response;
      }
    })
  }

  
  getAccountSummary() {
    const payload = {
      "startDate": this.dashboardService.getDayBefore(),
      "endDate": this.dashboardService.getDayBefore()
    }
    this.dashboardService.getAccountSummary(payload).subscribe((response:any) => {
      this.showAccountInfo = !this.commonService.checkForAccessDenied(response);
      if (typeof response === 'object' && response !== null && !response.hasOwnProperty('exceptionName')) {
        this.accountSummary = response;
      }
    })
  }

  getAccountTrend() {
    const payload = {
      "startDate": this.dashboardService.getDateForPicker(this.dashboardService.getOneMonthAndOneDayAgo()),
      "endDate": this.dashboardService.getDayBefore()
    }
    this.dashboardService.getAccountSummary(payload).subscribe((response:any) => {
      if (typeof response === 'object' && response !== null && !response.hasOwnProperty('exceptionName')) {
        this.accountTrends = response;
        const dates = this.accountTrends?.body?.map((entry:any) => entry.date);
        dates?.shift();
        const accTrendsChartOptions = {... this.lineChartOptions};
        accTrendsChartOptions.title = {
          text: 'Account Trends',
          align: 'left',
          style: {
            color: '#FA7A55' 
          }
        }
        accTrendsChartOptions.lang = {
          noData: 'No Account Trends data available'
        }
        accTrendsChartOptions.yAxis = {
          title: {
            text: 'No.of Accounts',
          },
          lineWidth: 1
        }

        this.updateChartOptionsForBands(accTrendsChartOptions, dates);
        const subtractData = (data: number[]) => {
          return data.map((value, index) => {
            if (index < data.length - 1) {
              return data[index+1] - data[index];
            } else {
              return "";
            }
          }).filter(value => value !== undefined);;
        };
  
        const activeAccounts = this.accountTrends?.body?.map((item: any) => item.active);
        const suspendedAccounts = this.accountTrends?.body?.map((item: any) => item.suspended);
        const deactivatedAccounts = this.accountTrends?.body?.map((item: any) => item.deactivated);
  

        accTrendsChartOptions.series = [
          {
            type: 'line',
            name: 'Active Accounts',
            data: subtractData(activeAccounts),
            marker: {
              symbol: 'square',
              enabled: true,

            },
            color: '#82CB15'
          },
          {
            type: 'line',
            name: 'Suspended Accounts',
            data: subtractData(suspendedAccounts),
            marker: {
               symbol: 'square',
              enabled: true
            },
            color: '#F59E0B'
          },
          {
            type: 'line',
            name: 'Closed Accounts',
            data: subtractData(deactivatedAccounts),
            marker: {
               symbol: 'square',
              enabled: true
            },
            color: '#EF4343'
          }          
        ];
        Highcharts.chart('acc-trends-container', accTrendsChartOptions);
      }
    })
  }

  getMonthName(monthNumber:string) {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[parseInt(monthNumber, 10) - 1]
  }

  updateChartOptionsForBands(iChartOptions:Highcharts.Options, iDates:Array<string>) {
    if (iDates?.length > 0) {
      var groupedDates:any = {};
      iDates.forEach((dateString:any) => {
        var dateParts = dateString.split('-');
        var monthYear:any = dateParts[1] + '-' + dateParts[2];
        if (!groupedDates[monthYear]) {
          groupedDates[monthYear] = [];
        }
        groupedDates[monthYear].push(dateString);
      });
      const theKeyList = Object.keys(groupedDates);
      if (theKeyList?.length < 3) {
        const theFirstList = groupedDates[theKeyList[0]];
        const theFirstMonth = this.getMonthName(theKeyList[0].split('-')[0]);
        const theSecondMonth = theKeyList.length > 1 ? this.getMonthName(theKeyList[1].split('-')[0]) : "";
        iChartOptions.xAxis = {
          categories: iDates,
          title: {
            text:"Dates"
          },
          labels: {
              formatter: function() {
                if (typeof this.value === 'string') {
                  return this.value.split("-")[0];
              } 
              else {
                  return "";
              }              
            }
          },
          plotBands:[{
            color:'#E6F5FA',
            from:0,
            to:theFirstList.length,
            label:{text:theFirstMonth}
          },
          {
            color:'#FFEFE2',
            from:theFirstList.length,
            to:iDates.length - 1,
            label:{text:theSecondMonth}
          }
        ]
        }
      }  
    }
  }

  getRELTrend() {
    const payld={
      "reportstartdate": null,
      "reportenddate": null
    }
    this.dashboardService.getTrendsData(payld).subscribe((response:any)=>{
      this.showRelTrends = !this.commonService.checkForAccessDenied(response);
      const dates = response?.data?.map((entry:any) => entry.logDate);
      const relTrendsChartOptions = {... this.lineChartOptions};
      relTrendsChartOptions.title = {
        text: '',
        align: 'center',
        style: {
          color: '#FA7A55' 
        }
      }
      relTrendsChartOptions.lang = {
        noData: 'No REL Trends data Available'
      }
      relTrendsChartOptions.yAxis = {
        title: {
          text: 'No.of Files'
        },
        lineWidth: 1
      },
      this.updateChartOptionsForBands(relTrendsChartOptions, dates);

      relTrendsChartOptions.series = [
        {
          type: 'line',
          name: 'Processed Files',
          data: response?.data?.map((item: any) => item.processed),
          marker: {
            symbol: 'square',
            enabled: true,

          },
          color: '#82CB15'
        },
        {
          type: 'line',
          name: 'Re-Processed',
          data: response?.data?.map((item: any) => item.reProcessed),
          marker: {
             symbol: 'square',
            enabled: true
          },
          color: '#F59E0B'
        },
        {
          type: 'line',
          name: 'Rejected Files',
          data: response?.data?.map((item: any) => item.systemRejected),
          marker: {
             symbol: 'square',
            enabled: true
          },
          color: '#EF4343'
        },
        // {
        //   type: 'line',
        //   name: 'Reprocessed Rejected Files',
        //   data: response?.data?.map((item: any) => item.reproRejected),
        //   marker: {
        //      symbol: 'square',
        //       enabled: true
        //   },
        //   color: '#9D7DE2'
        // },
        
      ];
      Highcharts.chart('container', relTrendsChartOptions);
  
    })
  }

  getRecycleKeys() {
    this.dashboardService.getRecycleKeys().subscribe((response:any)=>{
      if (response && Array.isArray(response)) {
        this.recycleKeys = response;
      }
    });
  }

  getReasonList() {
    this.dashboardService.getReasonList().subscribe((response:any)=>{
      if (response && Array.isArray(response)) {
        this.reasons = response;
      }
    });
  }

  getCDRStatus() {
    this.dashboardService.getCDRCurrentStatus().subscribe((response:any)=>{
      this.showCDRStatus = !this.commonService.checkForAccessDenied(response);
      if (typeof response === 'object' && response !== null && !response.hasOwnProperty('exceptionName')) {
        this.cdrCurrentStatus = response;
      }
    });
  }
  
  getCDRTrend() {

    const payload={
      "startDate":"",
      "endDate":"",
      "reason": this.selectedReasonKey,
      "recycleKey": this.selectedRecycleKey
    }
    this.dashboardService.getCDRTrendsData(payload).subscribe((response:any)=>{
      this.showCDRTrends = !this.commonService.checkForAccessDenied(response);
      const dates = response?.body?.map((entry:any) => entry.date);
      const cdrTrendsChartOptions = {... this.lineChartOptions};
      cdrTrendsChartOptions.title = {
        text: '',
        align: 'center',
        style: {
          color: '#FA7A55' 
        },
      }
      cdrTrendsChartOptions.lang = {
        noData: 'No Suspend CDR data Available'
      }
      cdrTrendsChartOptions.yAxis = {
        title: {
          text: 'No.of Records'
        },
        lineWidth: 1
      }
      cdrTrendsChartOptions.legend = {
        enabled : false
      }
      this.updateChartOptionsForBands(cdrTrendsChartOptions, dates);

      cdrTrendsChartOptions.series = [
        {
          type: 'line',
          name: 'Suspended Records',
          data: response?.body?.map((item: any) => Number(item.suspendRec)),
          marker: {
            symbol: 'square',
            enabled: true
         },
         color: '#EF4343'
        },
        {
          type: 'line',
          name: 'Records Submitted for Recycle',
          data: response?.body?.map((item: any) => Number(item.recyleSubmitRec)),
          marker: {
             symbol: 'square',
            enabled: true
          },
          color: '#F59E0B'
        },
        {
          type: 'line',
          name: 'Processed Records',
          data: response?.body?.map((item: any) => Number(item.recyledRec)),
          marker: {
             symbol: 'square',
            enabled: true
          },
          color: '#82CB15'
        },
        
      ];
      Highcharts.chart('cdrContainer', cdrTrendsChartOptions);

    });
  }
  
  getObjKeys(obj:any) {
    return (obj === null || obj === undefined || obj === "null") ? [] : Object.keys(obj);
  }

  isString(value:any) {
    return typeof value === 'string';
  }

  displayValue(key:string, value:any) {
    var aReturnVal = value;
    if (key === "eceDrType") {
      aReturnVal = this.dashboardService.getDRTypeString(Number(value))
    }
    return aReturnVal;
  }

  getImagePath(key:string):string {
    if (key === "eceClusterCount")
      return "assets/images/globe icon.svg"
    if (key === "eceDrType")
      return "assets/images/DRType.svg"
    else
      return "";
  }

  getAccIconPath(key:string):string {
    if (key === "active")
      return "assets/images/user-active.svg"
    if (key === "suspended")
      return "assets/images/user-suspend.svg"
    if (key === "deactivated")
      return "assets/images/icon-user-remove.svg"
    if (key === "total")
      return "assets/images/user-group.svg"    
    else
      return "";
  }

  getIconPath(key:string):string {
    if (key === "recyleSubmitRec")
      return "assets/images/recycle-records-count.svg"
    if (key === "suspendRec")
      return "assets/images/suspended-records-count.svg"
    if (key === "recyledRec")
      return "assets/images/processed-records-count.svg"    
    else
      return "";
  }


  getBRMIcon(key:string) {
    if (key === "nextBillingDate")
      return "assets/images/calendar-white.svg"
    if (key === "billingCyclesCount")
      return "assets/images/billing-cycle-white.svg"
    if (key === "nextBillingAccounts")
      return "assets/images/user-group-white.svg"
    else
      return "";  
  }


  isInactive(key:string) {
    return (key.toLowerCase() === "deactivated" || key === "suspendRec") ? true : false;
  }

getstatusColorClass(iStatus:string):string {
  var aReturnVal = "transparent";    
  if (iStatus === "UsageProcessing")
  aReturnVal = "active";
  if ((iStatus === "CustomerDataLoaded") || (iStatus === "PricingDataLoaded"))
    aReturnVal = "warning"
  if (iStatus === "ShutdownInProgress")
    aReturnVal = "closed"
  return aReturnVal;
}

navigateToScheduleModule() {
  this.router.navigate(['operation/schedule-list']);
}
 }


