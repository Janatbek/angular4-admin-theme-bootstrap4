import {
    BaseManagedDataWidget
} from '../../common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';
import { Component, OnInit, Input} from '@angular/core';
import { Params } from '@angular/router';
import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';
import { WidgetConfiguration } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-anomalies-traveler-step',
  templateUrl: './anomalies-traveler-step.component.html',
  styleUrls: ['./anomalies-traveler-step.component.css']
})
export class AnomaliesTravelerStepComponent extends BaseWidget {

    public barChartOptions:any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      type: 'linear',
      yAxes: [{}],
      xAxes: [{}]
    }
  };

  public barChartColors:Array<any> = [
     {
        backgroundColor: 'rgba(163, 0, 40, .5)',
        hoverBackgroundColor: 'rgba(163, 0, 40, .2)'
      },
      {
        backgroundColor: 'rgba(0, 104, 124, .5)',
        hoverBackgroundColor: 'rgba(0, 104, 124, .2)'
      }
  ];

  public barChartLabels:string[] = ['Blah', 'Blah', 'Blah', 'Blah', 'Blah'];
  public barChartType:string = 'bar';
  public barChartLegend:boolean = true;
  dataset1:number[] = [1, 2, 3, 4, 5];
  dataset2:number[] = [5, 4, 3, 2, 1];
  
 
  public barChartData:any[] = [
    {data: this.dataset1, label: 'Data 1'},
    {data: this.dataset2, label: 'Data 2'}
  ];
 
  // events
  public chartClicked(e:any):void {
    console.log(e);
  }
 
  public chartHovered(e:any):void {
    console.log(e);
  }
 
  public update():void{

  }

}
