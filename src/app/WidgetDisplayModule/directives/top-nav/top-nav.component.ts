import { Params } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { DisplayStateService, CacheConstants, Events } from 'app/common/services/DisplayStateService';
import { NameValue, ManagedDataReply } from 'app/common/interfaces/WidgetInterfaces';
import { Dictionary } from 'app/common/classes/UtilityFunctions';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']

})
export class TopNavComponent implements OnInit, OnDestroy {

  sideNavToggle: boolean;

  statechanged$: Subscription;

  User: string;
  isAdmin = false;

  widgetsPerRowList: NameValue[] = [
    {name: '1', value: ''},
    {name: '2', value: ''},
    {name: '3', value: ''},
    {name: '4', value: ''}
  ];

  cachePolicyList: NameValue[] = [
    {name: CacheConstants.DEFAULT, value: 'Use default widget cache policy'},
    {name: CacheConstants.PERMANENT, value: 'Always Use cache'},
    {name: CacheConstants.NEVER, value: 'Never use cache'},
  ];

  constructor(public DisplayStateService: DisplayStateService) { }

  ngOnInit() {

    if (this.DisplayStateService.appState.current.user !== undefined) {
      this.User = this.DisplayStateService.appState.current.user.userName;
      this.isAdmin = this.DisplayStateService.appState.current.userIsAdmin;
    }
    this.statechanged$ = this.DisplayStateService.AppStateChanged.subscribe( x => {
      if (x === Events.USER_CHANGED) {
        this.User = this.DisplayStateService.appState.current.user.userName;
        this.isAdmin = this.DisplayStateService.appState.current.userIsAdmin;
      }

    });
  }

  Refresh() {
    location.reload();
  }

  QuickLink(linkName: string) {
    const newContext: Params = [];

    if (linkName.toLowerCase() === 'diagnostics') {
      newContext['Source'] = 'Admin';
      newContext['Category'] = 'Help';
      newContext['Module'] = 'Diagnostics';
      this.DisplayStateService.SetContext(newContext);
    } else if (linkName.toLowerCase() === 'widgetstore') {
      newContext['Source'] = 'Admin';
      newContext['Category'] = 'Actions';
      newContext['Module'] = 'User Config';
      this.DisplayStateService.SetContext(newContext);
    } else if (linkName.toLowerCase() === 'cachedatareport') {
      newContext['Source'] = 'Admin';
      newContext['Category'] = 'Cache';
      newContext['Module'] = 'Cached Data Report';
      this.DisplayStateService.SetContext(newContext);
    } else if (linkName.toLowerCase() === 'platformconfig') {
      newContext['Source'] = 'Admin';
      newContext['Category'] = 'Actions';
      newContext['Module'] = 'Platform Config';
      this.DisplayStateService.SetContext(newContext);
    }
  }

  SetAdminRights(setting: boolean)
  {
    this.DisplayStateService.appState.current.userIsAdmin = setting;
  }

  ngOnDestroy() {

    this.statechanged$.unsubscribe();
  }

  toggleNav() {
    if (this.DisplayStateService.appState.current.sideNav.displayState === 'show') {
      this.DisplayStateService.RouteSideNavDisplay('hide');
    } else {
      this.DisplayStateService.RouteSideNavDisplay('show');
    }
  }

  PerRow(n: number): boolean {
    return this.DisplayStateService.appState.current.perRow === n.toString();
  }

  SetCachePolicy(name: string) {
    this.DisplayStateService.appState.current.cachePolicy = name;
  }

  RaiseAToast() {
    this.DisplayStateService.RaiseToast('Admin menu testing');
  }

  CachePolicyIs(name: string): boolean {
    return this.DisplayStateService.appState.current.cachePolicy === name;
  }
  SetWidth(perRow: string) {
    this.DisplayStateService.RouteWidgetsPerRow(perRow);
  }

  ConfigureWidgetLayout() {
    const messageParams: Params = [];
    messageParams[`ShowConfigureWidgetLayout`] = '';
    this.DisplayStateService.MessageHouse.next(messageParams);
  }

  ClearLocalCache() {
    this.DisplayStateService.ClearLocalCache();
  }

  RefreshWidgetConfiguration() {
    this.DisplayStateService.LoadWidgetConfigList();
  }

}
