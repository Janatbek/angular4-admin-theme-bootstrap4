import { BaseWidget } from '../../common/baseComponents/BaseWidget/BaseWidget.component';
import { BaseManagedDataWidget } from '../../common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';
import { Component, OnInit, Input } from '@angular/core';
import { Params } from '@angular/router';

@Component({
  selector: 'app-anomalies-raw-trace-vs-population',
  templateUrl: './anomalies-raw-trace-vs-population.component.html',
  styleUrls: ['./anomalies-raw-trace-vs-population.component.css']
})
export class AnomaliesRawTraceVsPopulationComponent extends BaseManagedDataWidget {

  // Declarations
  // ---------------------
  dataSeries = [];

  // Indices
  germProcessIndex:number = -1;
  isAnomalyIndex:number = -1;
  sensorNameIndex:number = -1;
  toolNameIndex:number = -1;
  travelerStepIndex:number = -1;
  timestampIndex:number = -1;
  sensorValueIndex:number = -1;
  runIDIndex:number = -1;

  // Chart Data
  public datasets: any[];
  public labels: string[];
  // ---------------------


   public options: any = {
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
        scaleLabel: {
          labelString: 'Sensor Value',
          display: true,
          fontSize: 14,
          fontStyle: 'bold'
        },
        type: 'linear',
        ticks: {
        }
      }],
      xAxes: [{
        scaleLabel: {
          labelString: 'Timestamp',
          display: true,
          fontSize: 14,
          fontStyle: 'bold'
        },
        type: 'linear',
        position: 'bottom'
      }]
    }
  };

  public colors:Array<any> = [
     {
        borderColor: 'rgba(163, 0, 40, .5)',
        backgroundColor: 'rgba(163, 0, 40, .5)',
        pointHoverBorderColor: 'rgba(163, 99, 40, .1)',
        pointHoverBackgroundColor: 'rgba(163, 99, 40, .1)'
      },
      {
        borderColor: 'rgba(0, 0, 0, .1)',
        backgroundColor: 'rgba(0, 0, 0, .1)'
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

    // Get all indices
    this.germProcessIndex = this.displayDataSet.columns.indexOf('germ_process');
    this.isAnomalyIndex = this.displayDataSet.columns.indexOf('is_anomaly');
    this.runIDIndex = this.displayDataSet.columns.indexOf('run_id');
    this.sensorNameIndex = this.displayDataSet.columns.indexOf('sensor_name');
    this.toolNameIndex = this.displayDataSet.columns.indexOf('tool_name');
    this.travelerStepIndex = this.displayDataSet.columns.indexOf('traveler_step');
    this.timestampIndex = this.displayDataSet.columns.indexOf('timestamp');
    this.sensorValueIndex = this.displayDataSet.columns.indexOf('sensor_value');

    // Filter out content with null sensor value AND sort by runID
    const filteredDataSet = this.displayDataSet.data
      .filter( row =>  row[this.sensorValueIndex] !== 'NULL' )
      .sort((a,b) => Number(a[this.runIDIndex]) - Number(b[this.runIDIndex]));


    //  GROUP BY RUN ID
    //  ----------------------------------------------------------------------------
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
    // ----------------------------------------------------------------------------

   // SORT EACH RUN_ID GROUP BY TIME
   // ----------------------------------------------------------------------------
    let tracesGroupedByRunAndTime = [];
    for(let i=0; i<tracesGroupedByRun.length; i++){
      tracesGroupedByRunAndTime[i] = tracesGroupedByRun[i]
        .sort((a,b) => parseFloat(a[this.timestampIndex]) - parseFloat(b[this.timestampIndex]));
    }
   // ----------------------------------------------------------------------------

    // GENERATE DATA SERIES
    // ----------------------------------------------------------------------------
    for(let i=0; i<tracesGroupedByRunAndTime.length; i++){
      for(let j=0; j<tracesGroupedByRunAndTime[i].length; j++){

        if(j === 0){ this.dataSeries[i] = []; }

        // Transform datasets into object notation (must be in this notation for scatterplot)
        this.dataSeries[i].push(this.transformData(tracesGroupedByRunAndTime[i][j]));

      }
    }
    // ----------------------------------------------------------------------------


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
            fill: false
        });

        anomPlaced = false;

     } else {
       if(i % 20 === 0){
          this.datasets.push({
            data: this.dataSeries[i],
            fill: false
        });
       }
      }
    }
  }

  private transformData(data:any[]) {

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

    //  events
  public chartClicked(e:any):void {



    console.log(e);
  }
 
  public chartHover(e:any):void {
    console.log(e);
}
 
public update():void{

}
   





























    /*

    this.datasets = Object.keys(runIdGrouping).map( k => {
      return {
        label: k,
        data: runIdGrouping[k].map(f => Number(f))
      };

    }); 
    Object.keys(runIdGrouping).forEach( k => {
      const currentSensorValues = runIdGrouping[k];

    }); */


    //  // For charting, only the sensor value and timestamp are necessary - let's add those to our datasets
    //  for(let i=0; i<this.displayDataSet.data.length; i++){
    //    this.xDataset = filteredDataSet.map
    //    this.xDataset.push(this.displayDataSet.data[i][this.timestampIndex] === 'NULL' ? null : parseFloat(this.displayDataSet.data[i][this.timestampIndex]));
    //    this.yDataset.push(this.displayDataSet.data[i][this.sensorValueIndex] === 'NULL' ? 0 : parseFloat(this.displayDataSet.data[i][this.sensorValueIndex]));
  
    //  }    
    //  this.sort(this.xDataset, this.yDataset);
    
    //  this.datasets = [{

    //    data: this.yDataset

    //  }];

    //  this.labels = [];

    //  // Convert sorted dataset back to string
    //  for(let i=0; i<this.xDataset.length; i++){
    //    this.labels.push(this.xDataset[i].toString());
    //  }

    

/* MAY NOT NEED - RUN Id's should be unique to each tool
    // Locate which column contains run id
    // --This can be done statically, just wanted to add this feature in case the dataset changes
    for(let i=0; i<this.displayDataSet.columns.length; i++){
      if(this.displayDataSet.columns[i] === 'run_id'){
        this.runIDIndex = i;
        break;
      }
    }

    // Parse data to get array of all available runID's
    for(let i=0; i<this.displayDataSet.data.length; i++){
      this.runIDArray.push(this.displayDataSet.data[i][this.runIDIndex]);
    }

    // get all rows that have the same run id and place into array
    // this.runsGroupedByRunID


    for(let i=0; i<this.displayDataSet.data.length; i++){
      for(let j=0; j<this.displayDataSet.data[i].length; j++){

          //         

      }
    }

    // this.displayDataSet.data
    
    
    */

}

export interface RawTraceData{

    germProcess: string;
    isAnomaly: number;
    runID: number;
    sensorName: string;
    toolName: string;
    travelerStep: string;
    time: number;
    sensorValue?: number;

}
