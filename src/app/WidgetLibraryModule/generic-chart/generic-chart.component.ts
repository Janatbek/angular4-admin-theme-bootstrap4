import { DataRequestError } from '../../common/interfaces/DisplayInterfaces';

import { Params } from '@angular/router/router';
import { BaseChartDirective } from 'ng2-charts/charts/charts';
import { Component, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartOptions, ChartDataSets, ChartTooltipItem  } from 'app/common/interfaces/chartJs.d';

import {
    GenericChartConfiguration,
    GenericFullChartConfiguration,
    SeriesConfig,
    WidgetConfiguration
} from '../../common/interfaces/WidgetInterfaces';

import { GenericBaseComponent } from 'app/WidgetLibraryModule/generic-base/generic-base.component';
import { UtilityFunctions } from 'app/common/classes/UtilityFunctions';

@Component({
  selector: 'app-generic-chart',
  templateUrl: './generic-chart.component.html',
  styleUrls: ['./generic-chart.component.css']
})
export class GenericChartComponent extends GenericBaseComponent {

  @ViewChild(BaseChartDirective) private _chart;

  errorMessage: string = undefined;
  dataSets: Array<any>;
  labels: Array<any>;
  colors: Array<any>;
  legend = true;
  chartType = 'bar';
  options: any;
  filterColumns: string[] = [];

  colorPallete = [
    'rgba(77,77,77,0.5)', 'rgba(93,165,218,0.5)', 'rgba(250,164,58, 0.5)', 'rgba(96,189,104,0.5)', 'rgba(241,124,176,0.5)',
    'rgba(178,145,47, 0.5)', 'rgba(178,118,178, 0.5)', 'rgba(222,207,63, 0.5)', 'rgba(241,88,84, 0.5)'

     ];

  dataRequestError: DataRequestError;

  onManagedDataError(error: DataRequestError) {
    this.dataRequestError = error;
  }

  PostProcessing() {
    this.dataRequestError = undefined;
    this.BuildChart();
  }

  // events
  public chartClicked(e: any): void {

    console.log(e);
    // const chart = this._chart.chart;
    // const elements = chart.getElementsAtEvent(e.event);
    // console.log(elements);

    if (e && e.active && e.active[0]) {
      const idx = <string>e.active[0]._index;
      const label = <string>e.active[0]._model.label;
      console.log(`clicked on index ${idx} for label ${label}`);

      const chartConfig = this.Config.config as GenericChartConfiguration;
      if (chartConfig !== undefined) {
        const labelNames = chartConfig.labelSources;

        const labelValues = this.filterColumns.map(x => this.displayDataSet.data[idx][this.displayDataSet.columns.indexOf(x)] );

        const filterParams = this.filterColumns
          .reduce<Params>((p, c, i) => {p[c] = labelValues[i]; return p; }, []);
        this.displayStateService.AddFilters(filterParams);

      }
    }
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }

  ChartComplete() {

  }

  BuildChart() {
    const chartConfig = <GenericChartConfiguration>this.Config.config;
    if (chartConfig.labelSources !== undefined)  {
      this.BuildChartFromGenericConfiguration(chartConfig);
    } else {
        const fullChartConfig  = <GenericFullChartConfiguration>this.Config.config;
        if (fullChartConfig.chartConfig !== undefined)  {
            this.BuildChartFromFullConfiguration(fullChartConfig);
        } else {
          // ERROR!!!
          this.errorMessage = 'Unable to determine widget chart configuration - cannot create chart!'
        }
    }

  }
  BuildChartFromFullConfiguration(fullChartConfig: GenericFullChartConfiguration) {

    if (fullChartConfig.chartConfig.type) {
      this.chartType = fullChartConfig.chartConfig.type;
    }
    const _colors: Array<any> = [];
    const _labels: string[] = [];

    const chartData: ChartData =
      fullChartConfig.chartConfig && fullChartConfig.chartConfig.data  ?
        fullChartConfig.chartConfig.data :
         {};

    const _dataSets: Array<ChartDataSets> =
      chartData.datasets ?
        chartData.datasets : [];

    if (chartData && chartData.labels) {
      for (let dataIdx = 0; dataIdx < this.displayDataSet.data.length; dataIdx++) {
        _labels.push(
          chartData.labels
            .map( c => this.displayDataSet.data[dataIdx][this.displayDataSet.columns.indexOf(c) ])
            .join(','));
      }
    }

    let _options: ChartOptions = {};

    if (fullChartConfig.chartConfig.options) {
      _options = fullChartConfig.chartConfig.options;
    }

    if (_options.responsive === undefined) { _options.responsive = true; }
    if (_options.animation === undefined) { _options.animation = {}; }
    if (_options.animation.duration === undefined) { _options.animation.duration = 0; }

    _options.onClick = e => {
      console.log(e);
    };

    _options.animation.onComplete = () => {
      const chartElement = <any>document.getElementById('myChart');
      if (chartElement) {
        const dataUrl =  chartElement.toDataURL();
        // console.log("!!!chart completed. " + dataUrl);
        (<any>document.getElementById('canvas_link')).href = dataUrl;
      }
    };

    if (fullChartConfig.xTickLabels) {
      if (_options.scales === undefined) { _options.scales = {}; }
      if (_options.scales.xAxes === undefined) { _options.scales.xAxes = []; }
      if (_options.scales.xAxes.length === 0 ) { _options.scales.xAxes.push({}); }
      _options.scales.xAxes.forEach( xAxis => {
        if (xAxis.ticks === undefined) { xAxis.ticks = {}; }
        xAxis.ticks.callback = (value, index, values) : string => {

          const idx = fullChartConfig.xTickLabels.findIndex(l => l === value.toString());
          if (idx > -1) {
            return fullChartConfig.xTickLabels[idx];
          } else {
            return '';
          }
        };
      });
    }

    if (fullChartConfig.yTickLabels) {
      if (_options.scales === undefined) { _options.scales = {}; }
      if (_options.scales.yAxes === undefined) { _options.scales.yAxes = []; }
      if (_options.scales.yAxes.length === 0 ) { _options.scales.yAxes.push({}); }
      _options.scales.yAxes.forEach( yAxis => {
        if (yAxis.ticks === undefined) { yAxis.ticks = {}; }
        yAxis.ticks.callback = (value, index, values) : string => {

          const idx = fullChartConfig.yTickLabels.findIndex(l => l === value.toString());
          if (idx > -1) {
            return fullChartConfig.yTickLabels[idx];
          } else {
            return '';
          }
        };
      });
    }

    if (fullChartConfig.xAxisLabelColumns.length > 0) {
    for (let dataIdx = 0; dataIdx < this.displayDataSet.data.length; dataIdx++) {
      _labels.push(
          fullChartConfig.xAxisLabelColumns
            .map( c => this.displayDataSet.data[dataIdx][this.displayDataSet.columns.indexOf(c) ])
            .join(','));
      }
    }

    let dataSetIndex = 0;
    let colorPalleteIndex = 0;
    if (chartData.datasets === undefined) { chartData.datasets = []; }

    fullChartConfig.seriesGroups.forEach(sg => {

      sg.series.forEach(series => {
        if (_dataSets.length - 1 < dataSetIndex) {
          _dataSets.push({});
        } else {
          _colors.push(_dataSets[dataSetIndex]);
        }

        if (_dataSets[dataSetIndex].label === undefined) { _dataSets[dataSetIndex].label = series.name; }
        if (_dataSets[dataSetIndex].type === undefined) { _dataSets[dataSetIndex].type = series.type; }
        if (_dataSets[dataSetIndex].fill === undefined) { _dataSets[dataSetIndex].fill = false; }

        if (this.chartType !== 'scatter') {
          _dataSets[dataSetIndex].data =
            this.displayDataSet.data.map(row => Number(row[this.displayDataSet.columns.indexOf(series.sourceColumn)]));

        } else {
          _dataSets[dataSetIndex].data =
            this.displayDataSet.data.map(row => {
              return {
                x: Number(row[this.displayDataSet.columns.indexOf(series.sourceColumn)]),
                y: Number(row[this.displayDataSet.columns.indexOf(series.sourceColumnY)])
              };
            }
            );
        }

        dataSetIndex++;

        // _colors.push({
        //     borderColor: this.colorPallete[colorPalleteIndex],
        //     backgroundColor: this.colorPallete[colorPalleteIndex++]
        //   }) ;

        if (colorPalleteIndex > this.colorPallete.length - 1) {
          colorPalleteIndex = 0;
        }
      });
    });

    if (fullChartConfig.pointLabelColumns && fullChartConfig.pointLabelColumns.length > 0) {
      if (_options.tooltips === undefined) {
        _options.tooltips = {};
      }
      if (_options.tooltips.callbacks === undefined) {
        _options.tooltips.callbacks = {};
      }
        _options.tooltips.callbacks.title = (item?: ChartTooltipItem[], data?: any) => {
          return fullChartConfig.pointLabelColumns
            .map(col => col + ' = ' +  this.displayDataSet.data[item[0].index][this.displayDataSet.columns.indexOf(col)] );
        }
    }

    this.filterColumns = fullChartConfig.filterColumns;
    this.dataSets = _dataSets;
    this.labels = _labels;
    this.options = _options;
    this.colors = _colors;

    setTimeout(() => {
            (<any>this._chart).refresh();
        }, 10);
  }

  BuildChartFromGenericConfiguration(chartConfig: GenericChartConfiguration) {
    if (chartConfig !== undefined)  {

      this.filterColumns = chartConfig.labelSources.filter (nv => nv.value === 'filter').map(nv => nv.name);

      const _dataSets: Array<any> = [];
      const _colors: Array<any> = [];
      const _labels = [];
      const _options: any = {
        scales: { yAxes: [] },
        responsive: true,
        animation: {
          duration: 0,
          onComplete: () => {
            const chartElement = <any>document.getElementById('myChart');
            if (chartElement) {
              const dataUrl =  chartElement.toDataURL();
              // console.log("!!!chart completed. " + dataUrl);
              (<any>document.getElementById('canvas_link')).href = dataUrl;
            }
          }}};

      if (chartConfig.labelSources !== undefined && chartConfig.labelSources.length > 0) {
        for (let dataIdx = 0; dataIdx < this.displayDataSet.data.length; dataIdx++) {
          _labels.push(
            chartConfig.labelSources.map(nv => nv.name)
            .map( c => this.displayDataSet.data[dataIdx][this.displayDataSet.columns.indexOf(c) ])
            .join(','));
        }
      }

      let colorPalleteIndex = 0;

      chartConfig.seriesGroups.forEach(sg => {

          _options.scales.yAxes.push(
            {
              id: sg.id,
              position: sg.scalePosition,
              scaleLabel: {display: true, labelString: sg.id},
              ticks: {min: 0}
            });

          sg.series.forEach(series => {
            _dataSets.push(
                {
                  label: series.name,
                  data: this.displayDataSet.data.map(row => Number(row[this.displayDataSet.columns.indexOf(series.sourceColumn)])),
                  type: series.type,
                  fill: false,
                  yAxisID: sg.id
                }
            );
            _colors.push({
                borderColor: this.colorPallete[colorPalleteIndex],
                backgroundColor: this.colorPallete[colorPalleteIndex++]
              }) ;

            if (colorPalleteIndex > this.colorPallete.length - 1) {
              colorPalleteIndex = 0;
            }
          });
      });

      // UtilityFunctions.DebugLog('_colors: ' + JSON.stringify(_colors));

      this.dataSets = _dataSets;
      this.labels = _labels;
      this.options = _options;
      // this.colors = _colors;

      this.colors = [
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
          // backgroundColor: '#rgba(0.0.0, 0.1)',
          // borderColor: '#rgba(40,40,40, 0.1)',
          // pointBackgroundColor: '#rgba(80,80,80, 0.1)',
          // pointBorderColor: '#rgba(120,120,120, 0.1)',
          // pointHoverBackgroundColor: '#rgba(160,160,160, 0.1)',
          // pointHoverBorderColor: '#rgba(200,200,200, 0.1)'

          backgroundColor: 'rgba(200, 200, 255, 0.0)',
          borderColor: '#0055AA',
          pointBackgroundColor: '#673AB7',
          pointBorderColor: '#AAFFAA',
          pointHoverBackgroundColor: '#673AB7',
          pointHoverBorderColor: '#673AB7'
        }
      ];

      setTimeout(() => {
            (<any>this._chart).refresh();
        }, 10);
    }
  }

}
