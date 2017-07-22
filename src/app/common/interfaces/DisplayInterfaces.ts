import { ValueProvider } from '@angular/core/core';
import { Params } from '@angular/router';

import { UserStatistics } from 'app/common/interfaces/UserInterfaces';
import { DataConsumerConfiguration, ManagedDataReply, NameValue, WidgetConfiguration } from 'app/common/interfaces/WidgetInterfaces';
import { Dictionary } from 'app/common/classes/UtilityFunctions';

export class DataRequestError {
    constructor(public widgetName: string, public dataPolicy: string, public RequestKey: string, public ErrorMessage: string) {}
}

export class DataRequestReply {
    RequestKey: string;
    Available: boolean;
    ImmediateManagedDataReply: ManagedDataReply;

    constructor(requestKey: string, available: boolean, managedDataReply: ManagedDataReply) {
        this.RequestKey = requestKey;
        this.Available = available;
        this.ImmediateManagedDataReply = managedDataReply;
    }
}

/**
 * AppState is used by  DisplayStateService and most of the components in the WidgetDisplayModule for tracking:
 * - data retrieved from backend web service for side nav config and associated data sets
 * - display state - side nav toggle, current side nav config, side nav display hierarchy and data, current context or filters
 */
export class AppDisplayState {
    // side nav configuration and data set lists - retrieved at startup and cached until user explicitly refreshes
    sideNavWidgetConfig: SideNavWidgetConfig;
    widgetConfigList: WidgetConfiguration[] = [];

    cachedDataReplies: Dictionary<string, ManagedDataReply> = new Dictionary<string, ManagedDataReply>();
    pendingDataReplies: string[] = [];
    // All current state
    current: CurrentAppState = new CurrentAppState();
}

// Keeps track of all current application state
export class CurrentAppState {
    context: Params = [];
    filters: Params = [];
    sorts:  Params = [];
    sideNav: SideNavState = {widgetName: '', displayName: '', filter: '', displayState: 'show'};
    widthClass = 'col-md-6';
    perRow = '2';
    cachePolicy = 'default';
    user: adal.User;
    userIsAdmin = false;
    token: string;
    userStatistics: UserStatistics;
}

export interface SideNavState {
    widgetName: string;
    displayName: string;
    filter: string;
    displayState: string;

}

// describes the side nav config stored as an array of these objects in the eng backend database that is used for side nav options
export interface SideNavWidgetConfig {
    widgetNameList: NameValue[];
}

// Generic data set stored in the eng backend and used for all cached data
export interface DataSet {
    columns: string[];
    data: string [][];
}

export class ManagedCacheHitLog {
    dateTime: string;
    type: string;
    client: string;
    dataPolicy: string;
    key: string;
    Status: string;
    Message: string;
    cacheRefresh: boolean;
    elapsedMs: number;
}

export class GroupedKey {

  context: Params;
  children: GroupedKey[];
  badge: string;
  key: string;
  visible: boolean;

  constructor(public granularity: string, public name: string, parentGC?: GroupedKey) {
      this.context = [];
      this.children = [];
      this.key = granularity + '_' + name;
      this.key = this.key.replace(' ', '_sp_').replace('.', '_dot_');
      this.visible = true;
      if (parentGC) {
          this.key = parentGC.key + '_' + this.key;
      }
  }
}