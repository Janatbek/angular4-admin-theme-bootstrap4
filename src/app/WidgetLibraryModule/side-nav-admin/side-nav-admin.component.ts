import { Component, OnInit, Input } from '@angular/core';
import { Params } from '@angular/router';

import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';
import { DisplayStateService, Events } from 'app/common/services/DisplayStateService';
import { EngWebApiService } from 'app/common/services/EngWebApiService';
import { AppStateService } from 'app/common/services/AppStateService';
import { AppDisplayState, SideNavWidgetConfig } from 'app/common/interfaces/DisplayInterfaces';
import { DataConsumerConfiguration, WidgetConfiguration, NameValue } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-side-nav-admin',
  templateUrl: './side-nav-admin.component.html',
  styleUrls: ['./side-nav-admin.component.css']
})
export class SideNavAdminComponent extends BaseWidget {

  availableWidgetNames: string[] = undefined;
  selectedSideNav: NameValue;

  SelectSideNav() {

    const messageParams: Params = [];
    messageParams['widgetName'] = this.selectedSideNav.name;
    this.displayStateService.MessageHouse.next(messageParams);

  }

  onInitialize() {
    this.InitializeFromWidgetConfigList();
  }

  onStateChanged(eventName: string) {
    // If this widget is displayed right when the app starts, the display state service may not have gotten all its config retrieved
    if (eventName === Events.SIDE_NAV_CHANGED) {
      this.InitializeFromWidgetConfigList();
    }
  }

  AvailableWidgetsForSelect(currentName: string) {
    if (currentName !== undefined && currentName.length > 0) {
      return [... this.availableWidgetNames, currentName];
    } else {
      return [... this.availableWidgetNames];
    }
  }

  Delete(widgetName: string) {
    const idx = this.displayStateService.appState.sideNavWidgetConfig.widgetNameList.findIndex(wc => wc.name === widgetName);
    this.displayStateService.appState.sideNavWidgetConfig.widgetNameList.splice(idx, 1);
  }

  InitializeFromWidgetConfigList() {

    if (this.displayStateService.appState === undefined) {
      return;
    }

    if (this.displayStateService.appState.widgetConfigList === undefined) {
      return;
    }

    if (this.displayStateService.appState.sideNavWidgetConfig === undefined) {
      return;
    }

    this.availableWidgetNames = this.displayStateService.appState.widgetConfigList
      .filter( wc => {
        return this.displayStateService.appState.sideNavWidgetConfig.widgetNameList.findIndex(s => s.name === wc.name) === -1;
      })
      .map(wc => wc.name);

      if (this.displayStateService.appState.sideNavWidgetConfig.widgetNameList.length > 0) {
        this.selectedSideNav = this.displayStateService.appState.sideNavWidgetConfig.widgetNameList[0];
        this.SelectSideNav();
      }
  }

  Add() {
    this.displayStateService.appState.sideNavWidgetConfig.widgetNameList.push({name: '', value: 'select an existing widget above, then change this'});
    this.selectedSideNav =
            this.displayStateService.appState.sideNavWidgetConfig.widgetNameList[
              this.displayStateService.appState.sideNavWidgetConfig.widgetNameList.length - 1
            ];
    this.SelectSideNav();
  }
}
