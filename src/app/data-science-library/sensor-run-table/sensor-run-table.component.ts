import { BaseManagedDataWidget } from '../../common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';
import { Component, OnInit, Input} from '@angular/core';
import { Params } from '@angular/router';
import { WidgetConfiguration } from 'app/common/interfaces/WidgetInterfaces';
import { GenericTableConfiguration } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-sensor-run-table',
  templateUrl: './sensor-run-table.component.html',
  styleUrls: ['./sensor-run-table.component.css']
})
export class SensorRunTableComponent extends BaseManagedDataWidget {




  dataSetColors: string[][] = [];
  filteredIndexes: number[];

  PostProcessing() {

    console.log(this.displayDataSet);

/*
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
*/
    //UtilityFunctions.DebugLog(JSON.stringify(this.dataSetColors, null, 2));
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
