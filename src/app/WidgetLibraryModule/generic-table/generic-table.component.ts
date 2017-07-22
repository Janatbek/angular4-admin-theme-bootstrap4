import { DataRequestError } from '../../common/interfaces/DisplayInterfaces';
import { Params } from '@angular/router/router';
import { Component } from '@angular/core';

import { UtilityFunctions } from 'app/common/classes/UtilityFunctions';
import { AppDisplayState } from 'app/common/interfaces/DisplayInterfaces';
import { GenericTableConfiguration, NameValue } from 'app/common/interfaces/WidgetInterfaces';
import { GenericBaseComponent } from 'app/WidgetLibraryModule/generic-base/generic-base.component';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.css']
})
export class GenericTableComponent extends GenericBaseComponent {

  dataSetColors: string[][] = [];
  filteredIndexes: number[];
  dataRequestError: DataRequestError;

  onManagedDataError(error: DataRequestError) {
    this.dataRequestError = error;
  }

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
    this.dataRequestError = undefined;
    const tableConfig = this.Config.config as GenericTableConfiguration;

    if (tableConfig !== undefined) {
      const tempColors: string[][] = this.displayDataSet.data.map(x => { return x.slice(); });

      this.displayDataSet.columns.forEach((colName, colIdx) => {
        const rule = tableConfig.tableColumnRules.find(r => r.columnName === colName);
        if (rule !== undefined) {
          if (rule.alternateColorOnValueChange !== undefined && rule.alternateColorOnValueChange === true) {
            let curColor = '#CCCCCC';
            for (let row = 0; row < this.displayDataSet.data.length; row++) {
              if (row === 0 || this.displayDataSet.data[row - 1][colIdx] !== this.displayDataSet.data[row][colIdx]) {
                curColor = curColor === '#EEEEEE' ? '#FBFBFB' : '#EEEEEE';
              }
              tempColors[row][colIdx] = curColor;
            }
          } else if (rule.heatmapRules !== undefined && rule.heatmapRules.low && rule.heatmapRules.high) {

            let min: number = undefined;
            let max: number = undefined;

            if (rule.heatmapRules.low === 'min' || rule.heatmapRules.high === 'min') {
              min = this.displayDataSet.data.reduce<number>((p, c) => {
                return p > Number(c[colIdx]) ? Number(c[colIdx]) : p;
              }, Number.MAX_VALUE);
            } else {
              min = Number(rule.heatmapRules.low);
            }
            if (rule.heatmapRules.low === 'max' || rule.heatmapRules.high === 'max') {
              max = this.displayDataSet.data.reduce<number>((p, c) => {
                return p < Number(c[colIdx]) ? Number(c[colIdx]) : p;
              }, Number.MIN_VALUE);
            } else {
              max = Number(rule.heatmapRules.high);
            }
            const reverse = max < min || rule.heatmapRules.low === 'max' || rule.heatmapRules.high === 'min';
            const range = Math.abs(max - min);

            min = max < min ? max : min;
            max = min + range;
            for (let row = 0; row < this.displayDataSet.data.length; row++) {
              let rank =
                (Number(this.displayDataSet.data[row][colIdx]) - min) /
                Math.abs(max - min);

              rank = rank < 0 ? 0 : rank > 1 ? 1 : rank;
              let category = Math.round(rank * 16);  // betwen 0 and 16
              if (reverse) {
                category = 16 - category;
              }
              tempColors[row][colIdx] = category.toString();

              if (category <= 7) {
                category += 8;
                const hex = category.toString(16);
                tempColors[row][colIdx] = `#${hex}0FF${hex}0`;
              } else {
                category = 22 - category;
                const hex = category.toString(16);
                tempColors[row][colIdx] = `#FF${hex}0${hex}0`;
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
      this.dataSetColors = [...tempColors];

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
