import { Component } from '@angular/core';
import { Params } from '@angular/router';

import { UtilityFunctions } from 'app/common/classes/UtilityFunctions';
import { DataSetFilter, FilterSpec } from 'app/common/classes/DataSetFilter';
import { DataSet, DataRequestReply, DataRequestError } from 'app/common/interfaces/DisplayInterfaces';
import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';
import { NameValue, ManagedDataReply } from 'app/common/interfaces/WidgetInterfaces';


// This is the required order of operations:

// RequestData()      -- starts process to obtain data for originalDataSet
// HandleGrouping()   -- groups originalDataSet to displayDataSet if grouping rules exist, otherwise displayDataSet stays undefined
// HandleFilters()    -- filters displayDataSet if defined or originalDataSet if filters exist. displayDataSet will always be defined at end
// HandleSorts()      -- sorts displayDataSet if there are any sorts
// HandleMessages()   -- applies any manipulation based on messages after all the other operations have completed.
// The operations can be started anywhere in the list, but all following operations must be performed.

@Component({
  selector: 'app-base-manaaged-data-widget-component',
  templateUrl: './BaseManagedDataWidget.component.html',
  styleUrls: ['./BaseManagedDataWidget.component.css']
})
// tslint:disable-next-line:component-class-suffix
export class BaseManagedDataWidget extends BaseWidget {

  originalDataSet: DataSet;
  displayDataSet: DataSet;

  context: Params = [];
  messages: Params = [];
  filters: Params = [];
  sorts: Params = [];

  filterlkp: Params = [];

  dataKey: string = undefined;

  // Overrides from BaseWidget
  onInitialize()                            { this.context = this.currentContext();   this.RequestData(); }
  onNewMessage(messageParams: Params)       { this.messages = messageParams;          this.HandleMessages();  }
  onContextChanged(currentContext: Params)  { this.context = currentContext;          this.RequestData();         }
  onFiltersChanged(currentFilters: Params)  { this.filters = currentFilters;          this.HandleFilters();   }
  onSortsChanged(currentSorts: Params)      { this.sorts = currentSorts;              this.HandleSorts();     }

  private currentContext(): Params {
    return this.displayStateService.appState.current.context;
  }


  RequestData() {
    // Check that the current context still means this widget is in scope.  It can occur that a new context is selected by the
    // user and this widget has gone out of scope but hasn't been destroyed yet.
    const stillMatchesContext = UtilityFunctions.MatchWidgetConfiguration(this.context, this.Config);

    this.displayDataSet = undefined;

    // Async request for managed data and stored in dataSet variable
    if (stillMatchesContext) {
      const reply = this.displayStateService.RequestWidgetData(this.Config);
      if (reply && reply.RequestKey) {
        this.dataKey = reply.RequestKey;
      }
      if (reply.Available === true) {
        // UtilityFunctions.DebugLog(`BaseManagedDataWidget: request complete, data available`);
        this.onDataAvailable(reply);
      // } else {
      //   UtilityFunctions.DebugLog(`BaseManagedDataWidget: request complete, data pending`);
      }
    } else {
      this.originalDataSet = undefined;
    }
  }

  onDataAvailable(reply: DataRequestReply) {
    if (this.dataKey !== undefined && this.dataKey === reply.RequestKey && reply.Available === true) {
      this.originalDataSet = <DataSet>reply.ImmediateManagedDataReply.CacheData.Payload;
        this.onManagedDataReply(reply.ImmediateManagedDataReply);
        this.HandleGrouping();
    }
  }

  onDataError(error: DataRequestError) {
    if (this.dataKey !== undefined && this.dataKey === error.RequestKey) {
      this.onManagedDataError(error)
    }
  }

  onManagedDataError(error: DataRequestError) {}

  onManagedDataReply(managedDataReply: ManagedDataReply) {}

  HandleGrouping() {

    if (this.originalDataSet !== undefined) {
      if (this.Config.dataConsumerConfiguration.dataGrouping !== undefined) {
        this.originalDataSet = DataSetFilter.GroupDataSet(this.originalDataSet, this.Config.dataConsumerConfiguration.dataGrouping);
      }
      this.filterlkp = [];
      this.HandleFilters();
    }
  }

  HandleFilters() {

    if (this.originalDataSet !== undefined) {

      this.filterlkp = [];
      Object.keys(this.displayStateService.appState.current.filters).forEach( k => {

        const userExp = FilterSpec.FormattedExpressionToUser({ name: k, value: this.displayStateService.appState.current.filters[k] });
        if (this.originalDataSet.columns.indexOf(userExp.name) > -1) {
          this.filterlkp[userExp.name] = userExp.value;
        }
      });

      this.displayDataSet = DataSetFilter.FilterDataSet(
        this.originalDataSet,
        this.Config.dataConsumerConfiguration.filterConfiguration,
        this.context,
        this.displayStateService.appState.current.filters);
      this.HandleSorts();

    }
  }

  HandleSorts() {
    if (this.originalDataSet !== undefined) {

      let localTable = [... this.displayDataSet.data];
      const localSorts: Params = [];

      if (Object.keys(this.sorts).length > 0) {
        Object.keys(this.sorts).forEach(k => { localSorts[k] = this.sorts[k]; });
      } else if (this.Config.dataConsumerConfiguration.sortColumns !== undefined) {
        this.Config.dataConsumerConfiguration.sortColumns.forEach(x => { localSorts[x.name] = x.value; });
      }

      if (Object.keys(localSorts).length > 0) {
        const sortKeys = Object.keys(localSorts);

        localTable = localTable.sort((rowA, rowB) => {

          const pairs: NameValue[] = [];

          for (let keyI = 0; keyI < sortKeys.length; keyI++) {
            const colIdx = this.displayDataSet.columns.indexOf(sortKeys[keyI]);
            if (colIdx > -1) {
              if (localSorts[sortKeys[keyI]] === 'asc') {
                pairs.push({ name: rowA[colIdx], value: rowB[colIdx] });
              } else {
                pairs.push({ name: rowB[colIdx], value: rowA[colIdx] });
              }
            }

            for (let i = 0; i < pairs.length; i++) {
              const a = Number(pairs[i].name);
              const b = Number(pairs[i].value);
              if (!isNaN(a) && !isNaN(b)) {
                const difference = a - b;
                if (difference !== 0) { return difference; }
              } else {
                if (pairs[i].name < pairs[i].value) { return -1; }
                if (pairs[i].name > pairs[i].value) { return 1; }
              }
            }
          }
          return 0;

        });

        this.displayDataSet.data = [...localTable];
      }
      this.PostProcessing()
      this.HandleMessages();
    }
  }

  PostProcessing() {
    // Blank - child components can override this to handle
  }

  HandleMessages() {
    // Blank - child components can override to handle
  }
}
