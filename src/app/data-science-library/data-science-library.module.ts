// From angular library
import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MdSliderModule } from '@angular/material';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AlertModule } from 'ngx-bootstrap';
import { TabsModule } from 'ngx-bootstrap/tabs';

// From engineering web platform common module
import { CommonAppModule } from 'app/common/CommonAppModule';

// This modules components
import { ExampleWidgetComponent } from './example-widget/example-widget.component';
import { AnomoliesStatisticsSummaryComponent } from './anomolies-statistics-summary/anomolies-statistics-summary.component';

// Other
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';
import { ChartsModule } from 'ng2-charts';
import { AnomaliesTravelerStepComponent } from './anomalies-traveler-step/anomalies-traveler-step.component';
import { AnomaliesRawTraceVsPopulationComponent } from './anomalies-raw-trace-vs-population/anomalies-raw-trace-vs-population.component';
import { AllTracesComponent } from './all-traces/all-traces.component';
import { ReasonKeysComponent } from './reason-keys/reason-keys.component';
import { TestLineChartComponent } from './test-line-chart/test-line-chart.component';
import { SensorRunTableComponent } from './sensor-run-table/sensor-run-table.component';
import { SensorRunAnomalyScoresComponent } from './sensor-run-anomaly-scores/sensor-run-anomaly-scores.component';
import { WisEdlComponent } from './wis-edl/wis-edl.component';
import { AutoSwrComponent } from './auto-swr/auto-swr.component';

import { SelectionComponent } from './selection/selection.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

// ALC - Probably want to add this to some utility module
@Pipe({name: 'setValues'})
export class SetValuesPipe implements PipeTransform {
    transform(value: any, args?: any[]): Object[] {
        return Array.from(value);
    }
}

@Pipe({name: 'mapValues'})
export class MapValuesPipe implements PipeTransform {
    transform(value: any, args?: any[]): Object[] {
        let returnArray = [];

        value.forEach((entryVal, entryKey) => {
            returnArray.push({
                key: entryKey,
                val: entryVal
            });
        });

        return returnArray;
    }
}

/**
 * Params:
 * {list: any[]} - List of objects to be filtered
 * {property: string} - Property of object in list to be filtered on
 * {selected_set: Set<string>} - Set of strings which should kept
 */
@Pipe({name: 'filterListBySet'})
export class FilterListBySetPipe implements PipeTransform {
    transform(list: any[], property: string, selected_set: Set<string>): Object[] {
      if (selected_set.size > 0) {
        return list.filter((item) => selected_set.has(item[property]));
      } else {
        return list;
      }
    }
}

@NgModule({
  imports: [
    CommonModule,
    CommonAppModule,
    Angular2FontawesomeModule,
    ChartsModule,
    FormsModule,
    MdSliderModule,
    TabsModule.forRoot(),
    ReactiveFormsModule,
    NgxDatatableModule,
    BsDropdownModule.forRoot(),
    AlertModule.forRoot()
  ],
  declarations: [
    ExampleWidgetComponent,
    AnomoliesStatisticsSummaryComponent,
    AnomaliesTravelerStepComponent,
    AnomaliesRawTraceVsPopulationComponent,
    AnomaliesRawTraceVsPopulationComponent,
    AllTracesComponent,
    ReasonKeysComponent,
    TestLineChartComponent,
    SensorRunTableComponent,
    SensorRunAnomalyScoresComponent,
    WisEdlComponent,
    SetValuesPipe,
    MapValuesPipe,
    FilterListBySetPipe,
    SelectionComponent,
    AutoSwrComponent
   ],
  exports: [
    ExampleWidgetComponent,
    AnomoliesStatisticsSummaryComponent,
    AnomaliesRawTraceVsPopulationComponent,
    AllTracesComponent,
    ReasonKeysComponent,
    TestLineChartComponent,
    SensorRunTableComponent,
    SensorRunAnomalyScoresComponent,
    WisEdlComponent,
    AutoSwrComponent,
    SelectionComponent
  ]
})
export class DataScienceLibraryModule { }
