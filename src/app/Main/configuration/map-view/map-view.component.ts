import { AfterViewInit, Component, Input } from '@angular/core';
import * as Highcharts from "highcharts/highmaps";
import worldMap from "@highcharts/map-collection/custom/world-continents.topo.json";

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements AfterViewInit {

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = "mapChart";
  options!:Highcharts.Options;
  popupList:Array<string> = [];
  @Input() mapLines:Array<any> = [];
  @Input() mapPts:Array<any> = [];
  chart!:any;
  constructor() {

  }

  ngAfterViewInit(): void {

    this.options = {
      chart: {
        map: worldMap,
        events: {
          load: function() {
            var chart = this,
              points = chart.series[2].points,
              xAxis = chart.xAxis[0],
              yAxis = chart.yAxis[0],
              maxLeft: number | undefined, maxRight: number | undefined, maxBottom: number | undefined, maxTop: number | undefined;
            points.forEach(function(point, index) {
              if (maxLeft && maxRight) {
                if (point.x < maxLeft) {
                  maxLeft = point.x;
                } else if (point.x > maxRight) {
                  maxRight = point.x;
                }
              } else {
                maxLeft = maxRight = point.x;
              }
    
              if (maxBottom && maxTop) {
                if (point.y ? point.y : 0 < maxBottom) {
                  maxBottom = point.y;
                } else if (point.y ? point.y : 0 > maxTop) {
                  maxTop = point.y;
                }
              } else {
                maxTop = maxBottom = point.y;
              }
            });
    
            yAxis.setExtremes(maxBottom, maxTop);
            xAxis.setExtremes(maxLeft, maxRight);
          }
        }
      },
      accessibility: {
        enabled: false
      },
      title: {
        text: "Site Map"
      },
      mapNavigation: {
        enabled: true,
        buttonOptions: {
          verticalAlign: 'bottom'
        }
      },
      mapView: {
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        enabled:false
      },
  
      colorAxis: {
        min: 0
      },
      plotOptions: {
        series: {
          states: {
              inactive: {
                  opacity: 1
              }
          }
      }
    },
      series: [
        {
          type: "map",  
          dataLabels: {
            enabled: false,
          },
          nullColor:"#ccc",
          allAreas: true,
          // tooltip: {
          //   headerFormat: '<b>{point.name}</b>:<br/>',
          //   pointFormat: '{point.info}'
          // },
        },
        {
            type: 'mapline',
            data: this.mapLines,
            lineWidth: 2,
        },
        {
          // allowPointSelect:true,
            type: 'mappoint',
            // color: '#333',
            dataLabels: {
                align: 'left',
                verticalAlign: 'middle'
            },
            data: this.mapPts,
            point:{
              events:{
                mouseOver: this.handlePointEvent.bind(this),
                click: this.handlePointEvent.bind(this)
              }
            },
        },
    ]
    
    };
  
    this.getMap();
  }

  handlePointEvent(e:any) {
  const colors = ['#ED7D31','#E3A400','#EE1189','#9D7DE2','#206B81'];   
    const selectedColor = colors[(e.target.index%5)]
    const point = e.type === "mouseOver" ? e.target : e.point;
    // Handle point selection event
    const popup = document.getElementById(point.options.custom['siteName']);
                  
    const mapcontainer = point.series.chart.container;
    if (popup) {
      mapcontainer?.removeChild(popup);
    } else {
      const markerX = (point.plotX? point.plotX : 0) - point.series.chart.plotLeft;
      const markerY = (point.plotY? point.plotY : 0) - point.series.chart.plotTop + 20;
      const smallView = document.createElement('div');
      smallView.id=point.options.custom['siteName'];
      smallView.className = 'map-marker-popup-view'; 
      smallView.innerHTML = `<div id="map-marker-popup"><div id="map-marker-container">
      <div id="map-marker-svg1"> 
        <svg xmlns="http://www.w3.org/2000/svg" width="51" height="60" viewBox="0 0 51 60" fill="none"> 
          <path d="M38.55 50.3988H32.64L25.68 60L17.73 50.3988H12C5.4 50.3988 0 45.015 0 38.4347V11.9641C0 5.38385 5.4 0 12 0H38.55C45.15 0 50.55 5.38385 50.55 11.9641V38.4347C50.55 45.015 45.15 50.3988 38.55 50.3988Z" fill="${selectedColor}"/> 
        </svg> 
      </div>
      <div id="map-marker-svg2"> 
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"> 
          <path d="M28 15.9524C28 22.56 22.6274 27.9165 16 27.9165M28 15.9524C28 9.34479 22.6274 3.98828 16 3.98828M28 15.9524H4M16 27.9165C9.37258 27.9165 4 22.56 4 15.9524M16 27.9165C18.2091 27.9165 20 22.56 20 15.9524C20 9.34479 18.2091 3.98828 16 3.98828M16 27.9165C13.7909 27.9165 12 22.56 12 15.9524C12 9.34479 13.7909 3.98828 16 3.98828M4 15.9524C4 9.34479 9.37258 3.98828 16 3.98828" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> 
        </svg> 
      </div> </div>
      <div>
      <div id="map-marker-title">${point.options.custom ? point.options.custom['siteName'] : ''}</div>
      <div id="map-marker-subtitle">${point.options.custom ? point.options.custom['location'] : ''}</div>
      <div id="map-marker-subtitle">${point.options.custom ? point.options.custom['geo'] : ''}</div>
      </div></div>`     
      // smallView.innerHTML = '<app-map-marker-view style="height:100px;width:100px">1123</app-map-marker-view>'  
      
      smallView.style.position = 'absolute';
      smallView.style.left = markerX + 'px';
      smallView.style.top = markerY + 'px';
      mapcontainer?.appendChild(smallView);
    }
}
  
  getMap() {
    this.chart = Highcharts.mapChart('map-container', this.options);
    Highcharts.addEvent(this.chart.mapView, 'afterSetView', this.printView);

  }

  printView = () => { 
    const thePts = this.mapPts.map((obj:any) => obj.custom?.siteName);
    const thePopupViewsAdded = Array.from(this.chart.container.children);
    const filteredList = thePopupViewsAdded.filter((obj:any) => thePts.includes(obj.id));
    filteredList.forEach((popUpView:any) => {
      this.chart.container.removeChild(popUpView);
    })
};
  
}
