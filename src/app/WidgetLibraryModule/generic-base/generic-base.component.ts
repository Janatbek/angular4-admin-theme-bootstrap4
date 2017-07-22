import { Params } from '@angular/router';
import { Component } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/takeUntil';

import { BaseManagedDataWidget } from 'app/common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';

import { DataSet } from 'app/common/interfaces/DisplayInterfaces';
import { DataSetFilter } from 'app/common/classes/DataSetFilter';
import { FilterSpec } from 'app/common/classes/DataSetFilter';
import { UtilityFunctions } from 'app/common/classes/UtilityFunctions';

import {
  WidgetConfiguration,
  CacheDataInfo,
  DataPolicy,
  DataGrouping,
  NameValue,
  ManagedDataReply } from 'app/common/interfaces/WidgetInterfaces';

import { DisplayStateService, Events } from 'app/common/services/DisplayStateService';
import { AppStateService } from 'app/common/services/AppStateService';

@Component({
  selector: 'app-generic-base',
  templateUrl: './generic-base.component.html',
  styleUrls: ['./generic-base.component.css']
})
export class GenericBaseComponent extends BaseManagedDataWidget {

  cacheDataInfo: CacheDataInfo;

  private searchUpdated: Subject<NameValue> = new Subject<NameValue>();

  onInitialize() {
    super.onInitialize();

    this.searchUpdated
      .debounceTime(380)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(e => {
        if (e.value === undefined || e.value === '') {
          this.displayStateService.RemoveFilter(e.name);
        } else {
          const formatted = FilterSpec.UserExpressionToFormatted(e.value);
          if (formatted.endsWith('|')) {
            // do nothing - user has entered first part of an expression but no value
          } else {
            this.displayStateService.AddFilter(e.name, FilterSpec.UserExpressionToFormatted(e.value));
          }
        }
      });
  }

  onFilterChange(column, filterExpression) {
    this.searchUpdated.next({name: column, value: filterExpression});
  }

  onManagedDataReply(managedDataReply: ManagedDataReply) {
    this.cacheDataInfo = {
        CacheDate: this.dateFormat(managedDataReply.CacheData.CacheDate),
        MinutesRemaining: managedDataReply.CacheData.MinutesRemaining,
        RetrievedFromCache: managedDataReply.CacheData.RetrievedFromCache,
        key: managedDataReply.CacheData.key,
        Payload: {}
      };
  }

  HandleFilters() {
    super.HandleFilters();
    
  }

  HandleMessages() {
    this.PostProcessing();
  }

  PostProcessing() { };

  private dateFormat(originalDate: string): string {
    const parts = originalDate.split('_');
    return `${parts[1]}/${parts[2]}/${parts[0]} ${parts[3]}:${parts[4]}:${parts[5]}`;
  }

}
