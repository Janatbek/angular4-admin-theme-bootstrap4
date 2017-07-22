import { BaseWidget } from '../../common/baseComponents/BaseWidget/BaseWidget.component';
import { BaseManagedDataWidget } from '../../common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';
import { Component, OnInit, Input } from '@angular/core';
import { Params } from '@angular/router';

@Component({
  selector: 'app-reason-keys',
  templateUrl: './reason-keys.component.html',
  styleUrls: ['./reason-keys.component.css']
})
export class ReasonKeysComponent extends BaseManagedDataWidget {

    //Declarations
  //---------------------
  dataSeries = [];

  //Indices
  germProcessIndex:number = -1;
  sensorNameIndex:number = -1;
  toolNameIndex:number = -1;
  travelerStepIndex:number = -1;
  sensorValueIndex:number = -1;
  runIDIndex:number = -1;
  featureKeyIndex:number = -1;


  //Chart Data
  public datasets:any[];
  public labels:string[];
  //---------------------


   public options:any = {
    responsive: true,
    maintainAspectRatio: false,
    legend: false,
    scales: {
      yAxes: [{
        scaleLabel: {
          labelString: 'Standard Deviation',
          display: true,
          fontSize: 14,
          fontStyle: 'bold'
        },
        gridLines: {
          offsetGridLines: true
        },
        ticks: {

        }
      }],
      xAxes: [{
        scaleLabel: {
          labelString: 'Feature Key',
          display: true,
          fontSize: 14,
          fontStyle: 'bold'
        },
        ticks: {
          autoSkip: false
        }
      }]
    }
  };

  public colors:Array<any> = [
     {
        backgroundColor: 'rgba(163, 0, 40, .5)',
        hoverBackgroundColor: 'rgba(163, 0, 40, .2)'
      }
  ];

  public type:string = 'horizontalBar';
  public legend:boolean = true;

public PostProcessing(){

    this.BuildDisplay();

}

  public BuildDisplay(){

    //Get all indices
    this.runIDIndex = this.displayDataSet.columns.indexOf('RUN_ID');
    this.germProcessIndex = this.displayDataSet.columns.indexOf('GERM_PROCESS');
    this.sensorNameIndex = this.displayDataSet.columns.indexOf('SENSOR_NAME');
    this.toolNameIndex = this.displayDataSet.columns.indexOf('TOOL_NAME');
    this.travelerStepIndex = this.displayDataSet.columns.indexOf('TRAVELER_STEP');
    this.sensorValueIndex = this.displayDataSet.columns.indexOf('NORMALIZED_VALUE');
    this.featureKeyIndex = this.displayDataSet.columns.indexOf('FEATURE_KEY');

    //Filter out content with null sensor value AND sort by Feature Key
    const filteredDataSet = this.displayDataSet.data
      .filter( row =>  row[this.sensorValueIndex] !== 'NULL' )
      .sort(function(a, b){

        //console.log(this.featureKeyIndex); KELLEY WHYYY

         if(a[5] < b[5]){
           return 1;
         }else if(a[5] > b[5]){
          return -1;
         }else{
           return 0;
         }
        });

    //GROUP BY FEATURE
    //----------------------------------------------------------------------------
    const tracesGroupedByFeature = [];
    let subIndex = 0;
    let rowCount = -1;

    for(let i=0; i<filteredDataSet.length; i++){
      const temp = filteredDataSet[i][this.featureKeyIndex];
     if(i == 0 || filteredDataSet[i-1][this.featureKeyIndex] !== temp){
        rowCount++;
        subIndex = 0;
        tracesGroupedByFeature[rowCount] = [];
     }

     tracesGroupedByFeature[rowCount][subIndex] = [];

     for(let j=0; j<filteredDataSet[i].length; j++){
      tracesGroupedByFeature[rowCount][subIndex].push(filteredDataSet[i][j]);
     }
     subIndex++;
    }
    //----------------------------------------------------------------------------

    //GET ALL FEATURE KEYS
    //----------------------------------------------------------------------------
    this.labels = [];
    for(let i=0; i<tracesGroupedByFeature.length; i++){
      this.labels.push(tracesGroupedByFeature[i][0][this.featureKeyIndex].split("step:0_iter:0_"));
    }
    //----------------------------------------------------------------------------

    //GENERATE DATA SERIES
    //----------------------------------------------------------------------------
    for(let i=0; i<tracesGroupedByFeature.length; i++){
      for(let j=0; j<tracesGroupedByFeature[i].length; j++){

        if(j == 0){ this.dataSeries[i] = []; }

        //Transform datasets into object notation (must be in this notation for scatterplot)
        this.dataSeries[i].push(Number(tracesGroupedByFeature[i][j][this.sensorValueIndex]));

      }
    }
    //----------------------------------------------------------------------------

    //GET MAX LENGTH
    //----------------------------------------------------------------------------
    let max;
    for(let i=0; i<this.dataSeries.length-1; i++){

      max = Math.max(this.dataSeries[i].length, this.dataSeries[i+1].length);

    }
    //----------------------------------------------------------------------------


    //TRANSFORM DATA
    //----------------------------------------------------------------------------
    this.datasets = [];
    let temp, isBadData;
    

    for(let i=0; i<max; i++){
      temp = [];
      isBadData = false;

      for(let j = 0; j<this.dataSeries.length; j++){
        if(this.dataSeries[j].length < i){
          temp.push(null); 
        }
        else{ 

          //check if there is a normalized value greater than 5 std. dev.
          if(this.dataSeries[j][i] > 5 || this.dataSeries[j][i] < -5){
            isBadData = true;
          }
          temp.push(this.dataSeries[j][i]); 
        }
      }

        if(i < 10 && !isBadData){
          this.datasets.push({
              data: temp,
              fill: false,
              showLine: false,
              pointStyle: 'rectRot',
              radius: 7,
              pointRadius: 7,
              pointHoverRadius: 10
        });
        }
  }
    //----------------------------------------------------------------------------
  }

    // events
  public chartClicked(e:any):void {
    console.log(e);
  }
 
  public chartHover(e:any):void {
    console.log(e);
  }
}
