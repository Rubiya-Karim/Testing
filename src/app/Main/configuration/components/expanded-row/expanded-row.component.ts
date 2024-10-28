import { AfterViewInit, Component, Input } from '@angular/core';
import { PieChart } from 'chartist';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
NoDataToDisplay(Highcharts);

HC_exporting(Highcharts);

@Component({
  selector: 'app-expanded-row',
  templateUrl: './expanded-row.component.html',
  styleUrls: ['./expanded-row.component.scss']
})
export class ExpandedRowComponent implements AfterViewInit {
  @Input() expanded: boolean = false;
  @Input() chartData:any;
  @Input() chartID:any;
  @Input() headerKey!:string;
  
  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.headerKey === "opCodeName") {
      var categories:any = [];
      var series:any = [];
      var successRecList:any = [];
      var notExecutedRecList:any = [];
      var failedRecList:any = [];
      this.chartData?.body?.forEach((statsData:any, index:number) => {
        const ind = index + 1;
        categories.push("OPC"+ind);
        successRecList.push(statsData.successRec ? (Math.round((statsData.successRec/statsData.totalRec) * 100)) : 0)
        notExecutedRecList.push(statsData.notExecuted ? (Math.round((statsData.notExecuted/statsData.totalRec) * 100)) : 0);
        failedRecList.push(statsData.failedRec ? (Math.round((statsData.failedRec/statsData.totalRec) * 100)) : 0);      })
      if (successRecList?.length > 0 || notExecutedRecList?.length > 0 || failedRecList?.length > 0 ) {
        series.push({data:successRecList,  maxPointWidth: 32, groupPadding:0, pointPadding:0}, 
          {data:notExecutedRecList,  maxPointWidth: 32, groupPadding:0, pointPadding:0}, 
          {data:failedRecList,  maxPointWidth: 32, groupPadding:0, pointPadding:0});
      }
      // Adjust data to ensure the total of each series is 100
      if (series?.length > 0) {
        const dataLength = series[0].data.length;
        for (let i = 0; i < dataLength; i++) {
          const total = series[0].data[i] + series[1].data[i] + series[2].data[i];
          const diff = 100 - total;
          if (!isNaN(diff) && diff !== 0) {
            series[0].data[i] += diff;
          }
        }
      }
      const colors = ['#82CB15', '#FBBF24', '#EF4343'];

      Highcharts.chart('chartDiv' + this.chartID, {
          chart: {
            type: 'column',
            backgroundColor: '#F1F5F9',
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
            labels: {
              useHTML: true,
              allowOverlap: false,
              // style: {
              //   wordBreak: 'break-all',
              // }
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
              text: null
            },
            gridLineWidth: 0, // Set gridLineWidth to 0 to hide gridlines

            lineWidth: 1, // Control the thickness of the Y-axis line
            tickLength: 0, // Hide ticks
            labels: {
              enabled: false // Hide labels
            }
          },
          lang: {
            noData: 'No Data Available'
          },
          legend: {
            enabled: false
          },
          plotOptions: {
            series: {
              stacking: 'normal',
            },
            bar: {
              borderWidth:0,
              // groupPadding:0,
              pointPadding:0
            },
            column: {
              borderWidth:0,
              // groupPadding:0,
              pointPadding:0,
              dataLabels: {
                style:{
                  fontWeight: 'normal',
                  textOutline: "none",
                },
                formatter: function() {
                  if (this.y) {
                    return this.y;
                  }
                },
                enabled: true,
                inside: true // Show data labels inside the bars
              }
            }

          },
          colors: colors,
          series: series
        });
    } else {
      if (this.headerKey !== "report") {
        this.chartData?.body?.forEach((statsData:any) => {
          const theChartID= this.chartID + (statsData[this.headerKey] ? "_"+ statsData[this.headerKey]?.toString() : "");
          this.getChartData(statsData, theChartID);
        })
      }
    }
  }
  
  statsHasData():boolean {
    return this.chartData?.body?.length > 0 && JSON.stringify(this.chartData.body[0]) !== "{}";
  }

  getChartData(data:any, id:any) {
    if (this.chartData?.body) {
      const chartData = {
        series:  this.valueForChart(data),
      };
      const options = {
        donut: true,
        donutWidth: 50,
        startAngle: 0,
        showLabel: true,
        labelInterpolationFnc: (value: string) => value + '%'
      };
      new PieChart(`#chartDiv${id}`, chartData, options);
    }
}

  valueForChart(data:any):{ value: number; className: any; }[] {
    var aReturnVal: { value: number; className: any; }[] = [];
    var theKeyList!: any;
    if (this.headerKey === "payType" || this.headerKey === "") {
      theKeyList = [{key:"totalErrRec", className:"primary-chart-color"}, 
      {key:"totalDataErrRec", className:"secondary-chart-color"}, 
      {key:"totalSuccessRec", className:"tertiary-chart-color"},
      {key:"totalNotEligibleRec", className:"acc-chart-color"}];
    } 
    // else if (this.headerKey === "opCodeName") {
    //   theKeyList = [{key:"failedRec", className:"primary-chart-color"}, 
    //   {key:"notExecuted", className:"secondary-chart-color"}, 
    //   {key:"successRec", className:"tertiary-chart-color"}];
    // }
    else if(this.headerKey === "date")
    {
      theKeyList =[ 
      {key:"totalFiles", className:"secondary-chart-color"}, 
      {key:"processed", className:"tertiary-chart-color"},
      {key:"rejected", className:"tertiary-chart-color"},
    ];
    }
    theKeyList?.forEach((ele:any) => {
      if (data[ele.key] > 0) {
        aReturnVal.push({value: this.formatPercentage(data[ele.key], data['totalRec']), className: ele['className']});
      }
    });
  return aReturnVal;
  }

  formatPercentage(a: number, b: number): number {
    const percentage = (a * 100) / b;
    // Truncate to 2 decimal places
    return Math.round(percentage * 100) / 100;
  }

  getStatKeys(obj:any) {
    return Object.keys(obj);
  }

  totalRejectedFilesCount(body:any):string {
    return (Number(body.rejected) + Number(body.reProRejected)).toString();
  }

  totalProcessedFilesCount(body:any):string {
    return (Number(body.processed) + Number(body.reProcessed)).toString();
  }
}
