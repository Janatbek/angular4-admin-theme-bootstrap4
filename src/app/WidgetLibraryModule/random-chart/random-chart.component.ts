import { Component } from '@angular/core';
import { Params } from '@angular/router';

import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';

@Component({
  selector: 'app-random-chart',
  templateUrl: './random-chart.component.html',
  styleUrls: ['./random-chart.component.css']
})
export class RandomChartComponent extends BaseWidget {

  lineChartData: Array<any>;
  lineChartLabels: Array<any>;
  lineChartColors: Array<any>;
  lineChartLegend = true;
  lineChartType = 'bar';
  lineChartOptions: any;
  seriesCount = Math.random() * 12;
  dataCount = 1 + (Math.random() * 25);

  // events
  public chartClicked(e: any): void {
    // console.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }

  onInitialize() {

    this.StaticSettings()
    this.BuildRandomData();
  }

  StaticSettings() {
    this.lineChartOptions = {
      responsive: true,
    };

    this.lineChartColors = [
      {
        backgroundColor: 'rgba(100,120,200, 0.4)',
        borderColor: 'rgba(0,0,0, 1)',
        HoverBackgroundColor: 'rgba(20,0,10, 1)',
        HoverBorderColor: 'rgba(0,0,0, 1)'
      },
      {
        backgroundColor: 'rgba(100,50,40, 0.0)',
        borderColor: '#884411',
        pointBackgroundColor: '#884433',
        pointBorderColor: '#884433',
        pointHoverBackgroundColor: '#884433',
        pointHoverBorderColor: '#884433'
      },
      {
        backgroundColor: 'rgba(200, 200, 255, 0.0)',
        borderColor: '#0055AA',
        pointBackgroundColor: '#673AB7',
        pointBorderColor: '#AAFFAA',
        pointHoverBackgroundColor: '#673AB7',
        pointHoverBorderColor: '#673AB7'
      }
    ];
  }

  onNewMessage(messageParams: Params) {
    if (messageParams['RandomUpdate'] !== undefined) {
      this.BuildRandomData();
    }
  }

  RefreshClick() {
    this.displayStateService.MessageHouse.next( {'RandomUpdate': ''} );
  }

  BuildRandomData() {
    const _lineChartData: Array<any> = [];

    
    for (let seriesIdx = 0; seriesIdx < this.seriesCount; seriesIdx++) {
      const seriesType = seriesIdx === 0 ? 'bar' : 'line';
      _lineChartData.push({ label: seriesIdx, data: [], type: seriesType, fill: 'true' });
      let lastSeed = Math.random();

      for (let dataIdx = 0; dataIdx < this.dataCount; dataIdx++) {
        _lineChartData[seriesIdx].data.push(lastSeed);
        lastSeed = lastSeed + (Math.random() - 0.5) / 6;
      }
    }

    const _lineChartLabels = [];
    for (let dataIdx = 0; dataIdx < this.dataCount; dataIdx++) {
      _lineChartLabels.push(dataIdx);
    }

    this.lineChartData = _lineChartData;
    this.lineChartLabels = _lineChartLabels;
  }
}
