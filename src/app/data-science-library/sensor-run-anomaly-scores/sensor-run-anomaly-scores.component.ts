import { Params } from '@angular/router';
import { Component } from '@angular/core';


import { UtilityFunctions } from 'app/common/classes/UtilityFunctions';
import { AppDisplayState } from 'app/common/interfaces/DisplayInterfaces';
import { GenericTableConfiguration, NameValue } from 'app/common/interfaces/WidgetInterfaces';
import { GenericBaseComponent } from 'app/WidgetLibraryModule/generic-base/generic-base.component';

@Component({
  selector: 'app-sensor-run-anomaly-scores',
  templateUrl: './sensor-run-anomaly-scores.component.html',
  styleUrls: ['./sensor-run-anomaly-scores.component.css']
})
export class SensorRunAnomalyScoresComponent extends GenericBaseComponent {

  dataSetColors: string[][] = [];
  filteredIndexes: number[];

  // Override to highlight rows that pass filtering instead of removing those that don't
  HandleFilters() {
    super.HandleFilters();
    // if (this.originalDataSet) {
    //   this.dataSet = this.originalDataSet;
    //   const localFilteredIndexes = DataSetFilter.GetFilteredIndexes(
    //     this.originalDataSet,
    //     this.Config.dataConsumerConfiguration.filterConfiguration,
    //     [],
    //     this.displayStateService.appState.current.filters);

    //   if (localFilteredIndexes.length < this.originalDataSet.data.length){
    //     this.filteredIndexes = localFilteredIndexes;
    //     console.log(`GenericTableComponent.ApplyFilters: indexes = ${JSON.stringify(this.filteredIndexes)}`);
    //   } else {
    //     this.filteredIndexes = [];
    //   }
    // }
  }

  PostProcessing() {

    console.log(this.displayDataSet);

    const tableConfig = this.Config.config as GenericTableConfiguration;

    if (tableConfig !== undefined)  {
      const tempColors: string[][] = this.displayDataSet.data.map(x => {return x.slice(); }  );

      this.displayDataSet.columns.forEach( (colName, colIdx) => {
        const rule = tableConfig.tableColumnRules.find( r => r.columnName === colName);
        if (rule !== undefined) {
          if (rule.alternateColorOnValueChange !== undefined && rule.alternateColorOnValueChange === true) {
            let  curColor = '#CCCCCC';
            for (let row = 0; row < this.displayDataSet.data.length; row++) {
              if (row === 0 || this.displayDataSet.data[row - 1][colIdx] !== this.displayDataSet.data[row][colIdx]) {
                curColor = curColor === '#EEEEEE' ? '#FBFBFB' : '#EEEEEE';
              }
              tempColors[row][colIdx] = curColor;
            }
          } else if (rule.heatmapRules !== undefined) {
            if (rule.heatmapRules.low === 'min' || rule.heatmapRules.low === 'max') {

                const min = this.displayDataSet.data.reduce<number>(
                  (p, c) => {
                    return p > Number(c[colIdx]) ? Number(c[colIdx]) : p;
                  }, Number.MAX_VALUE );
                const max = this.displayDataSet.data.reduce<number>(
                  (p, c) => {
                    return p < Number(c[colIdx]) ? Number(c[colIdx]) : p;
                  }, Number.MIN_VALUE );
                for (let row = 0; row < this.displayDataSet.data.length; row++) {
                     const rank =
                      (Number(this.displayDataSet.data[row][colIdx]) - min) /
                      (max - min);

                      //This condition is met if the max and min anomaly scores are the same
                      if(Number.isNaN(rank)){
                        tempColors[row][colIdx] = '';
                      } else {

                        let category = Math.round(rank * 16);  // betwen 0 and 16
                        if (rule.heatmapRules.low === 'max') {
                          category = 16 - category;
                        }
                        tempColors[row][colIdx] = category.toString();

                        if (category <= 7) {
                          category += 8;
                          const hex = category.toString(16);
                          tempColors[row][colIdx] =  `#${hex}0FF${hex}0`;
                        } else {
                            category = 22 - category;
                            const hex = category.toString(16);
                            tempColors[row][colIdx] =  `#FF${hex}0${hex}0`;
                        }

                      }
                    }

                    //UtilityFunctions.DebugLog(JSON.stringify(tempColors));
            } else {
              for (let row = 0; row < this.displayDataSet.data.length; row++) {
                tempColors[row][colIdx] = '';
              }
            }
          } else {
            for (let row = 0; row < this.displayDataSet.data.length; row++) {
              tempColors[row][colIdx] = '';
            }
          }
        } else {
          for (let row = 0; row < this.displayDataSet.data.length; row++) {
            tempColors[row][colIdx] = '';
          }
        }
      });

      this.dataSetColors = [... tempColors];

    } else {
      this.dataSetColors = [];
    }
  }

  GetColorStyle(row: number, col: number): string {
    // console.log(`row: ${row}, col: ${col} this.dataSetColors[row] = ${this.dataSetColors[row]}`);
      if (this.dataSetColors.length !== 0 && this.dataSetColors[row][col] !== '') {
        // console.log('.');
        return this.dataSetColors[row][col];
      } else {
        // console.log('!');
        return '';
      }
  }

  OnRadioClick(e: any, row: number) {
    console.log(this.dataSetColors[row]);

    for (let j = 0; j < this.dataSetColors.length; j++) {

      if (j !== row) {
        for(let i = 0; i < this.dataSetColors[row].length; i++) {
          this.dataSetColors[j][i] = '#ffffff';
        }
      } else {
        for(let i = 0; i < this.dataSetColors[row].length; i++) {
          this.dataSetColors[row][i] = '#4286f4';
        }
      }
    }

     const newContext: Params = [];
    newContext['runID'] = this.displayDataSet.data[row][this.displayDataSet.columns.indexOf('run_id') === -1 ? this.displayDataSet.columns.indexOf('RUN_ID') : this.displayDataSet.columns.indexOf('run_id')];

    this.displayStateService.AddContextList(newContext);

  }

  SetSort(colName: string, sortExpression: string) {
    const p: Params[] = [];
    p[colName] = sortExpression;
    this.displayStateService.SetSorts(p);
  }

  filtered(idx: number): boolean {
    return false;
    // return this.filteredIndexes.indexOf(idx) > -1;
  }
}
