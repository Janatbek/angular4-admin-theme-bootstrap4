import { Component, OnInit, Input } from '@angular/core';
import { Params } from '@angular/router';

import { EngWebApiService } from 'app/common/services/EngWebApiService';
import { AppStateService } from 'app/common/services/AppStateService';
import { DisplayStateService } from 'app/common/services/DisplayStateService';
import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';
import { WidgetConfiguration, DataConsumerConfiguration } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-widget-admin',
  templateUrl: './widget-admin.component.html',
  styleUrls: ['./widget-admin.component.css']
})
export class WidgetAdminComponent extends BaseWidget {

  widgetConfigList: WidgetConfiguration[];
  selectedWidgetConfig: WidgetConfiguration;

  onInitialize() {

    this.engWebApiService.GetConfig<WidgetConfiguration[]>('WidgetConfigurationList').subscribe(
            x => {
                this.widgetConfigList = x;
                if (this.widgetConfigList.length > 0) {
                  this.SelectWidget(this.widgetConfigList[0]);
                }
            },
            error => this.appStateService.appendLog('LoadWidgetConfigList ERROR: ' + JSON.stringify(error), 1));
  }

  onNewMessage(messageParams: Params) {
    if (messageParams['widgetName'] !== undefined && this.widgetConfigList !== undefined) {
      const matchingWidget = this.widgetConfigList.find(wc => wc.name === messageParams['widgetName']);
      if (matchingWidget !== undefined) {
        this.SelectWidget(matchingWidget);
      }
    }
  }

  isSelected(wc: WidgetConfiguration) {
    return (wc.name == this.selectedWidgetConfig.name) ? 'active' : '';
  }

  AddWidget() {
    this.widgetConfigList.push(
      {
        name: 'New Widget',
        description: 'Enter description here',
        supportMessage:  'Enter support message here',
        componentType: 'Name that will be used in platform to refer to this widget',
        config: {},
        dataConsumerConfiguration: {
          dataPolicy: '',
          fixedParameters: [],
          sortColumns: [],
          contextParameters: [],
          filterConfiguration: [],
          overrideCacheRules: {period: undefined },
          dataGrouping: undefined
        },
        contextMatchingRules: []
      }
    );

    this.SelectWidget(this.widgetConfigList[this.widgetConfigList.length - 1]);
  }

  onSelectChange() {
    if (this.selectedWidgetConfig.dataConsumerConfiguration.fixedParameters === undefined) {
      this.selectedWidgetConfig.dataConsumerConfiguration.fixedParameters = [];
    }
    if (this.selectedWidgetConfig.dataConsumerConfiguration.contextParameters === undefined) {
      this.selectedWidgetConfig.dataConsumerConfiguration.contextParameters = [];
    }
    if (this.selectedWidgetConfig.dataConsumerConfiguration.filterConfiguration === undefined) {
      this.selectedWidgetConfig.dataConsumerConfiguration.filterConfiguration = [];
    }


     const messageParams: Params = [];
    messageParams['dataPolicy'] = this.selectedWidgetConfig.dataConsumerConfiguration.dataPolicy;
    this.displayStateService.MessageHouse.next(messageParams);
  }

  SelectWidget(wc: WidgetConfiguration) {

    if (wc.dataConsumerConfiguration.fixedParameters === undefined) {
      wc.dataConsumerConfiguration.fixedParameters = [];
    }
    if (wc.dataConsumerConfiguration.contextParameters === undefined) {
      wc.dataConsumerConfiguration.contextParameters = [];
    }
    if (wc.dataConsumerConfiguration.filterConfiguration === undefined) {
      wc.dataConsumerConfiguration.filterConfiguration = [];
    }


    this.selectedWidgetConfig = wc;

     const messageParams: Params = [];
    messageParams['dataPolicy'] = wc.dataConsumerConfiguration.dataPolicy;
    this.displayStateService.MessageHouse.next(messageParams);
  }
}
