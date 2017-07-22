import { Component, OnInit, Input } from '@angular/core';

import { EngWebApiService } from 'app/common/services/EngWebApiService';
import { AppStateService } from 'app/common/services/AppStateService';

import { DisplayStateService } from 'app/common/services/DisplayStateService';
import { AppDisplayState } from 'app/common/interfaces/DisplayInterfaces';
import { WidgetConfiguration, ContextMatchingRule } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-user-administration',
  templateUrl: './user-administration.component.html',
  styleUrls: ['./user-administration.component.css']
})
export class UserAdministrationComponent implements OnInit {

  @Input() Config: WidgetConfiguration[];
  widgetConfigList: WidgetConfiguration[];
  filteredWidgetConfigList: WidgetConfiguration[];
  groupedWidgetConfigList: WidgetConfigGroup[];
  uniqueSources: string[] = [];

  constructor(
    private EngWebApiService: EngWebApiService,
    private appStateService: AppStateService,
    private displayStateService: DisplayStateService) { }

  public get ALL_CATEGORIES(): string { return 'All categories'; };

  ngOnInit() {
    this.EngWebApiService.GetConfig<WidgetConfiguration[]>('WidgetConfigurationList').subscribe(
            x => {
                this.widgetConfigList = x;
                this.filteredWidgetConfigList = x;
                this.uniqueSources =
                  this.widgetConfigList
                    .filter(wc =>
                      wc.contextMatchingRules !== undefined &&
                      wc.contextMatchingRules.find(cmr => cmr.contextName === 'source' && cmr.valueMatch !== undefined))
                    .map(wc =>
                      wc.contextMatchingRules.find(cmr => cmr.contextName === 'source').valueMatch)
                    .filter( (v, i, a) =>
                      a.indexOf(v) === i ); // unique

                this.BuildGroupedWidgetList();

                this.uniqueSources.push(this.ALL_CATEGORIES);
            },
            error => this.appStateService.appendLog('LoadWidgetConfigList ERROR: ' + JSON.stringify(error), 1));
  }

  SourceSelected(source: string) {
    if (this.widgetConfigList !== undefined) {
      if (source === this.ALL_CATEGORIES) {
        this.filteredWidgetConfigList =
          this.widgetConfigList;
      } else {
        this.filteredWidgetConfigList =
          this.widgetConfigList.filter (wc =>
            wc.contextMatchingRules !== undefined &&
            wc.contextMatchingRules.find(cmr => cmr.contextName === 'source' && cmr.valueMatch === source) !== undefined );        
      }
      this.BuildGroupedWidgetList();
    }
  }

  BuildGroupedWidgetList() {
     this.groupedWidgetConfigList = [];
      let currentGroup: WidgetConfigGroup = undefined;
      for (let i = 0; i < this.filteredWidgetConfigList.length; i++) {
        if (i % 4 === 0) {
          currentGroup = new WidgetConfigGroup();
          currentGroup.widgetConfigList = [];
          this.groupedWidgetConfigList.push(currentGroup);
        }
        currentGroup.widgetConfigList.push(this.filteredWidgetConfigList[i]);
      }
  }

  ToggleWidgetSelection(name: string) {
    const stats = this.displayStateService.appState.current.userStatistics;
    if (stats.widgetRegistration !== undefined &&
      stats.widgetRegistration.excludedWidgets !== undefined && 
      stats.widgetRegistration.excludedWidgets.findIndex(x => x === name) > -1) {
      stats.widgetRegistration.excludedWidgets.splice(stats.widgetRegistration.excludedWidgets.findIndex(x => x === name), 1);
    } else {
      if (stats.widgetRegistration === undefined) { stats.widgetRegistration = { groupedWidgets: []}; }
      if (stats.widgetRegistration.excludedWidgets === undefined) { stats.widgetRegistration.excludedWidgets = []; }
      stats.widgetRegistration.excludedWidgets.push(name);
    }
    this.displayStateService.SaveUserStats();

  }

  WidgetSelected(name: string): boolean {
    const stats = this.displayStateService.appState.current.userStatistics;
    return stats.widgetRegistration === undefined ||
      stats.widgetRegistration.excludedWidgets === undefined ||
      stats.widgetRegistration.excludedWidgets.findIndex(x => x === name) === -1;
  }


  ContextMatchingRuleToString(rule: ContextMatchingRule): string {
    let returnString = rule.contextName;
    returnString += rule.optional ? '?' : '';
    returnString += rule.valueMatch === undefined ? '=*' : '=' + rule.valueMatch;

    return returnString;
  }
}

class WidgetConfigGroup {
  widgetConfigList: WidgetConfiguration[];
}