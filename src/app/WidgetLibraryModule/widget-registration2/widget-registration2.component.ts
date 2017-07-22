import { Component, OnInit, Input } from '@angular/core';

import { NameIndex, NameValue, WidgetConfiguration } from 'app/common/interfaces/WidgetInterfaces';
import { WidgetGroup, WidgetRegistration } from 'app/common/interfaces/UserInterfaces';
import { UtilityFunctions } from 'app/common/classes/UtilityFunctions';

import { DisplayStateService } from 'app/common/services/DisplayStateService';

@Component({
  selector: 'app-widget-registration2',
  templateUrl: './widget-registration2.component.html',
  styleUrls: ['./widget-registration2.component.css']
})
export class WidgetRegistration2Component implements OnInit {

  heightSpecValues: NameValue[] = [
    { name: 'short', value: '1' },
    { name: 'medium', value: '2' },
    { name: 'tall', value: '3' },
    { name: 'auto', value: '*' }];

   widthSpecValues: NameValue[] = [
    { name: '1/4', value: '1' },
    { name: '1/3', value: '2' },
    { name: '1/2', value: '3' },
    { name: '2/3', value: '4' },
    { name: 'full', value: '5' }];

  // current matching widgets regardless of what the user does
  matchingWidgetsSource: WidgetConfiguration[];

  // matching widgets state while user is making changes
  matchingWidgets: WidgetConfiguration[];

  // Copy of current widget registration that user can change without 
  // affecting anything else
  widgetRegistrationCopy: WidgetRegistration;

  constructor(private displayStateService: DisplayStateService) { }

  Initialize(matchingWidgets: WidgetConfiguration[]) {
    this.matchingWidgetsSource = matchingWidgets;
    this.matchingWidgets = matchingWidgets;
    this.Reset();
  }

  Reset() {
    this.matchingWidgetsSource = this.matchingWidgets;

    if (this.displayStateService.appState.current.userStatistics === undefined ||
      this.displayStateService.appState.current.userStatistics.widgetRegistration === undefined) {
      this.widgetRegistrationCopy = undefined;
      return;
    }
    this.widgetRegCopyLocal();
  }

  private widgetRegCopyLocal() {
    this.widgetRegistrationCopy = { excludedWidgets: [], groupedWidgets: [] };
    // Copy excluded widgets
    if (this.displayStateService.appState.current.userStatistics.widgetRegistration.excludedWidgets !== undefined) {
      this.widgetRegistrationCopy.excludedWidgets =
        [... this.displayStateService.appState.current.userStatistics.widgetRegistration.excludedWidgets];
    }
    // copy grouped widgets
    if (this.displayStateService.appState.current.userStatistics.widgetRegistration.groupedWidgets !== undefined) {
      this.widgetRegistrationCopy.groupedWidgets = [];
      this.displayStateService.appState.current.userStatistics.widgetRegistration.groupedWidgets.forEach(gw => {
        this.widgetRegistrationCopy.groupedWidgets.push(
          { index: gw.index, widgets: [], heightSpec: gw.heightSpec, widthSpec: gw.widthSpec, contextKey: gw.contextKey }
        );
        gw.widgets.forEach(w => {
          this.widgetRegistrationCopy.groupedWidgets[this.widgetRegistrationCopy.groupedWidgets.length - 1]
            .widgets.push({ index: w.index, name: w.name });
        });
      });
    }

    // Normalize order/indexes
    this.NormalizeIndexes();
  }

  GroupHeightChange(group: WidgetGroup, newValue: string) {
    group.heightSpec = newValue;
  }

  GroupWidthChange(group: WidgetGroup, newValue: string) {
    group.widthSpec = newValue;
  }

  ContextMatchedGroups(): WidgetGroup[] {
    return UtilityFunctions.ContextMatchedGroups(this.widgetRegistrationCopy, this.displayStateService.appState.current.context);
  }

  GroupWidgetsToDisplay(): WidgetGroup[] {
    if (this.widgetRegistrationCopy === undefined || this.widgetRegistrationCopy.groupedWidgets === undefined) {
      return [];
    } else {
      return this.ContextMatchedGroups()
        .filter(gw => this.WidgetsFor(gw).length > 0)
    }
  }

  CanGroupUp(widgetGroup: WidgetGroup): boolean {
    return this.GroupWidgetsToDisplay().findIndex(x => x.index === widgetGroup.index) > 0;
  }
  GroupUp(widgetGroup: WidgetGroup) {
    const positionIndex = this.GroupWidgetsToDisplay().findIndex(x => x.index === widgetGroup.index);
    if (positionIndex > 0) {
      const newIndex = this.GroupWidgetsToDisplay()[positionIndex - 1].index;
      this.GroupWidgetsToDisplay()[positionIndex - 1].index = widgetGroup.index;
      widgetGroup.index = newIndex;
      this.NormalizeIndexes();
    }
  }

  CanGroupDown(widgetGroup: WidgetGroup): boolean {
    return this.GroupWidgetsToDisplay().findIndex(x => x.index === widgetGroup.index) < this.GroupWidgetsToDisplay().length - 1;
  }

  GroupDown(widgetGroup: WidgetGroup) {
    const positionIndex = this.GroupWidgetsToDisplay().findIndex(x => x.index === widgetGroup.index);
    if (positionIndex < this.GroupWidgetsToDisplay().length - 1) {
      const newIndex = this.GroupWidgetsToDisplay()[positionIndex + 1].index;
      this.GroupWidgetsToDisplay()[positionIndex + 1].index = widgetGroup.index;
      widgetGroup.index = newIndex;
      this.NormalizeIndexes();
    }
  }

  CanWidgetUp(group: WidgetGroup, widgetNI: NameIndex): boolean {
    return group.widgets.findIndex(ni => ni.name === widgetNI.name) > 0
  }

  WidgetUp(group: WidgetGroup, widgetNI: NameIndex) {
    const positionIndex = group.widgets.findIndex(ni => ni.name === widgetNI.name);
    if (positionIndex > 0) {
      const newIndex = group.widgets[positionIndex - 1].index;
      group.widgets[positionIndex - 1].index = group.widgets[positionIndex].index;
      group.widgets[positionIndex].index = newIndex;
      this.NormalizeIndexes();
    }

  }

  CanWidgetDown(group: WidgetGroup, widgetNI: NameIndex): boolean {
    return group.widgets.findIndex(ni => ni.name === widgetNI.name) < group.widgets.length - 1;
  }

  WidgetDown(group: WidgetGroup, widgetNI: NameIndex) {
    const positionIndex = group.widgets.findIndex(ni => ni.name === widgetNI.name);
    if (positionIndex < group.widgets.length - 1) {
      const newIndex = group.widgets[positionIndex + 1].index;
      group.widgets[positionIndex + 1].index = group.widgets[positionIndex].index;
      group.widgets[positionIndex].index = newIndex;
      this.NormalizeIndexes();
    }
  }

  NormalizeIndexes() {
    const groups = this.ContextMatchedGroups();

    // Sort all widgets first by context key then index
    this.widgetRegistrationCopy.groupedWidgets =
      this.widgetRegistrationCopy.groupedWidgets.sort((a, b) => {
        const first = a.contextKey.localeCompare(b.contextKey);
        return first === 0 ? a.index - b.index : first;
      });

    // Reset index value 
    this.widgetRegistrationCopy.groupedWidgets.forEach((gw, i) => {
      if (i > 0) {
        if (this.widgetRegistrationCopy.groupedWidgets[i - 1].contextKey !== gw.contextKey) {
          gw.index = 1;
        } else {
          gw.index = this.widgetRegistrationCopy.groupedWidgets[i - 1].index + 1;
        }
      }

      // sort this groups widgets and reset index value
      gw.widgets = gw.widgets.sort((a, b) => { return a.index - b.index; });
      gw.widgets.forEach((name, widgetIdx) => { name.index = widgetIdx + 1; });
    });
  }

  UnavailableWidgets(): WidgetConfiguration[] {

    if (this.matchingWidgets === undefined) {
      return [];
    }

    return this.matchingWidgets.filter(wc =>
      this.widgetRegistrationCopy.excludedWidgets.indexOf(wc.name) > -1);
  }

  AvailableWidgets(): WidgetConfiguration[] {
    if (this.matchingWidgets === undefined) {
      return [];
    }

    return this.matchingWidgets.filter(wc =>
      this.widgetRegistrationCopy.excludedWidgets.indexOf(wc.name) === -1);
  }

  AddToNewGroup(wConfig: WidgetConfiguration) {
    this._removeFromExcluded(wConfig.name);
    this._removeFromAllGroups(wConfig.name);
    const availableWidgets = this.AvailableWidgets();

    // Find the first actual group with no current widgets
    const index = this.ContextMatchedGroups()
      .findIndex(gw => this.WidgetsFor(gw).length === 0);

    if (index === -1) {
      this.NewGroup().widgets.push({ name: wConfig.name, index: 1 });
    } else {
      this.ContextMatchedGroups()[index].widgets.push({ name: wConfig.name, index: 1 });
    }

  }

  AddToGroup(wConfig: WidgetConfiguration, widgetGroup: WidgetGroup) {
    this._removeFromExcluded(wConfig.name);
    this._removeFromAllGroups(wConfig.name);
    const index = widgetGroup.widgets.findIndex(x => x.name === wConfig.name);
    if (index === -1) {
      const nextIndex = widgetGroup.widgets.reduce<number>((p, c) => { return c.index >= p ? c.index + 1 : p; }, 1);
      widgetGroup.widgets.push({ name: wConfig.name, index: nextIndex });
    }
  }

  AddToUngrouped(wConfig: WidgetConfiguration) {
    this._removeFromAllGroups(wConfig.name);
    this._removeFromExcluded(wConfig.name);
    this.AddToMatching(wConfig);
  }

  AddToExcluded(wConfig: WidgetConfiguration) {
    this._removeFromAllGroups(wConfig.name);
    this._removeFromExcluded(wConfig.name);
    this.widgetRegistrationCopy.excludedWidgets.push(wConfig.name);
  }

  ClearGroup(widgetGroup: WidgetGroup) {
    const inScopeWidgets = this.WidgetsFor(widgetGroup);;
    inScopeWidgets.forEach(w => { this._removeFromGroup(w, widgetGroup); });
  }

  private _removeFromAllGroups(widgetName: string) {
    this.ContextMatchedGroups().forEach((gw, i) => { this._removeFromGroup(widgetName, gw); });
  }

  private _removeFromGroup(widgetName: string, widgetGroup: WidgetGroup) {
    const idx = widgetGroup.widgets.findIndex(x => x.name === widgetName);
    if (idx > -1) {
      widgetGroup.widgets.splice(idx, 1);
    }
  }

  private _removeFromExcluded(widgetName: string) {
    const idx = this.widgetRegistrationCopy.excludedWidgets.findIndex(x => x === widgetName);
    if (idx > -1) {
      this.widgetRegistrationCopy.excludedWidgets.splice(idx, 1);
    }
  }


  NewGroup(): WidgetGroup {
    const currentContextKeys = Object.keys(this.displayStateService.appState.current.context).sort().join('|');
    const nextGroupIndex =
      this.ContextMatchedGroups().reduce<number>((p, c) => { return c.index >= p ? c.index + 1 : p; }, 1);
    const ret: WidgetGroup = { index: nextGroupIndex, widgets: [], widthSpec: '*', heightSpec: '*', contextKey: currentContextKeys };
    this.widgetRegistrationCopy.groupedWidgets.push(ret);
    return ret;
  }

  AddToMatching(wConfig: WidgetConfiguration) {
    const idx = this.matchingWidgets.findIndex(x => x.name === wConfig.name);
    if (idx === -1) {
      this.matchingWidgets.push(wConfig);
    }
  }

  ngOnInit() {
    this.Reset();
  }

  WidgetIsGrouped(widgetName: string) {

    for (let i = 0; i < this.ContextMatchedGroups().length; i++) {
      if (this.WidgetIsInGroup(widgetName, this.ContextMatchedGroups()[i])) {
        return true;
      }
    }
    return false;
  }

  WidgetIsInGroup(widgetName: string, widgetGroup: WidgetGroup) {
    return widgetGroup.widgets.findIndex(x => x.name === widgetName) > -1;
  }

  WidgetNameIndexesFor(widgetGroup: WidgetGroup) : NameIndex[] {
    return widgetGroup.widgets
      .filter(w => this.matchingWidgets.findIndex(rw => rw.name === w.name) > -1)
      .sort((a, b) => { return a.index - b.index; })
  }

  WidgetsFor(widgetGroup: WidgetGroup): string[] {
    return this.WidgetNameIndexesFor(widgetGroup).map(x => x.name);
  }

  Save() {
    this.displayStateService.appState.current.userStatistics.widgetRegistration = this.widgetRegistrationCopy;

    this.displayStateService.appState.current.userStatistics.widgetRegistration.groupedWidgets =
      this.displayStateService.appState.current.userStatistics.widgetRegistration.groupedWidgets
        .filter(gw => gw.widgets.length > 0);
    this.displayStateService.SaveUserStats();

  }
}
