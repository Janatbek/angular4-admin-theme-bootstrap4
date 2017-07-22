import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';

import 'rxjs/add/operator/filter';
import { Subscription } from 'rxjs/Subscription';

import { DisplayStateService, Events } from 'app/common/services/DisplayStateService';
import { WidgetConfiguration, NameValue } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {

  WidgetConfiguration: WidgetConfiguration;
  selectedConfig: string;
  statechanged$: Subscription;
  filter = '';

  ready = false;


  constructor(public DisplayStateService: DisplayStateService) {
  }

  ngOnInit() {

    // this.DisplayStateService.appState.sideNavWidgetConfig.widgetNameList[0].name
    // this.DisplayStateService.appState.sideNavConfig.widgetNameList[0].name

    // this.ApplySideNav();
    this.statechanged$ = this.DisplayStateService.AppStateChanged.subscribe( event => {
      switch (event) {
        case Events.SIDE_NAV_CHANGED: {
          this.ready = false;
          this.selectedConfig = this.DisplayStateService.appState.current.sideNav.displayName;
          this.ApplySideNav();
        }
      }
    });
  }

  toggleSideNav() {
    this.DisplayStateService.ToggleNavDisplay()
  }

  private ApplySideNav() {
    // console.log(`SideNavComponent: ApplySideNav`);
    this.filter = this.DisplayStateService.appState.current.sideNav.filter;
    this.WidgetConfiguration = undefined;
    const widgetConfig =
      this.DisplayStateService.appState.widgetConfigList.find( wc =>
        wc.name === this.DisplayStateService.appState.current.sideNav.widgetName);

    if (widgetConfig !== undefined) {
      // console.log(`SideNavComponent: this.WidgetConfiguration = ${widgetConfig.name}`);
      this.WidgetConfiguration = widgetConfig;
      this.DisplayStateService.UserStatsIncrement(
        this.DisplayStateService.appState.current.userStatistics.sideNavUsageStatistics,
        widgetConfig.name,
        true);
    } else {
      // console.log(`Couldn't locate widget config by the name of ${this.DisplayStateService.appState.current.sideNav.widgetName}`)
    }
  }

  OnDestroy() {
    this.statechanged$.unsubscribe();
  }

  onSelectChange() {
      this.filter = '';
      this.ready = false;
      this.DisplayStateService.RouteSideNav(this.selectedConfig);
      this.DisplayStateService.RouteSideNavFilter('');
  }



}
