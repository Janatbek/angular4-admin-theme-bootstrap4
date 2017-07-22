import { noComponentFactoryError } from '@angular/core/src/linker/component_factory_resolver';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable, Subscription } from 'rxjs/Rx';

import * as events from 'events';

import { UsageCounter, UserStatistics } from 'app/common/interfaces/UserInterfaces';

import {
    DataConsumerConfiguration,
    ManagedDataReply,
    NameValue,
    WidgetConfiguration
} from 'app/common/interfaces/WidgetInterfaces';

import { EngWebApiService } from 'app/common/services/EngWebApiService';
import { AppStateService } from 'app/common/services/AppStateService';
import {
    AppDisplayState,
    DataSet,
    SideNavWidgetConfig,
    GroupedKey,
    DataRequestReply,
    DataRequestError
} from 'app/common/interfaces/DisplayInterfaces';

import { DataSetConverter } from 'app/common/classes/DataSetConverter';
import { Dictionary, UtilityFunctions } from 'app/common/classes/UtilityFunctions';

@Injectable()
export class DisplayStateService {

    /**
     * There are two ways that the display can be changed - query parameters or user clicks and input.  All changes are processed
     * through the same pipeline - turned into parameters, passed through the router navigate() method, and then processed as
     * new parameters. There is a problem where the navigate() method wont raise an event to listen to if only certain parameters
     * change, so this is a flag that lets the logic bypass handling post navigate() event so that it's only fired if the user
     * actually changes the url query parameters in the browser
     */
    public ignoreRouting = false;

    // Used by various components to be notified when certain state changes.  See events class below
    public AppStateChanged: BehaviorSubject<string>;
    public MessageHouse: Subject<Params>;
    public DataAvailable: Subject<DataRequestReply>;
    public DataError: Subject<DataRequestError>;
    public Toast: Subject<string>;

    // Entire display app state stored in this object
    appState: AppDisplayState = new AppDisplayState();

    qpSubscription: Subscription = undefined;

    constructor(private engWebApiService: EngWebApiService, private appStateService: AppStateService,
        private route: ActivatedRoute, private router: Router) {
        this.AppStateChanged = new BehaviorSubject<string>('initial');
        this.MessageHouse = new Subject<Params>();
        this.DataAvailable = new Subject<DataRequestReply>();
        this.DataError = new Subject<DataRequestError>();
        this.Toast = new  Subject<string>();

        this.AppStateChanged.subscribe(x => {
            if (x === Events.USER_CHANGED && this.appState.current.user !== undefined) {
                this.LoadWidgetConfigList();
                this.LoadSideNavConfigList();
                if (this.route && this.qpSubscription === undefined) {
                    this.qpSubscription = route.queryParams.subscribe(params => {
                        if (this.ignoreRouting) {
                            this.ignoreRouting = false;
                            return;
                        }
                        this.ProcessParams(params);
                    });
                }
            }
        });
    }

    ClearLocalCache() {
        this.appState.cachedDataReplies = new Dictionary<string, ManagedDataReply>();
    }

    LoadWidgetConfigList() {
        this.engWebApiService.GetConfig<WidgetConfiguration[]>('WidgetConfigurationList').subscribe(
            widgetConfigList => {
                this.appState.widgetConfigList = widgetConfigList;
                this.handleSideNavSetup();
                this.AppStateChanged.next(Events.WIDGET_CONFIG_LIST_CHANGED);
            },
            error => this.appStateService.appendLog('LoadWidgetConfigList ERROR: ' + JSON.stringify(error), 1)
        );
    }

    // Called when user picks a side nav configuration but the data necessary to display in the side nav hasn't been
    // retrieved from the eng backend
    LoadSideNavConfigList() {
        this.engWebApiService.GetConfig<SideNavWidgetConfig>('SideNavWidgetConfigList').subscribe(
            sideNavWidgetConfig => {
                this.appState.sideNavWidgetConfig = sideNavWidgetConfig;
                this.handleSideNavSetup();
            },
            error => this.appStateService.appendLog('LoadSideNavConfigList ERROR: ' + JSON.stringify(error), 1)
        );
    }

    private handleSideNavSetup() {
        // TODO: filter side nav names based on if they are excluded for user, and add logic to recreate the list when user
        // changes any registration of widgets.
        const ready =
            this.appState.sideNavWidgetConfig !== undefined &&
            this.appState.sideNavWidgetConfig.widgetNameList.length > 0 &&
            this.appState.widgetConfigList !== undefined &&
            this.appState.widgetConfigList.length > 0;

        if (ready) {
            if (this.appState.current.sideNav.displayName === '') {
                this.appState.current.sideNav.displayName = this.appState.sideNavWidgetConfig.widgetNameList[0].value;
            }
            const nv = this.appState.sideNavWidgetConfig.widgetNameList.find(s =>
                s.value === this.appState.current.sideNav.displayName);
            this.appState.current.sideNav.widgetName = nv.name;
            this.AppStateChanged.next(Events.SIDE_NAV_CHANGED);
        }
    }

    private setSideNav(name: string) {

        if (name === '') { return; }
        this.appState.current.sideNav.displayName = name;
        this.handleSideNavSetup();
    }

    ExistingParams(): Params {

        const existing: Params = [];

        existing[UrlConstants.WIDGETS_PER_ROW] = this.appState.current.perRow;

        existing[UrlConstants.SIDENAV_SHOW] = this.appState.current.sideNav.displayState;
        if (this.appState.current.sideNav.displayName) {
            existing[UrlConstants.SIDENAV_NAME] = this.appState.current.sideNav.displayName;
        }
        existing[UrlConstants.WIDGETS_PER_ROW] = this.appState.current.perRow;
        existing[UrlConstants.SIDENAV_FILTER] = this.appState.current.sideNav.filter;

        for (const key of Object.keys(this.appState.current.context)) {
            existing[`c.${key}`] = this.appState.current.context[key];
        }
        for (const key of Object.keys(this.appState.current.filters)) {
            existing[`f.${key}`] = this.appState.current.filters[key];
        }
        for (const key of Object.keys(this.appState.current.sorts)) {
            existing[`s.${key}`] = this.appState.current.sorts[key];
        }

        return existing;
    }

    RouteWidgetsPerRow(count: string) {
        const params = this.ExistingParams();
        params[UrlConstants.WIDGETS_PER_ROW] = count;
        this.Route(params);
    }

    RouteSideNavFilter(filter: string) {
        const params = this.ExistingParams();
        params[UrlConstants.SIDENAV_FILTER] = filter;
        this.Route(params);
    }

    // Route* methods are called by components when the user does something that elicits a change in state
    RouteSideNav(name: string) {
        const params = this.ExistingParams();
        params[UrlConstants.SIDENAV_NAME] = name;
        this.Route(params);
    }

    ToggleNavDisplay() {
        if (this.appState.current.sideNav.displayState === 'show') {
            this.RouteSideNavDisplay('hide');
        } else {
            this.RouteSideNavDisplay('show');
        }
    }
    RouteSideNavDisplay(display: string) {
        const params = this.ExistingParams();
        params[UrlConstants.SIDENAV_SHOW] = display;
        this.Route(params);
    }

    RemoveSort(keyToRemove: string) {
        const params = this.ExistingParams();
        delete (params[`s.${keyToRemove}`]);
        this.Route(params);
    }

    UserStatsIncrement(usageCounterList: UsageCounter[], key: string, autosave = true) {
        let thisUsageCounter = usageCounterList.find(x => x.key === key);
        if (thisUsageCounter == null) {
            thisUsageCounter = { key: key, count: 0, lastUsage: '' };
            usageCounterList.push(thisUsageCounter)
        }
        thisUsageCounter.count++;
        thisUsageCounter.lastUsage = new Date().toLocaleString();
        if (autosave) {
            this.SaveUserStats();
        }
    }

    SetUser(user: adal.User, token: string) {
        this.appState.current.user = user;
        this.appState.current.userStatistics = undefined;
        this.appStateService.appendLog('setting fresh authentication', 2);
        this.engWebApiService.freshAuthentication = true;
        Observable.timer(29 * 60 * 1000).subscribe(x => {
            this.appStateService.appendLog('Timing out fresh authentication', 2);
            this.engWebApiService.freshAuthentication = false;
        });

        this.engWebApiService.GetUserStats(this.appState.current.user.userName.split('@')[0]).subscribe(uStats => {
            if (uStats.widgetRegistration && uStats.widgetRegistration.groupedWidgets) {
                uStats.widgetRegistration.groupedWidgets =
                    uStats.widgetRegistration.groupedWidgets.filter(gw => gw.contextKey !== null && gw.contextKey !== undefined);
            }
            this.appState.current.userStatistics = uStats;

            this.UserStatsIncrement(this.appState.current.userStatistics.applicationUsageStatistics, 'general');
            this.AppStateChanged.next(Events.USER_CHANGED);
        });
    }

    SaveUserStats() {
        if (this.appState.current.userStatistics !== undefined) {
            this.engWebApiService.UpsertUserStats(this.appState.current.userStatistics).subscribe(x => { });
        }
    }

    SetSorts(Sorts: Params) {
        const params = this.ExistingParams();
        const newParams: Params = []

        Object.keys(params).forEach(k => {
            if (!k.startsWith('s.')) {
                newParams[k] = params[k];
            }
        });

        // UtilityFunctions.DebugLog('SetContext -> existing params after removing current context', newParams);
        Object.keys(Sorts).forEach(x => { newParams[`s.${x}`] = Sorts[x]; });
        this.Route(newParams);
    }

    AddSorts(newSorts: Params) {
        const params = this.ExistingParams();
        Object.keys(newSorts).forEach(k => { params[`s.${k}`] = newSorts[k]; });
        this.Route(params);
    }

    AddSort(name: string, value: string) {
        const params = this.ExistingParams();
        params[`s.${name}`] = value;
        this.Route(params);
    }

    RemoveFilter(keyToRemove: string) {
        const params = this.ExistingParams();
        delete (params[`f.${keyToRemove}`]);
        this.Route(params);
    }

    SetFilters(filters: Params) {
        const params = this.ExistingParams();

        Object.keys(this.appState.current.filters).forEach(x => {
            delete (params[`f.${x}`]);
        });
        Object.keys(filters).forEach(x => { params[`f.${x}`] = filters[x]; });
        this.Route(params);
    }

    AddFilters(newFilters: Params) {
        const params = this.ExistingParams();
        Object.keys(newFilters).forEach(k => { params[`f.${k}`] = newFilters[k]; });
        this.Route(params);
    }

    AddFilter(name: string, value: string) {
        const params = this.ExistingParams();
        params[`f.${name}`] = value;
        this.Route(params);
    }

    RemoveContext(keyToRemove: string) {
        const params = this.ExistingParams();
        delete (params[`c.${keyToRemove}`]);
        this.Route(params);
    }

    SetContext(newContext: Params) {
        // UtilityFunctions.DebugLog('SetContext new', newContext);
        const params = this.ExistingParams();
        const newParams: Params = []

        Object.keys(params).forEach(k => {
            if (!k.startsWith('c.')) {
                newParams[k] = params[k];
            }
        });

        // UtilityFunctions.DebugLog('SetContext -> existing params after removing current context', newParams);
        Object.keys(newContext).forEach(x => { newParams[`c.${x}`] = newContext[x]; });
        this.Route(newParams);
    }

    AddContextList(newContext: Params) {
        // UtilityFunctions.DebugLog('AddContextList new', newContext);
        const params = this.ExistingParams();

        Object.keys(newContext).forEach(x => { params[`c.${x}`] = newContext[x]; });
        // UtilityFunctions.DebugLog('AddContextList -> new params', params);
        this.Route(params);
    }

    AddContext(name: string, value: string) {
        const params = this.ExistingParams();
        // Object.keys(ctxt).forEach(x => { params[x] = ctxt[x]; });
        params[`c.${name}`] = value;
        this.Route(params);
    }

    public RouteFromQueryParamString(qpString: string) {
        const newParams: Params = [];

        qpString.split('&').forEach(x => {
            const parts = x.split('=');
            newParams[parts[0]] = parts[1];
        });
        this.Route(newParams);
    }

    // Handles all route initiated by the application components.  Takes all current settings, replaces any that were changed,
    // and triggers routing navigation
    public Route(newParams: Params) {
        // UtilityFunctions.DebugLog('Route: new', newParams);
        // UtilityFunctions.DebugLog('Route: existing', this.ExistingParams());
        // Trigger routing navigation - this ensures that all the state parameters show up in the url as query params
        this.ignoreRouting = true;

        if (this.router) {
            this.router.navigate([''], { queryParams: newParams });
        } else {
            console.log('cannot route as this.router isnt valid');
        }

        // Explicity process the new parameters since navigate() will change url query params but doesn't necessarily
        // raise the event we are listening to to catch new parameters
        this.ProcessParams(newParams);
    }

    // Generic handler of all changes to display state parameters.  Can be triggered by user changing query params in
    // the URL or by one of the Route* methods above.
    ProcessParams(queryParams: Params) {

        // UtilityFunctions.DebugLog(`DisplayStateService.ProcessParams queryParams`, queryParams);

        const context: Params = [];
        const filters: Params = [];
        const sorts: Params = [];
        let sideNavName = '';
        let _showSideNav = this.appState.current.sideNav.displayState;

        // Split new params up
        for (const key of Object.keys(queryParams)) {
            if (key === UrlConstants.SIDENAV_NAME) {
                sideNavName = queryParams[key];
            } else if (key === UrlConstants.WIDGETS_PER_ROW) {
                this.SetWidthClass(queryParams[key]);
            } else if (key === UrlConstants.SIDENAV_FILTER) {
                this.SetSideNavFilter(queryParams[key])
            } else if (key === UrlConstants.SIDENAV_SHOW) {
                _showSideNav = queryParams[key];
            } else if (key.startsWith('f.')) {
                filters[key.substr(2)] = queryParams[key];
            } else if (key.startsWith('c.')) {
                context[key.substr(2)] = queryParams[key];
            } else if (key.startsWith('s.')) {
                sorts[key.substr(2)] = queryParams[key];
            }
        }

        this.setSideNav(sideNavName);
        if (this.appState.current.sideNav.displayState !== _showSideNav) {
            this.appState.current.sideNav.displayState = _showSideNav;
            this.AppStateChanged.next(Events.SIDE_NAV_DISPLAYED_CHANGED);
        }

        if (this.differentParams(context, this.appState.current.context)) {
            this.appState.current.context = context;
            this.AppStateChanged.next(Events.CURRENT_CONTEXT_CHANGED);
        }

        if (this.differentParams(sorts, this.appState.current.sorts)) {
            this.appState.current.sorts = sorts;
            this.AppStateChanged.next(Events.CURRENT_SORTS_CHANGED);
        }

        if (this.differentParams(filters, this.appState.current.filters)) {
            this.appState.current.filters = filters;
            this.AppStateChanged.next(Events.CURRENT_FILTERS_CHANGED);
        }
    }

    SetWidthClass(perRow: string) {

        if (perRow !== this.appState.current.perRow) {
            this.appState.current.perRow = perRow;
            switch (perRow) {
                case '1': this.appState.current.widthClass = 'col-md-12'; break;
                case '2': this.appState.current.widthClass = 'col-md-6'; break;
                case '3': this.appState.current.widthClass = 'col-md-4'; break;
                case '4': this.appState.current.widthClass = 'col-md-3'; break;
            }

            this.AppStateChanged.next(Events.WIDTH_CLASS_CHANGED);
        }
    }

    // Called by anything that wants to change the side nav filter string, which is probably only the side nav component
    SetSideNavFilter(filter: string) {
        if (this.appState.current.sideNav.filter !== filter) {
            this.appState.current.sideNav.filter = filter;
            this.AppStateChanged.next(Events.SIDE_NAV_FILTER_CHANGED);
        }
    }



    // Returns true if anything in two lists or parameters are different
    private differentParams(a: Params, b: Params): boolean {
        const aString = UtilityFunctions.SortedParamsString(a);
        const bString = UtilityFunctions.SortedParamsString(b);
        return aString !== bString;
    }

    public GetDataConsumerConfigKey(dataConsumerConfig: DataConsumerConfiguration): string {
        const additionalParams: Params = this.GetParams(dataConsumerConfig);

        const paramString =  UtilityFunctions.SortedParamsString(additionalParams);
        const returnKey = paramString ?  dataConsumerConfig.dataPolicy + ':' + paramString : dataConsumerConfig.dataPolicy;
        // UtilityFunctions.DebugLog(`GetDataConsumerConfigKey: returning ${returnKey}`);
        return returnKey;
    }

    GetParams(dataConsumerConfig: DataConsumerConfiguration): Params {
        const additionalParams: Params = [];

        // Create context mapping rules - this means that current context values can be sent to the
        // middle layer as part of the query
        if (dataConsumerConfig.contextParameters !== undefined) {
            dataConsumerConfig.contextParameters.forEach(
                nv => {
                    const nameToSend = nv.value.length > 0 ? nv.value : nv.name;
                    additionalParams[`p.${nameToSend}`] = this.appState.current.context[nv.name];
                });
        }

        if (dataConsumerConfig.fixedParameters !== undefined) {
            dataConsumerConfig.fixedParameters.forEach(nv => {
                additionalParams[`p.${nv.name}`] = nv.value;
            });

        }

        // TODO: Move the cache.* parameters out of here as they affect the cache key if used
        if (this.appState.current.cachePolicy === CacheConstants.NEVER) {
            additionalParams['cache.period'] = CacheConstants.NEVER;
        } else if (this.appState.current.cachePolicy === CacheConstants.PERMANENT) {
            additionalParams['cache.period'] = CacheConstants.PERMANENT;
        } else if (dataConsumerConfig.overrideCacheRules !== undefined && dataConsumerConfig.overrideCacheRules.period) {
            // tslint:disable-next-line:max-line-length
            if (dataConsumerConfig.overrideCacheRules.frequency !== undefined) { additionalParams['cache.frequency'] = dataConsumerConfig.overrideCacheRules.frequency; }
            // tslint:disable-next-line:max-line-length
            if (dataConsumerConfig.overrideCacheRules.period !== undefined) { additionalParams['cache.period'] = dataConsumerConfig.overrideCacheRules.period; }
            // tslint:disable-next-line:max-line-length
            if (dataConsumerConfig.overrideCacheRules.targetDay !== undefined) { additionalParams['cache.targetDay'] = dataConsumerConfig.overrideCacheRules.targetDay; }
            // tslint:disable-next-line:max-line-length
            if (dataConsumerConfig.overrideCacheRules.targetHour !== undefined) { additionalParams['cache.targetHour'] = dataConsumerConfig.overrideCacheRules.targetHour; }
            // tslint:disable-next-line:max-line-length
            if (dataConsumerConfig.overrideCacheRules.targetMinute !== undefined) { additionalParams['cache.targetMinute'] = dataConsumerConfig.overrideCacheRules.targetMinute; }
        }
        // Filtering?
        if (dataConsumerConfig.filterConfiguration !== undefined) {
            dataConsumerConfig.filterConfiguration.filter(nv => nv.serverSide === true).forEach(
                nv => {
                    let valueToUse: string = undefined;

                    if (nv.contextValueName !== undefined && nv.contextValueName in this.appState.current.context) {
                        valueToUse = this.appState.current.context[nv.contextValueName];
                    } else if (nv.value !== undefined && nv.value.length > 0) {
                        valueToUse = nv.value;
                    }

                    if (valueToUse !== undefined && nv.value.length > 0) {
                        additionalParams[`f.${nv.column}`] =
                            nv.operator !== undefined ?
                                `${nv.operator}.${valueToUse}` :
                                `${valueToUse}`;
                    }
                });
        }

        // Grouping?  Example query params:
        // g.TRAVELER_STEP,IS_ANOMALY
        //  =
        // run_id_count.sum.idCount,run_id_count.count.idCount,run_id_count.mean.idMean
        if (dataConsumerConfig.dataGrouping && dataConsumerConfig.dataGrouping.serverSide) {
            const paramName = 'g.' +
                dataConsumerConfig.dataGrouping.groupBy.join(',');
            const paramValue =
                dataConsumerConfig.dataGrouping.aggregations.map(a => `${a.name}.${a.operation}.${a.rename}`);
            additionalParams[paramName] = paramValue;
        }

        // Pivoting?
        // Example query params: pvt.IS_ANOMALY=run_id_count.sum
        if (dataConsumerConfig.pivot && dataConsumerConfig.pivot.name && dataConsumerConfig.pivot.operation) {
            const paramName = 'pvt.' +
                dataConsumerConfig.pivot.name;
            const paramValue = `${dataConsumerConfig.pivot.rename}.${dataConsumerConfig.pivot.operation}`
            dataConsumerConfig.dataGrouping.aggregations.map(a => `${a.name}.${a.operation}.${a.rename}`);
            additionalParams[paramName] = paramValue;
        }

        // UtilityFunctions.DebugLog(`GetDataConsumerConfigKey: dataConsumerConfig = ${JSON.stringify(dataConsumerConfig, null , 2)} `);
        // UtilityFunctions.DebugLog(`GetParams: context is ${UtilityFunctions.SortedParamsString(this.appState.current.context)}`);
        // UtilityFunctions.DebugLog(`GetParams: returning ${UtilityFunctions.SortedParamsString(additionalParams)}`);
        return additionalParams;
    }

    RequestWidgetData(config: WidgetConfiguration): DataRequestReply {
        return this.RequestData(config.name, config.dataConsumerConfiguration);
    }

    UpdateWidgetConfigColumns(widgetName: string, dataConsumerConfig: DataConsumerConfiguration, reply: ManagedDataReply) {
        const matchingWC = this.appState.widgetConfigList.find(wc => wc.name === widgetName);
        if (matchingWC !== undefined) {
            const asDataSet = <DataSet>reply.CacheData.Payload;
            if (asDataSet.columns !== undefined && dataConsumerConfig.columns === undefined) {
                matchingWC.dataConsumerConfiguration.columns = asDataSet.columns;
                this.engWebApiService.UpdateConfiguration(
                    'WidgetConfigurationList',
                    this.appState.widgetConfigList).subscribe(x => { });
                dataConsumerConfig.columns = asDataSet.columns;
            }
        }

        const asDataSet = <DataSet>reply.CacheData.Payload;
        if (asDataSet.columns !== undefined && dataConsumerConfig.columns === undefined) {

            const matchingWC = this.appState.widgetConfigList.find(wc => wc.name === widgetName);
            if (matchingWC !== undefined) {
                matchingWC.dataConsumerConfiguration.columns = asDataSet.columns;
                this.engWebApiService.UpdateConfiguration(
                    'WidgetConfigurationList',
                    this.appState.widgetConfigList).subscribe(x => { });
            }
            dataConsumerConfig.columns = asDataSet.columns;
        }
    }
    RequestData(widgetName: string, dataConsumerConfig: DataConsumerConfiguration): DataRequestReply {

        if (dataConsumerConfig.dataPolicy === undefined || dataConsumerConfig.dataPolicy.length === 0) {
            return;
        }

        const key = this.GetDataConsumerConfigKey(dataConsumerConfig);

        if (this.appState.cachedDataReplies.containsKey(key)) {
            UtilityFunctions.DebugLog(`using locally cached managed data set for key ${key}`);
            const datareply = this.appState.cachedDataReplies.get(key);
            this.UpdateWidgetConfigColumns(widgetName, dataConsumerConfig, datareply);

            return new DataRequestReply(key, true, this.appState.cachedDataReplies.get(key));
        } else {

            if (this.appState.pendingDataReplies.findIndex(s => s === key) === -1) {
                this.appState.pendingDataReplies.push(key);
                UtilityFunctions.DebugLog(`querying eng web api service key ${key}`);
                this.appStateService.appendLog(`querying eng web api service key ${key}`, 2);
                const dataReply$ = this.engWebApiService.GetManagedDataReply(
                    dataConsumerConfig.dataPolicy,
                    this.GetParams(dataConsumerConfig));

                dataReply$.subscribe(datareply => {
                    UtilityFunctions.DebugLog(`received data reply for key ${key}`);
                    UtilityFunctions.DebugLog(`pending data replies: ${JSON.stringify(this.appState.pendingDataReplies)}`);
                    const idx = this.appState.pendingDataReplies.findIndex(s => s === key);
                    if (idx > -1) {
                        UtilityFunctions.DebugLog(`reply for key ${key} was received and removed from pendingDataReplies`);
                        this.appState.pendingDataReplies.splice(idx, 1);
                    } else {
                        UtilityFunctions.DebugLog(`!!! reply for key ${key} was received but NOT in pendingDataReplies`);
                    }

                    this.appState.cachedDataReplies.upsert(key, datareply);
                    this.UpdateWidgetConfigColumns(widgetName, dataConsumerConfig, datareply);

                    this.DataAvailable.next(new DataRequestReply(key, true, datareply));
                },
                error => {
                    this.DataError.next(new DataRequestError(widgetName, dataConsumerConfig.dataPolicy, key, error));
                });
            } else {
                this.DataAvailable.subscribe(reply => {
                    if (reply.RequestKey === key) {
                        this.UpdateWidgetConfigColumns(widgetName, dataConsumerConfig, reply.ImmediateManagedDataReply);
                    }
                });
                UtilityFunctions.DebugLog(`pending request for web api service key ${key} already exists`);
            }


            return new DataRequestReply(key, false, undefined);
        }
    }

    RaiseToast(message: string) {
        this.Toast.next(message);
    }
}

// Basically constant strings used through this service and related components to specify what kind
// of state change occured.
export class Events {
    public static get SIDE_NAV_CHANGED(): string { return 'SIDE_NAV_CHANGED'; };
    public static get SIDE_NAV_DISPLAYED_CHANGED(): string { return 'SIDE_NAV_DISPLAYED_CHANGED'; };
    public static get SIDE_NAV_FILTER_CHANGED(): string { return 'SIDE_NAV_FILTER_CHANGED'; };
    public static get CURRENT_CONTEXT_CHANGED(): string { return 'CURRENT_CONTEXT_CHANGED'; };
    public static get CURRENT_SORTS_CHANGED(): string { return 'CURRENT_SORTS_CHANGED'; };
    public static get CURRENT_FILTERS_CHANGED(): string { return 'CURRENT_FILTERS_CHANGED'; };
    public static get WIDGET_CONFIG_LIST_CHANGED(): string { return 'WIDGET_CONFIG_LIST_CHANGED'; };
    public static get WIDTH_CLASS_CHANGED(): string { return 'WIDTH_CLASS_CHANGED'; };
    public static get USER_CHANGED(): string { return 'USER_CHANGED'; };
    public static get MESSAGE_PUBLISHED(): string { return 'MESSAGE_PUBLISHED'; };
}

export class UrlConstants {
    public static get SIDENAV_NAME(): string { return 'd.nav'; };
    public static get SIDENAV_FILTER(): string { return 'd.filter'; };
    public static get SIDENAV_SHOW(): string { return 'd.showSideNav'; };
    public static get WIDGETS_PER_ROW(): string { return 'd.perRow'; };
}

export class CacheConstants {
    public static get DEFAULT(): string { return 'default'; };
    public static get NEVER(): string { return 'never'; };
    public static get PERMANENT(): string { return 'permanent'; };
}