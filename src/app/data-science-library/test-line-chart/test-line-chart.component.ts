import { BaseManagedDataWidget } from '../../common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';
import { Component, OnInit, Input} from '@angular/core';
import { Params } from '@angular/router';
//import { BaseManagedDataWidget } from 'app/common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';
import { WidgetConfiguration } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-test-line-chart',
  templateUrl: './test-line-chart.component.html',
  styleUrls: ['./test-line-chart.component.css']
})
export class TestLineChartComponent extends BaseManagedDataWidget {
 
  dataSeries:number[][];
  runsGroupedByRunID = {};

 dataset1:number[] = [32, 121, 19, 0, 26, 7, 2];
 dataset2:number[] = [1945, 1245, 523, 158, 102, 86, 43];

  barChartData:any[] = [
    {data: this.dataset1, label: '-1: Anomolous Runs'},
    {data: this.dataset2, label: '1: Normal Runs'}
    ];

      public barChartOptions:any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      yAxes: [{
        type: 'logarithmic',
        display: true,
        gridLines: false,
        ticks: {
          callback: function(value, index, values) {
            if(value % 10 === 0 && value.toString()[0] == '1'){
              return Number(value.toString());
            }else{
              return '';
            }
        },

        }
      }],
      xAxes: [{
        display: true,
        ticks: {
          fontSize: 10,
         /* callback: function(value, index){
            return value.toString().substring(0, 10) + '...'; //Fix this
          }*/
        },
        tooltips: {}
      }]
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

  public barChartLabels:string[] = ['3010-21 STI PHOTO', '5200-20 STI OXIDE CMP', '3010-49 CONTACT PHOTO', '4300-51 WL PV SPUTTER', '6000-AW ARRAY LDD AS IMPLANT', '5430-54 BL PRE METAL..', '5030-92 METAL2 OXIDE'];
  public barChartType:string = 'line';
  public barChartLegend:boolean = true;

    // events
  public chartClicked(e:any):void {
    console.log(e);
    console.log(this.barChartData);
  }
 
  public chartHovered(e:any):void {
    console.log(e);
  }
 
public update():void{
 
}

  public PostProcessing(){

    this.BuildDisplay();

  }

  public BuildDisplay(){

   

  }


}
