import { DataSetFilter } from '../../../common/classes/DataSetFilter';

import { Params } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';

import { DataConsumerConfiguration } from 'app/common/interfaces/WidgetInterfaces';
import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';
import { DataPolicy, NameValue } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-data-consumer-config-editor',
  templateUrl: './data-consumer-config-editor.component.html',
  styleUrls: ['./data-consumer-config-editor.component.css']
})
export class DataConsumerConfigEditorComponent extends BaseWidget  {

  @Input() DataConsumerConfig: DataConsumerConfiguration;

  dataPolicyNames: string[] = [];

  sortTypes = ['asc', 'desc'];

  filterOps = DataSetFilter.FilterOperationMap();

  onInitialize() {
    this.engWebApiService.GetConfig<DataPolicy[]>('DataPolicyList').subscribe(x => {
      this.dataPolicyNames = x.map(dp => {return dp.name; });
    });
    this.dataPolicyNames.push('');
  }

  DeleteFilterConfigByIndex(idx) {
    this.DataConsumerConfig.filterConfiguration.splice(idx, 1);
  }

  AddFilterConfig() {
    this.DataConsumerConfig.filterConfiguration.push({column: '', contextValueName: '', operator: '', serverSide: false, value: '' });
  }

}
