import { DataRequestError } from '../../common/interfaces/DisplayInterfaces';
import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Params } from '@angular/router';

import { BaseManagedDataWidget } from 'app/common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';
import { DataSetConverter } from 'app/common/classes/DataSetConverter';
import { NameValue } from 'app/common/interfaces/WidgetInterfaces';
import { GroupedKey } from 'app/common/interfaces/DisplayInterfaces';
import { UtilityFunctions } from 'app/common/classes/UtilityFunctions';
import { Events } from 'app/common/services/DisplayStateService';

@Component({
  selector: 'app-generic-grouped-data-side-nav',
  templateUrl: './generic-grouped-data-side-nav.component.html',
  styleUrls: ['./generic-grouped-data-side-nav.component.css']
})
export class GenericGroupedDataSideNavComponent extends BaseManagedDataWidget implements OnChanges {

  GroupedKeyList: GroupedKey[] = [];
  GroupedDataSideNavConfig: GroupedDataSideNavConfig;
  displayedGroupedKeys: GroupedKey[] = [];
  levelsBelow = 0;
  selectedContext = '';
  filter = '';

  ready = false;

  toggleState = 'collapse in';
  selectionContextParam: NameValue = undefined;

  dataRequestError: DataRequestError;

  onManagedDataError(error: DataRequestError) {
    this.dataRequestError = error;
  }
  ngOnChanges(changes: SimpleChanges) {
    // console.log(`GenericGroupedDataSideNavComponent.ngOnChanges: ${JSON.stringify(changes, null, 2)}`);
    this.onInitialize();
  }

  onStateChanged(event: string) {
      if (event === Events.SIDE_NAV_FILTER_CHANGED) {
          this.buildGroupedKeysForActive();
      }
  }

  onInitialize() {
    this.GroupedDataSideNavConfig = <GroupedDataSideNavConfig> this.Config.config;
    super.onInitialize();
  }

  UpsertSelectionContextParameter() {
    if (this.GroupedDataSideNavConfig.selectionContext !== undefined) {
        if (this.selectionContextParam === undefined) {
            this.selectedContext = this.GroupedDataSideNavConfig.selectionContext.selection[0];
            this.selectionContextParam = {
                name: this.GroupedDataSideNavConfig.selectionContext.name,
                value: this.selectedContext
            };
        }

        if (this.Config.dataConsumerConfiguration.fixedParameters === undefined) {
            this.Config.dataConsumerConfiguration.fixedParameters = [];
        }
        const idx = this.Config.dataConsumerConfiguration.fixedParameters.findIndex(nv => nv.name === this.selectionContextParam.name);
        if (idx === -1) {
            this.Config.dataConsumerConfiguration.fixedParameters.push(this.selectionContextParam);
        } else {
            this.Config.dataConsumerConfiguration.fixedParameters[idx].value = this.selectedContext;
        }
        this.selectionContextParam.value = this.selectedContext;
    } else {
        this.selectionContextParam = undefined;
        this.selectedContext = '';
    }
  }

  onFilterChange(newValue: string) {
    this.filter = newValue;
    this.displayStateService.RouteSideNavFilter(newValue);
  }

  onSelectionContextChanged() {
      this.RequestData();
  }

  // adding as overrides so base class won't try to do anything to the side nav data
  onContextChanged(currentContext: Params)  { }
  onFiltersChanged(currentFilters: Params)  { }
  onSortsChanged(currentSorts: Params)      { }

  RequestData() {
    console.log(`GenericGroupedDataSideNavComponent.RequestData`)
    this.displayDataSet = undefined;
    this.ready = false;
    this.UpsertSelectionContextParameter();
    const reply = this.displayStateService.RequestWidgetData(this.Config);
    this.dataKey = reply.RequestKey;
    if (reply.Available === true) {
        this.onDataAvailable(reply);
    }
  }

  PostProcessing() {
    this.dataRequestError = undefined;
    // Data has been retrieved, grouped, sorted, filtered - time to display
    this.buildGroupedKeysForActive();
  }

  private buildGroupedKeysForActive() {
      const snc = <GroupedDataSideNavConfig> this.Config.config;

      this.GroupedKeyList  = DataSetConverter.ConvertToGroupKeys(snc.groupBy, snc.leafContext, snc.permanentContext, this.displayDataSet);

      const temp: GroupedKey[] = [... this.GroupedKeyList];
      this.FilterGroupedKeyList(temp);
      this.displayedGroupedKeys = temp;
      this.levelsBelow = snc.groupBy.length - 1;
      this.ready = true;
    }

  expand(open: boolean) {
    if (open) {
      this.toggleState = 'collapse in';
    } else {
      this.toggleState = 'collapse';
    }
  }

  // Used to filter the grouped key list displayed in the side nav based on user input.
    FilterGroupedKeyList(gkArray: GroupedKey[]) {
        let notFirst = false;

        this.displayStateService.appState.current.sideNav.filter.split('|').forEach(
            filterItem => {
                this._filterGKArray(
                    this.GroupedKeyList,
                    filterItem,
                    (this.displayStateService.appState.current.sideNav.filter.length === 0),
                    false,
                    notFirst);

                notFirst = true;
            }
        );
    }

    // recursive helper for FilterGroupedKeyList method
    private _filterGKArray(
        gkArray: GroupedKey[],
        filter: string,
        showall: boolean,
        parentVisible: boolean,
        leaveHiddenIfHidden: boolean): number {

        let filterPassCount = 0;
        gkArray.forEach(gk => {

            if (leaveHiddenIfHidden && gk.visible === false) {
                // do nothing -it's hidden and should stay that way
            } else {
                const isVisible = filter.length === 0 || gk.name.toLowerCase().indexOf(filter.toLowerCase()) > -1;

                const visibleChildCount =
                    this._filterGKArray(gk.children, filter, showall, isVisible || parentVisible, leaveHiddenIfHidden);

                const hasVisibleChildren = gk.children.length > 0 && visibleChildCount > 0;

                gk.visible =
                    showall
                    || isVisible
                    || hasVisibleChildren
                    || parentVisible
                    ;
            }
            if (gk.visible) { filterPassCount++; }
        });

        return filterPassCount;
    }
}

export class GroupedDataSideNavConfig {
    permanentContext: NameValue[];
    selectionContext?: SelectionContext;
    groupBy: string[];
    leafContext: string[];
}

export class SelectionContext {
    name: string;
    selection: string[];

}

