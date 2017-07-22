import { GenericChartConfiguration } from '../../common/interfaces/WidgetInterfaces';
import { TestingCompilerFactoryImpl, TestingCompilerImpl } from '@angular/compiler/testing';
import { BaseManagedDataWidget } from '../../common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';
import { Component, OnInit, Input} from '@angular/core';
import { Params } from '@angular/router';
import { WidgetConfiguration } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-anomolies-statistics-summary',
  templateUrl: './anomolies-statistics-summary.component.html',
  styleUrls: ['./anomolies-statistics-summary.component.css']
})
export class AnomoliesStatisticsSummaryComponent extends BaseManagedDataWidget {

  isAnomalyIndex: number;
  travelerStepIndex: number;
  runCountIndex: number;

  anomalousDataSet: number[];
  normalDataSet: number[];

  filterColumns: string[] = [];

  public barChartData: any[];
  public barChartLabels;
  public barChartType = 'bar';
  public barChartLegend = true;

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        type: 'logarithmic',
        display: true,
        gridLines: false,
        ticks: {
          callback: function(value) {
            if(value % 10 === 0 && value.toString()[0] === '1') {
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
         /* callback: function(value) {
            if (value.length > 8) {
              return value.substr(0, 4) + '...';
            } else {
              return value;
            }
          }*/
        }
      }]
    },
    tooltips: {
    /*  enabled: true,
      mode: 'label',
      callbacks: {
        title: function(tooltipItem, data) {
          const idx = tooltipItem[0].index;
          return data.labels[idx];
        },
        label: function (tooltipItems, data) {
          const idx = tooltipItems.index;
          const datasetIdx = tooltipItems[0];

          if (datasetIdx === 0) {
            return '-1: ' + data.datasets[0].data[idx];
          } else {
            //return '1: ' + data.datasets[1].data[idx];
            return datasetIdx;
        }
      }
      }*/
    }
  };

  public barChartColors: Array<any> = [
     {
        backgroundColor: 'rgba(163, 0, 40, .4)',
        borderColor: 'rgba(163, 0, 40, .6)',
        hoverBackgroundColor: 'rgba(163, 0, 40, .2)',
        borderWidth: 2
      },
      {
        backgroundColor: 'rgba(0, 104, 124, .4)',
        borderColor: 'rgba(0, 104, 124, .6)',
        hoverBackgroundColor: 'rgba(0, 104, 124, .2)',
        borderWidth: 2
      }
  ];
 
  // events
  public chartClicked(e: any): void {
    if (e && e.active && e.active[0]) {
      const idx = <string>e.active[0]._index;
      const modifiedLabel = <string>e.active[0]._model.label;
      const tool = this.replaceCommas(modifiedLabel);
      const anomalousString = <string>e.active[0]._model.datasetLabel;
      
      const newContext: Params = [];
      newContext['isAnomaly'] = anomalousString;
      newContext['step'] = tool;

      this.displayStateService.AddContextList(newContext);

    }
  }

  public replaceCommas(str: string): any {

    let temp = '';

    for (let i = 0; i < str.length; i++) {
      if (i !== 0) {
        temp = temp + ' ' + str[i];
      } else {
        temp = temp + str[i];
      }
    }

    return temp;
  }
 
  public chartHovered(e: any): void {
    console.log(e);
  }
 
public update(): void{

}

  public PostProcessing(){

    console.log(this.displayDataSet);


    this.BuildDisplay();

  }

  public BuildDisplay(){

   console.log(this.displayDataSet.columns);

    // Get all indices
    this.isAnomalyIndex = this.displayDataSet.columns.indexOf('is_anomaly') === -1 ? this.displayDataSet.columns.indexOf('IS_ANOMALY') : this.displayDataSet.columns.indexOf('is_anomaly');
    this.runCountIndex = this.displayDataSet.columns.indexOf('run_id_count') === -1 ? this.displayDataSet.columns.indexOf('RUN_ID_COUNT') : this.displayDataSet.columns.indexOf('run_id_count');
    this.travelerStepIndex = this.displayDataSet.columns.indexOf('traveler_step') === -1 ? this.displayDataSet.columns.indexOf('TRAVELER_STEP') : this.displayDataSet.columns.indexOf('traveler_step');

    if(this.travelerStepIndex === -1){
       this.travelerStepIndex = this.displayDataSet.columns.indexOf('tool_name') === -1 ? this.displayDataSet.columns.indexOf('TOOL_NAME') : this.displayDataSet.columns.indexOf('tool_name');
    }

    console.log(this.isAnomalyIndex, this.runCountIndex, this.travelerStepIndex);

    // Sort by traveler step
    const index = this.travelerStepIndex;
    const sortedDataSet = this.displayDataSet.data
       .sort(function(a, b){

         if(a[index] < b[index]){
           return 1;
         }else if(a[index] > b[index]){
          return -1;
         }else{
           return 0;
         }
        });

  // Creating K:V pairs where the key is the traveler step and the value is the count
  // Using two arrays instead of object array so I can use includes() function

  const travelerSteps = [];
  const travelerStepCount = [];
  let travelerStepIndex;

  for(let i = 0; i < sortedDataSet.length; i++){
    if(travelerSteps.includes(sortedDataSet[i][this.travelerStepIndex]) === false){
      travelerSteps.push(sortedDataSet[i][this.travelerStepIndex]);
      travelerStepCount.push(1);
    }else{
      travelerStepIndex = travelerSteps.indexOf(sortedDataSet[i][this.travelerStepIndex]);
      travelerStepCount[travelerStepIndex]++;
    }
  }

  this.anomalousDataSet = [];
  this.normalDataSet = [];
  let offset = 0;

  // construct arrays using null values if there isn't a value for that traveler step
  for (let i = 0; i < travelerStepCount.length; i++) {
    if (travelerStepCount[i] === 2) {
      if (sortedDataSet[i][this.isAnomalyIndex] === '-1'){
        this.anomalousDataSet.push(Number(sortedDataSet[i + offset][this.runCountIndex]));
        offset++;
        this.normalDataSet.push(Number(sortedDataSet[i + offset][this.runCountIndex]));
      } else {
        this.normalDataSet.push(Number(sortedDataSet[i + offset][this.runCountIndex]));
        offset++;
        this.anomalousDataSet.push(Number(sortedDataSet[i + offset][this.runCountIndex]));
      }
    } else {
      if (sortedDataSet[i + offset][this.isAnomalyIndex] === '-1') {
        this.anomalousDataSet.push(Number(sortedDataSet[i + offset][this.runCountIndex]));
        this.normalDataSet.push(null);
      } else {
        this.normalDataSet.push(Number(sortedDataSet[i + offset][this.runCountIndex]));
        this.anomalousDataSet.push(null);
      }
    }
  }

  this.barChartData = [
    {data: this.anomalousDataSet, label: '-1: Anomalous'},
    {data: this.normalDataSet, label: '1: Normal'}
  ];


// Here I am constructing a string array for the label
// if an individual label has an array of values, they
// will be placed on seperate lines

  this.barChartLabels = [];
  let tempLabel = [];

  for (let i = 0; i < travelerSteps.length; i++) {

    const temp = travelerSteps[i].split(' ');
    console.log(temp.length);

    for (let j = 0; j < temp.length; j++) {

      // If this is not the last index of temp AND one of the following is true:
      // The current index's length is greater than 9 OR the following index's 
      // length is greater than 9 (since we know that we will not be able to fit them
      // in the same line)
      if (j < (temp.length - 1) && (temp[j].length >= 9 || temp[j + 1].length >= 9)) {

          // Then simply place this item into the label array
          tempLabel.push(temp[j]);

        // Else, if this is not the last index of temp AND the sum of this and the next
        // index's lengths is less than 9
      } else if (j < (temp.length - 1) && (temp[j].length + temp[j + 1].length) <= 9) {

          // Then concatenate these two strings together
          tempLabel.push(temp[j] + ' ' + temp[j + 1]);

          // We will need to increment j again since the following index has already
          // been handled
          j++;

          // Else, if the length of temp is 1 the string is longer than 9 characters
      } else if (temp.length === 1 && temp[0].length >= 9){

          // Split and hyphenate the string
          const splitAt = temp[j].length / 2;
          tempLabel.push(temp[j].substr(0, splitAt) + '-');
          tempLabel.push(temp[j].substr(splitAt, temp[j].length));

      } else {
          tempLabel.push(temp[j]);
      }
    }
    this.barChartLabels.push(tempLabel);
    tempLabel = [];
  }
  }
}
