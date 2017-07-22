import { Component } from '@angular/core';

import { UsageCounter, UserStatistics } from 'app/common/interfaces/UserInterfaces';
import { NameIndex, NameValue } from 'app/common/interfaces/WidgetInterfaces';
import { DataSet } from 'app/common/interfaces/DisplayInterfaces';

import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';
import { LogEntry } from 'app/common/services/AppStateService';

import { environment } from 'environments/environment';

@Component({
  selector: 'app-diagnostics',
  templateUrl: './diagnostics.component.html',
  styleUrls: ['./diagnostics.component.css']
})
export class DiagnosticsComponent extends BaseWidget {

  entries: LogEntry[] = [];
  inProduction = false;
  RedirectUrlSuffix = '';
  WebApiUrl = environment.WebApiUrl;
  aggregateStats: NameIndex[] = [];
  userStatistics: UserStatistics;
  userStatisticsList: UserStatistics[]
  userDataTable: DataSet = { columns: [], data: [] };
  selectedStatsType = 'widget';
  userFilter = '';

  buttons: NameValue[] = [
    { name: 'Widgets', value: 'widget' },
    { name: 'App', value: 'app' },
    { name: 'Data', value: 'data' },
    { name: 'Side Nav', value: 'side nav' },
  ];

  onFilterChange(newValue: string) {
    this.userFilter = newValue.toLowerCase();
    this.CreateStats();

  }
  getLogClass(level: number) {
    if (level < 2) { return 'danger'; }
    else if (level === 2) { return 'warning'; }
    else { return 'info'; }
  }

  IsActive(type: string): string {
    return this.selectedStatsType === type ? 'btn-active' : 'btn-secondary';
  }
  SelectStatsType(type: string) {
    if (this.selectedStatsType !== type) {
      this.selectedStatsType = type;
      this.CreateStats();
    }
  }
  onInitialize() {
    this.inProduction = environment.production;
    this.RedirectUrlSuffix = environment.RedirectUrlSuffix;
    this.WebApiUrl = environment.WebApiUrl;
    this.Refresh();

  }

  Refresh() {
    this.entries = [... this.appStateService.appState.rollingLogEntries];
    this.userStatistics = this.displayStateService.appState.current.userStatistics;
    this.engWebApiService.GetAllUserStats().subscribe(list => {
      this.userStatisticsList = list;
      this.CreateStats();
    });
  }

  StatsPerCollection(counter: UsageCounter[], nameIndexList: NameIndex[], prefix: string) {
    if (counter) {
      counter.forEach(us => {
        const key = `${us.key}`;
        nameIndexList.push({ name: key, index: us.count });
        let thisNi = this.aggregateStats.find(ni => ni.name === key);
        if (thisNi === undefined) {
          thisNi = { name: key, index: 0 };
          this.aggregateStats.push(thisNi);
        }
        thisNi.index += us.count;
      });
    }
  }

  CreateStats() {
    this.aggregateStats = [];
    this.userDataTable = { columns: [], data: [] };
    const userStatsCollections: StatsCollection[] = [];

    this.userStatisticsList.forEach(stats => {

      if (!this.userFilter || stats.userName.toLowerCase().indexOf(this.userFilter) > -1) {
        const thisStatsCollection = new StatsCollection(stats.userName);
        userStatsCollections.push(thisStatsCollection);

        switch (this.selectedStatsType) {
          case 'data':
            this.StatsPerCollection(stats.dataPolicyUsageStatistics, thisStatsCollection.stats, 'data');
            break;
          case 'app':
            this.StatsPerCollection(stats.applicationUsageStatistics, thisStatsCollection.stats, 'app');
            break;
          case 'side nav':
            this.StatsPerCollection(stats.sideNavUsageStatistics, thisStatsCollection.stats, 'side nav');
            break;
          default:
            this.selectedStatsType = 'widget';
            this.StatsPerCollection(stats.widgetUsageStatistics, thisStatsCollection.stats, 'widget');
        }
      }
    });

    this.aggregateStats = this.aggregateStats.sort((a, b) => { return b.index - a.index; });
    this.userDataTable.columns = this.aggregateStats.map(a => a.name);
    userStatsCollections.forEach(sc => {

      const row: string[] = [sc.user];
      this.userDataTable.columns.forEach(c => {
        const found = sc.stats.find(x => x.name === c);
        row.push(found === undefined ? '' : found.index.toString());
      });
      this.userDataTable.data.push(row);
    });

    this.userDataTable.columns.splice(0, 0, 'user');
  }
}

class StatsCollection {

  user: string;
  stats: NameIndex[];

  constructor(user: string) {
    this.user = user;
    this.stats = [];
  }
}