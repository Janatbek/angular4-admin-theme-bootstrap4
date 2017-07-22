
import { Component, OnInit } from '@angular/core';
import { Params } from '@angular/router';

import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';
import { Events } from 'app/common/services/DisplayStateService';
import { Guid } from 'app/common/classes/Guid';

import { SideNavWidgetConfig } from 'app/common/interfaces/DisplayInterfaces';
import { NameValue, WidgetConfiguration, DataPolicy } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-master-configuration',
  templateUrl: './master-configuration.component.html',
  styleUrls: ['./master-configuration.component.css']
})
export class MasterConfigurationComponent extends BaseWidget {

  // Master lists
  dataPolicyList: DataPolicy[];
  widgetConfigurationList: WidgetConfiguration[];
  sideNavWidgetConfig: SideNavWidgetConfig;

  // Filtered Lists
  filteredDataPolicyList: DataPolicy[];
  filteredWidgetConfigurationList: WidgetConfiguration[];
  filteredSideNavWidgetConfig: SideNavWidgetConfig;

  // Selected Items
  selectedDataPolicy: DataPolicy;
  selectedWidgetConfiguration: WidgetConfiguration;
  selectedSideNav: NameValue;

  sideNavListCollapsed = false;
  widgetConfigListCollapsed = false;
  dataPolicyListCollapsed = false;
  // Unique identifer for this widget instance
  guid: Guid;

  filter = '';

  onLocalFilterChange(newValue: string) {
    this.displayStateService.AddFilter('configSearch', newValue)
  }

  onFiltersChanged(currentFilters: Params) {
    const found = Object.keys(currentFilters).find(k => k === 'configSearch');
    if (found !== undefined) {
      this.filter = currentFilters['configSearch'].toLowerCase();
    } else {
      this.filter = '';
    }
    this.ApplyFilter();
  }

  ApplyFilter() {
    this.filteredDataPolicyList =
      this.dataPolicyList.filter(dp => dp.name.toLowerCase().indexOf(this.filter) > -1);
    this.filteredSideNavWidgetConfig.widgetNameList =
      this.sideNavWidgetConfig.widgetNameList.filter(n => n.name.toLowerCase().indexOf(this.filter) > -1);
    this.filteredWidgetConfigurationList =
      this.widgetConfigurationList.filter(wc => wc.name.toLowerCase().indexOf(this.filter) > -1);
  }

  onInitialize() {
    this.guid = Guid.newGuid();
    this.InitializeSideNav();
    this.InitializeWidgetConfig();
    this.InitializeDataPolicy();
  }

  onStateChanged(eventName: string) {
    // If this widget is displayed right when the app starts, the display state service may not have gotten all its config retrieved
    if (eventName === Events.SIDE_NAV_CHANGED) {
      this.InitializeSideNav();
    } else if (eventName === Events.WIDGET_CONFIG_LIST_CHANGED) {
      this.InitializeWidgetConfig();
    }
  }

  toggleCollapse(initial: string) {
    if (initial.toLowerCase() === 's') {
      return this.sideNavListCollapsed = !this.sideNavListCollapsed;
    } else if (initial.toLowerCase() === 'w') {
      return this.widgetConfigListCollapsed = !this.widgetConfigListCollapsed;
    } else if (initial.toLowerCase() === 'd') {
      return this.dataPolicyListCollapsed = !this.dataPolicyListCollapsed;
    }
  }

  isCollapsed(initial: string): boolean {
    if (initial.toLowerCase() === 's') {
      return this.sideNavListCollapsed;
    } else if (initial.toLowerCase() === 'w') {
      return this.widgetConfigListCollapsed;
    } else if (initial.toLowerCase() === 'd') {
      return this.dataPolicyListCollapsed;
    }
  }

  InitializeSideNav() {
    if (this.displayStateService.appState === undefined) { return; }
    if (this.displayStateService.appState.sideNavWidgetConfig === undefined) { return; }
    const json = JSON.stringify(this.displayStateService.appState.sideNavWidgetConfig);
    this.sideNavWidgetConfig = JSON.parse(json);
    this.filteredSideNavWidgetConfig = JSON.parse(json);
    this.Select('SideNav', this.sideNavWidgetConfig.widgetNameList[0].name);
  }

  InitializeWidgetConfig() {
    if (this.displayStateService.appState === undefined) { return; }
    if (this.displayStateService.appState.widgetConfigList === undefined) { return; }

    const json = JSON.stringify(this.displayStateService.appState.widgetConfigList)
    this.widgetConfigurationList = JSON.parse(json);
    this.filteredWidgetConfigurationList = JSON.parse(json);
  }

  InitializeDataPolicy() {
    this.engWebApiService.GetConfig<DataPolicy[]>('DataPolicyList').subscribe(x => {

      const json = JSON.stringify(x);
      this.filteredDataPolicyList = JSON.parse(json);
      this.dataPolicyList = JSON.parse(json);
      this.onFiltersChanged(this.displayStateService.appState.current.filters);
    });
  }

  Ready() {
    return this.dataPolicyList !== undefined &&
      this.widgetConfigurationList !== undefined &&
      this.sideNavWidgetConfig !== undefined;
  }

  IsActive(typeName: string, itemName: string) {
    if (!this.IsSelected(typeName, itemName)) {
      return '';
    } else {
      if (typeName === 'SideNav') { return 'list-group-item-success'; }
      if (typeName === 'WidgetConfiguration') { return 'list-group-item-info'; }
      if (typeName === 'DataPolicy') { return 'list-group-item-warning'; }
      return '';
    }
  }

  IsSelected(typeName: string, itemName: string): boolean {
    if (!this.Ready()) { return false; }
    if (typeName === 'SideNav') { return this.selectedSideNav && this.selectedSideNav.name === itemName; }
    if (typeName === 'WidgetConfiguration') { return this.selectedWidgetConfiguration && this.selectedWidgetConfiguration.name === itemName; }
    if (typeName === 'DataPolicy') { return this.selectedDataPolicy && this.selectedDataPolicy.name === itemName; }
    return false;
  }

  Add(typeName: string) {
    if (typeName === 'DataPolicy') { this.AddPolicy(); }
    if (typeName === 'WidgetConfiguration') { this.AddWidgetConfiguration(); }
    this.ApplyFilter();
  }


  private up(sourceArray: any[], filteridx: number, sourceKeys: any[], filterKeys: any[]) {

    const srcIdx = sourceKeys.findIndex(si => si === filterKeys[filteridx]);
    if (srcIdx > 0 && sourceArray.length > 1) {
      this.swap(sourceArray, srcIdx, srcIdx - 1);
    }

  }

  private down(sourceArray: any[], filteridx: number, sourceKeys: any[], filterKeys: any[]) {
    const srcIdx = sourceKeys.findIndex(si => si === filterKeys[filteridx]);
    if (srcIdx < sourceArray.length - 1) {
      this.swap(sourceArray, srcIdx, srcIdx + 1);
    }
  }

  private swap(array: any[], idx1: number, idx2: number) {
    const temp = array[idx1];
    array[idx1] = array[idx2];
    array[idx2] = temp;
  }

  Remove(typeName: string, itemName: string) {
    if (typeName === 'SideNav') {
      this.sideNavWidgetConfig.widgetNameList.splice(this.sideNavWidgetConfig.widgetNameList.findIndex(x => x.name === itemName), 1);
    }
    if (typeName === 'DataPolicy') {
      this.dataPolicyList.splice(this.dataPolicyList.findIndex(x => x.name === itemName), 1);
    }
    if (typeName === 'WidgetConfiguration') {
      this.widgetConfigurationList.splice(this.widgetConfigurationList.findIndex(x => x.name === itemName), 1);
    }
    this.ApplyFilter();
  }

  MoveUp(typeName: string, idx: number) {
    if (typeName === 'SideNav') {
        this.up(
          this.sideNavWidgetConfig.widgetNameList,
          idx,
          this.sideNavWidgetConfig.widgetNameList,
          this.filteredSideNavWidgetConfig.widgetNameList);
    } else if (typeName === 'DataPolicy') {
      this.up(
        this.dataPolicyList,
        idx,
        this.dataPolicyList.map( l => l.name),
        this.filteredDataPolicyList.map( l => l.name));
    } else if (typeName === 'WidgetConfiguration') {
      this.up(this.widgetConfigurationList,
        idx,
       this.widgetConfigurationList.map (wc => wc.name),
      this.filteredWidgetConfigurationList.map (wc => wc.name));
    }
    this.ApplyFilter();
  }

  MoveDown(typeName: string, idx: number) {
    if (typeName === 'SideNav') {
        this.down(
          this.sideNavWidgetConfig.widgetNameList,
          idx,
          this.sideNavWidgetConfig.widgetNameList,
          this.filteredSideNavWidgetConfig.widgetNameList);
    } else if (typeName === 'DataPolicy') {
      this.down(
        this.dataPolicyList,
        idx,
        this.dataPolicyList.map( l => l.name),
        this.filteredDataPolicyList.map( l => l.name));
    } else if (typeName === 'WidgetConfiguration') {
      this.down(this.widgetConfigurationList,
        idx,
       this.widgetConfigurationList.map (wc => wc.name),
      this.filteredWidgetConfigurationList.map (wc => wc.name));
    }
    this.ApplyFilter();
  }

  UserSelect(typeName: string, itemName: string) {
    this.selectedDataPolicy = undefined;
    this.selectedWidgetConfiguration = undefined;
    this.selectedSideNav = undefined;

    // if (typeName === 'SideNav')             { this.sideNavListCollapsed = false; this.widgetConfigListCollapsed = false; this.dataPolicyListCollapsed = false; }
    // if (typeName === 'DataPolicy')          { this.sideNavListCollapsed = true;  this.widgetConfigListCollapsed = true;  this.dataPolicyListCollapsed = false; }
    // if (typeName === 'WidgetConfiguration') { this.sideNavListCollapsed = true;  this.widgetConfigListCollapsed = false; this.dataPolicyListCollapsed = false; }

    this.Select(typeName, itemName);
  }

  Select(typeName: string, itemName: string) {

    this.PublishItemSelectedMessage(typeName, itemName);
  }

  PublishItemSelectedMessage(name: string, value: string) {
    const messageParams: Params = [];
    messageParams[`selected.${name}`] = value;
    this.displayStateService.MessageHouse.next(messageParams);
  }

  onNewMessage(msgParams: Params) {
    if (!this.Ready()) { return; }
    if (msgParams['selected.DataPolicy'] !== undefined) {
      this.SetSelectedDataPolicyFromMessage(
        this.dataPolicyList.find(dp => dp.name === msgParams['selected.DataPolicy'])
      );
    } else if (msgParams['selected.SideNav'] !== undefined) {
      this.SetSelectedSideNavFromMessage(
        this.sideNavWidgetConfig.widgetNameList.find(nv => nv.name === msgParams['selected.SideNav'])
      );

    } else if (msgParams['selected.WidgetConfiguration'] !== undefined) {
      this.SetSelectedWidgetConfigFromMessage(
        this.widgetConfigurationList.find(wc => wc.name === msgParams['selected.WidgetConfiguration'])
      );
    }
    this.ApplyFilter();
  }

  SetSelectedSideNavFromMessage(item: NameValue) {
    this.selectedSideNav = item;
    if (this.selectedSideNav !== undefined) {
      this.Select('WidgetConfiguration', this.selectedSideNav.name);
    }
  }

  CloneselectedWidgetConfiguration() {
    if (this.selectedWidgetConfiguration) {
      const copy = <WidgetConfiguration>JSON.parse(JSON.stringify(this.selectedWidgetConfiguration));
      copy.name += ' CLONE';
      this.widgetConfigurationList.push(copy);
      this.Select('WidgetConfiguration', copy.name)
    }
  }

  CloneselectedDataPolicy() {
    if (this.selectedDataPolicy) {
      const copy = <DataPolicy>JSON.parse(JSON.stringify(this.selectedDataPolicy));
      copy.name += ' CLONE';
      this.dataPolicyList.push(copy);
      this.Select('DataPolicy', copy.name);
    }
  }

  SetSelectedWidgetConfigFromMessage(item: WidgetConfiguration) {
    this.selectedWidgetConfiguration = item;
    if (this.selectedWidgetConfiguration !== undefined) {

      if (this.selectedWidgetConfiguration.dataConsumerConfiguration.sortColumns === undefined) {
        this.selectedWidgetConfiguration.dataConsumerConfiguration.sortColumns = [];
      }

      if (this.selectedWidgetConfiguration.dataConsumerConfiguration.overrideCacheRules === undefined) {
        this.selectedWidgetConfiguration.dataConsumerConfiguration.overrideCacheRules = {
          period: ''
        };
      }
      if (this.selectedWidgetConfiguration.dataConsumerConfiguration.dataGrouping === undefined) {
        this.selectedWidgetConfiguration.dataConsumerConfiguration.dataGrouping = {
          serverSide: false,
          groupBy: [],
          aggregations: []
        };
      }

      if (this.selectedWidgetConfiguration.dataConsumerConfiguration.pivot === undefined) {
        this.selectedWidgetConfiguration.dataConsumerConfiguration.pivot = {
          name: '',
          operation: '',
          rename: ''
        };
      }

      if (this.selectedWidgetConfiguration.dataConsumerConfiguration.fixedParameters === undefined) {
        this.selectedWidgetConfiguration.dataConsumerConfiguration.fixedParameters = [];
      }
      if (this.selectedWidgetConfiguration.dataConsumerConfiguration.contextParameters === undefined) {
        this.selectedWidgetConfiguration.dataConsumerConfiguration.contextParameters = [];
      }
      if (this.selectedWidgetConfiguration.dataConsumerConfiguration.filterConfiguration === undefined) {
        this.selectedWidgetConfiguration.dataConsumerConfiguration.filterConfiguration = [];
      }
      if (this.selectedWidgetConfiguration.dataConsumerConfiguration.dataPolicy) {
        this.Select('DataPolicy', this.selectedWidgetConfiguration.dataConsumerConfiguration.dataPolicy);
      }
    }

  }

  SetSelectedDataPolicyFromMessage(item: DataPolicy) {
    this.selectedDataPolicy = item;
    if (this.selectedDataPolicy !== undefined) {
      if (this.selectedDataPolicy.fixedParameters === undefined) {
        this.selectedDataPolicy.fixedParameters = [];
      }

      if (this.selectedDataPolicy.columnRenameMap === undefined) {
        this.selectedDataPolicy.columnRenameMap = [];
      }

    }
  }


  AvailableSideNavWidgetNames(): NameValue[] {
    return this.widgetConfigurationList
      .map(wc => wc.name)
      .filter(name => name === this.selectedSideNav.name ||
        this.sideNavWidgetConfig.widgetNameList.findIndex(nv => nv.name === name) === -1)
      .map<NameValue>(n => { return { name: n, value: n }; });
  }


  CanAddWidgetConfigAsSideNav(wc: WidgetConfiguration): boolean {
    return this.sideNavWidgetConfig !== undefined &&
      this.sideNavWidgetConfig.widgetNameList.findIndex(x => x.name === wc.name) === -1;
  }

  AddWidgetConfigAsSideNav(wc: WidgetConfiguration) {
    this.sideNavWidgetConfig.widgetNameList.push({ name: wc.name, value: wc.name });
  }

  AddWidgetConfiguration() {
    this.widgetConfigurationList.push(
      {
        name: 'New Widget',
        description: 'Enter description here',
        supportMessage: 'Enter support message here',
        componentType: 'Name that will be used in platform to refer to this widget',
        config: {},
        dataConsumerConfiguration: {
          dataPolicy: '',
          fixedParameters: [],
          sortColumns: [],
          contextParameters: [],
          filterConfiguration: [],
          overrideCacheRules: { period: undefined },
          dataGrouping: undefined
        },
        contextMatchingRules: []
      }
    );

    this.Select('WidgetConfiguration', 'New Widget')
  }

  AddPolicy() {
    const newPolicy: DataPolicy = {
      name: '(NEW POLICY)',
      supportMessage: '',
      supportGroup: '',
      supportNameList: '',
      sourceURL: '',
      CacheRules: { period: 'hour', frequency: 2 },
      fixedParameters: [],
      columnRenameMap: []
    };
    this.dataPolicyList.push(newPolicy);
    this.selectedDataPolicy = newPolicy;
    this.Select('DataPolicy', newPolicy.name);
  }

  SaveChangesLocal() {
    this.displayStateService.appState.sideNavWidgetConfig = this.sideNavWidgetConfig;
    this.displayStateService.appState.widgetConfigList = this.widgetConfigurationList;
  }

  SaveChangesGlobal() {
    this.SaveChangesLocal();
    this.engWebApiService.UpdateConfiguration('DataPolicyList', this.dataPolicyList).subscribe(x => { });
    this.engWebApiService.UpdateConfiguration('WidgetConfigurationList', this.widgetConfigurationList).subscribe(x => { });
    this.engWebApiService.UpdateConfiguration('SideNavWidgetConfigList', this.sideNavWidgetConfig).subscribe(x => { });
  }
}
