import { BaseWidget } from '../../common/baseComponents/BaseWidget/BaseWidget.component';
import { BaseManagedDataWidget } from '../../common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';
import { Component, OnInit, Input } from '@angular/core';
import { Params } from '@angular/router';

@Component({
  selector: 'app-all-traces',
  templateUrl: './all-traces.component.html',
  styleUrls: ['./all-traces.component.css']
})
export class AllTracesComponent extends BaseManagedDataWidget {

    //Declarations
  //---------------------
  dataSeries = [];

  //Indices
  germProcessIndex:number = -1;
  isAnomalyIndex:number = -1;
  sensorNameIndex:number = -1;
  toolNameIndex:number = -1;
  travelerStepIndex:number = -1;
  timestampIndex:number = -1;
  sensorValueIndex:number = -1;
  runIDIndex:number = -1;

  //Chart Data
  public datasets:any[];
  public labels:string[];
  public tracesGroupedByRunAndTime:any[];
  //---------------------


   public options:any = {
    responsive: true,
    legend: false,
    spanGaps: false,
    maintainAspectRatio: true,
    elements: {
      line: {
        tension: 0.0000001
      }
    },
    scales: {
      yAxes: [{
        type: 'linear',
        ticks: {
        },
        scaleLabel: {
          labelString: 'Sensor Value',
          display: true,
          fontSize: 14,
          fontStyle: 'bold'
        },
      }],
      xAxes: [{
        type: 'linear',
        position: 'bottom',
        scaleLabel: {
          labelString: 'Timestamp',
          display: true,
          fontSize: 14,
          fontStyle: 'bold'
        }
      }]
    }
  };

  public domColors:Array<any> = [
     {
        borderColor: 'rgba(163, 0, 40, .5)',
        backgroundColor: 'rgba(163, 0, 40, .5)',
        pointHoverBorderColor: 'rgba(163, 99, 40, .1)',
        pointHoverBackgroundColor: 'rgba(163, 99, 40, .1)'
      }
  ];

  public subColors:Array<any> = [
      {
        borderColor: 'rgba(0, 0, 0)',
        backgroundColor: 'rgba(0, 0, 0)'
      }
  ];

  public type:string = 'scatter';
  public legend:boolean = true;


public sort(data:number[], sortDataRespectively:number[]): number[] {

  while(!this.checkSorted(data)){
    for(let i=0; i < data.length-1; i++){
      if(data[i] > data[i+1]){
        const temp: number = data[i];
        const temp2: number = sortDataRespectively[i]
        data[i] = data[i+1];
        sortDataRespectively[i] = sortDataRespectively[i+1];
        data[i+1] = temp;
        sortDataRespectively[i+1] = temp2;
      }
    }
  }

  return data;

}

public checkSorted(data:number[]): boolean {
  for(let i=0; i<data.length-1; i++){
    if(data[i] > data[i+1]) return false;
  }
  return true;
}

public PostProcessing(){

    this.BuildDisplay();

}

  public BuildDisplay(){

    //Get all indices
    this.germProcessIndex = this.displayDataSet.columns.indexOf('germ_process');
    this.isAnomalyIndex = this.displayDataSet.columns.indexOf('is_anomaly');
    this.runIDIndex = this.displayDataSet.columns.indexOf('run_id');
    this.sensorNameIndex = this.displayDataSet.columns.indexOf('sensor_name');
    this.toolNameIndex = this.displayDataSet.columns.indexOf('tool_name');
    this.travelerStepIndex = this.displayDataSet.columns.indexOf('traveler_step');
    this.timestampIndex = this.displayDataSet.columns.indexOf('timestamp');
    this.sensorValueIndex = this.displayDataSet.columns.indexOf('sensor_value');

    //Filter out content with null sensor value AND sort by runID
    const filteredDataSet = this.displayDataSet.data
      .filter( row =>  row[this.sensorValueIndex] !== 'NULL' )
      .sort((a,b) => Number(a[this.runIDIndex]) - Number(b[this.runIDIndex]));


    //GROUP BY RUN ID
    //----------------------------------------------------------------------------
    const tracesGroupedByRun = [];
    let subIndex = 0;
    let rowCount = -1;

    for(let i=0; i<filteredDataSet.length; i++){
      const temp = filteredDataSet[i][this.runIDIndex];
     if(i == 0 || filteredDataSet[i-1][this.runIDIndex] !== temp){
        rowCount++;
        subIndex = 0;
        tracesGroupedByRun[rowCount] = [];
     }

     tracesGroupedByRun[rowCount][subIndex] = [];

     for(let j=0; j<filteredDataSet[i].length; j++){
      tracesGroupedByRun[rowCount][subIndex].push(filteredDataSet[i][j]);
     }
     subIndex++;
    }
    //----------------------------------------------------------------------------

   //SORT EACH RUN_ID GROUP BY TIME
   //----------------------------------------------------------------------------
    this.tracesGroupedByRunAndTime = [];
    for(let i=0; i<tracesGroupedByRun.length; i++){
      this.tracesGroupedByRunAndTime[i] = tracesGroupedByRun[i]
        .sort((a,b) => parseFloat(a[this.timestampIndex]) - parseFloat(b[this.timestampIndex]));
    }
   //----------------------------------------------------------------------------

    //GENERATE DATA SERIES
    //----------------------------------------------------------------------------
    for(let i=0; i<this.tracesGroupedByRunAndTime.length; i++){
      for(let j=0; j<this.tracesGroupedByRunAndTime[i].length; j++){

        if(j == 0){ this.dataSeries[i] = []; }

        //Transform datasets into object notation (must be in this notation for scatterplot)
        this.dataSeries[i].push(this.transformData(this.tracesGroupedByRunAndTime[i][j]));

      }
    }
    //----------------------------------------------------------------------------


   
    this.datasets = [];

    for(let i = 0; i < this.dataSeries.length; i++) {

      let anomPlaced = false;
      let isAnom = false;

      if(!anomPlaced){
        for(let j = 0; j < this.dataSeries[i].length; j++) {
          if(this.dataSeries[i][j].y === 0.04143585) {
            isAnom = true;
          }
        }
     }

     if(isAnom && !anomPlaced) {
          this.datasets.unshift({
            data: this.dataSeries[i],
            fill: false,
            runID: this.tracesGroupedByRunAndTime[i][0][this.runIDIndex],
          sensorName: this.tracesGroupedByRunAndTime[i][0][this.sensorNameIndex]
        });

        anomPlaced = false;

     } else {
        if(i % 20 === 0){
          this.datasets.push({
            data: this.dataSeries[i],
            fill: false,
            runID: this.tracesGroupedByRunAndTime[i][0][this.runIDIndex],
            sensorName: this.tracesGroupedByRunAndTime[i][0][this.sensorNameIndex]
          });
        }
      }
    }
  }

  private transformData(data:any[]){

    const temp = {
      x: parseFloat(data[this.timestampIndex]),
      y: parseFloat(data[this.sensorValueIndex])
    }

    return temp;
}

   private transformDataXY(xData:number[], yData:number[]){

    const temp = [];

    for(let i=0; i<xData.length; i++){
      temp.push({
        x: xData[i],
        y: yData[i]
      });
    }

    return temp;

  }

    // events
  public chartClicked(e:any):void {



    console.log(e);
  }
 
  public chartHover(e:any):void {
    console.log(e);
  }
  
  public update():void{

  }

}
