import { Params } from '@angular/router';
import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import 'rxjs/add/operator/filter';
import { Subscription } from 'rxjs/Subscription';

import {
  WidgetRegistration2Component
} from 'app/WidgetLibraryModule/widget-registration2/widget-registration2.component';

import { DisplayStateService, Events } from 'app/common/services/DisplayStateService';

import { WidgetRegistration, WidgetGroup } from 'app/common/interfaces/UserInterfaces';

import { WidgetConfiguration, NameValue } from 'app/common/interfaces/WidgetInterfaces';

import { DataSetFilter, FilterSpec } from 'app/common/classes/DataSetFilter';
import { UtilityFunctions } from 'app/common/classes/UtilityFunctions';

class BreadCrumb {
  name: string;
  display: string;
  constructor(name: string, display: string) {
    this.name = name;
    this.display = display;
  }
}

class WidgetDisplayGroup {
  ordinal: number;
  widgetList: OrderedWidget[] = [];
  sourcewidgetGroup: WidgetGroup;
  constructor(groupNumber: number, sourcewidgetGroup: WidgetGroup) {
    this.ordinal = groupNumber;
    this.sourcewidgetGroup = sourcewidgetGroup;
  }
}
class OrderedWidget {
  widgetConfiguration: WidgetConfiguration;
  index: number;
  constructor(widgetConfiguration: WidgetConfiguration, index: number) {
    this.widgetConfiguration = widgetConfiguration;
    this.index = index;
  }
}

declare var $: any;

@Component({
  selector: 'app-group-display',
  templateUrl: './group-display.component.html',
  // template: TemplateGenerator.getTemplateHtml(),
  styleUrls: ['./group-display.component.css']
})
export class GroupDisplayComponent implements OnInit, OnDestroy {

  @ViewChild(WidgetRegistration2Component)
  private widgetRegistration2Component: WidgetRegistration2Component;

  contextBreadCrumbs: BreadCrumb[];
  filterBreadCrumbs: BreadCrumb[];
  sortBreadCrumbs: BreadCrumb[];
  randomIdx = 0;
  statechanged$: Subscription;
  matchingWidgetConfigs: WidgetConfiguration[] = [];
  widgetToggleClass: string[] = [];
  width = 'col-md-12';

  widgetDisplayGroups: WidgetDisplayGroup[] = [];
  tempWidgetDisplayGroup: WidgetDisplayGroup[] = [];

  constructor(private DisplayStateService: DisplayStateService,
    public toastr: ToastsManager,
    vcr: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(vcr);
    this.DisplayStateService.DataError.subscribe(error => {
      this.toastr.error(error.ErrorMessage, `${error.widgetName} error retrieving data '${error.dataPolicy}'`);

    });
    this.DisplayStateService.Toast.subscribe(message => {
      this.toastr.info(message);
    });

  }

  ngOnInit() {
    this.width = this.DisplayStateService.appState.current.widthClass;

    this.DisplayStateService.MessageHouse.subscribe(x => {
      if (Object.keys(x).indexOf('ShowConfigureWidgetLayout') > -1) {
        $('#widgetSelectionModal').modal('show');
      }
    });

    this.statechanged$ = this.DisplayStateService.AppStateChanged.subscribe(x => {
      if (x === Events.CURRENT_CONTEXT_CHANGED || x === Events.CURRENT_FILTERS_CHANGED) {
        this.BuildDisplay();
      }
      if (x === Events.CURRENT_SORTS_CHANGED) {
        this.BuildBreadCrumbs();
      }
      if (x === Events.WIDGET_CONFIG_LIST_CHANGED) {
        this.widgetDisplayGroups = [];
        this.BuildDisplay();
      }
      if (x === Events.WIDTH_CLASS_CHANGED) {
        this.SetWidth();
      }
      if (x === Events.WIDGET_CONFIG_LIST_CHANGED) {
        UtilityFunctions.DebugLog('GroupDisplayComponent: Received Events.WIDGET_CONFIG_LIST_CHANGED');
        this.BuildDisplay();
      }
    });
  }

  SaveLayout() {
    this.widgetRegistration2Component.Save();
    this.BuildDisplay();
  }

  NewGroup() {
    this.widgetRegistration2Component.NewGroup();
  }

  ResetLayout() {
    this.widgetRegistration2Component.Initialize(this.matchingWidgetConfigs);
  }

  WidthOf(g: WidgetDisplayGroup) {
    if (g.sourcewidgetGroup === undefined) {
      return this.width;
    } else if (g.sourcewidgetGroup.widthSpec === '5') {
      return 'col-md-12';
    } else if (g.sourcewidgetGroup.widthSpec === '4') {
      return 'col-md-8';
    } else if (g.sourcewidgetGroup.widthSpec === '3') {
      return 'col-md-6';
    } else if (g.sourcewidgetGroup.widthSpec === '2') {
      return 'col-md-4';
    } else if (g.sourcewidgetGroup.widthSpec === '1') {
      return 'col-md-3';
    }

  }

  onCollapse(g: WidgetDisplayGroup) {

  }

  HeightOf(g: WidgetDisplayGroup) {
    if (g.sourcewidgetGroup === undefined) {
      return 'auto';
    } else if (g.sourcewidgetGroup.heightSpec === '*') {
      return 'auto';
    } else if (g.sourcewidgetGroup.heightSpec === '3') {
      return 'calc(100vh - 180px)';
    } else if (g.sourcewidgetGroup.heightSpec === '2') {
      return '40vh';
    } else if (g.sourcewidgetGroup.heightSpec === '1') {
      return '25vh';
    }
  }

  SetWidth() {
    if (this.matchingWidgetConfigs.length < Number(this.DisplayStateService.appState.current.perRow)) {
      if (this.matchingWidgetConfigs.length === 1) {
        this.width = 'col-md-12';
      } else if (this.matchingWidgetConfigs.length === 2) {
        this.width = 'col-md-6';
      } else if (this.matchingWidgetConfigs.length === 3) {
        this.width = 'col-md-4';
      } else {
        this.width = this.DisplayStateService.appState.current.widthClass;
      }
    } else {
      this.width = this.DisplayStateService.appState.current.widthClass;
    }
  }

  ngOnDestroy() {
    this.statechanged$.unsubscribe();
  }

  DeleteContext(s: string) {
    this.DisplayStateService.RemoveContext(s);
  }

  DeleteFilter(s: string) {
    this.DisplayStateService.RemoveFilter(s);
  }

  DeleteSort(s: string) {
    this.DisplayStateService.RemoveSort(s);
  }

  private BuildBreadCrumbs() {

    let t: BreadCrumb[] = [];
    for (const key of Object.keys(this.DisplayStateService.appState.current.context)) {
      t.push(new BreadCrumb(key, `${key}: ${this.DisplayStateService.appState.current.context[key]}`));
    }
    this.contextBreadCrumbs = t.slice();

    t = [];
    FilterSpec.FromFilters(this.DisplayStateService.appState.current.filters).forEach(fs => {
      t.push(new BreadCrumb(fs.column, fs.formattedWhereClause));
    });
    this.filterBreadCrumbs = t.slice();

    t = [];
    Object.keys(this.DisplayStateService.appState.current.sorts).forEach(sk => {
      t.push(new BreadCrumb(sk, `${sk} (${this.DisplayStateService.appState.current.sorts[sk]})`));
    });
    this.sortBreadCrumbs = t.slice();
  }

  private WidgetDecision(wr: WidgetRegistration, wConfig: WidgetConfiguration, ctxt: Params) {
    if (UtilityFunctions.MatchWidgetConfiguration(ctxt, wConfig)) {

      this.matchingWidgetConfigs.push(wConfig);

      if (!this.IsExcludedWidget(wr, wConfig)) {
        this.DisplayStateService.UserStatsIncrement(
          this.DisplayStateService.appState.current.userStatistics.widgetUsageStatistics,
          wConfig.name,
          false);

        const groupedWidget = this.IsGroupedWidget(wr, wConfig);
        if (groupedWidget !== undefined) {
          const orderedWidget = new OrderedWidget(wConfig, groupedWidget.widgets.find(w => w.name === wConfig.name).index);
          let groupIndex = this.tempWidgetDisplayGroup.findIndex(x => x.ordinal === groupedWidget.index);
          if (groupIndex === -1) {
            this.tempWidgetDisplayGroup.push(new WidgetDisplayGroup(groupedWidget.index, groupedWidget));
            groupIndex = this.tempWidgetDisplayGroup.length - 1;
          }
          this.tempWidgetDisplayGroup[groupIndex].widgetList.push(orderedWidget);
        } else {
          const orderedWidget = new OrderedWidget(wConfig, 1);
          let maxOrdinal = this.tempWidgetDisplayGroup.reduce<number>(
            (p, c, i) => { return p > c.ordinal ? p : c.ordinal; }, -1);

          maxOrdinal = maxOrdinal < 999 ? 999 : maxOrdinal + 1;

          let groupIndex = this.tempWidgetDisplayGroup.findIndex(x => x.ordinal === maxOrdinal);
          if (groupIndex === -1) {
            this.tempWidgetDisplayGroup.push(new WidgetDisplayGroup(maxOrdinal, undefined));
            groupIndex = this.tempWidgetDisplayGroup.length - 1;
          }
          this.tempWidgetDisplayGroup[groupIndex].widgetList.push(orderedWidget);
        }
      }
    }
  }

  private IsGroupedWidget(wr: WidgetRegistration, wConfig: WidgetConfiguration): WidgetGroup {

    if (wr !== undefined && wr.groupedWidgets !== undefined) {
      return this.ContextMatchedGroups(wr).find(wg => wg.widgets.findIndex(ni => ni.name === wConfig.name) > -1);
    } else {
      return undefined;
    }
  }


  ContextMatchedGroups(wr: WidgetRegistration): WidgetGroup[] {
    return UtilityFunctions.ContextMatchedGroups(wr, this.DisplayStateService.appState.current.context);
  }

  private IsExcludedWidget(wr: WidgetRegistration, wConfig: WidgetConfiguration): boolean {
    if (wr !== undefined && wr.excludedWidgets !== undefined && wr.excludedWidgets.indexOf(wConfig.name) > -1) {
      return true;
    } else {
      return false;
    }
  }

  private BuildDisplay() {
    this.BuildBreadCrumbs();

    const matching: WidgetConfiguration[] = [];
    this.widgetToggleClass = [];
    const ctxt = this.DisplayStateService.appState.current.context;

    this.matchingWidgetConfigs = [];
    this.tempWidgetDisplayGroup = [];

    this.DisplayStateService.appState.widgetConfigList.forEach(widgetConfig => {
      this.WidgetDecision(this.DisplayStateService.appState.current.userStatistics.widgetRegistration, widgetConfig, ctxt);
    });

    // Sort
    this.tempWidgetDisplayGroup = this.tempWidgetDisplayGroup.sort((a, b) => { return a.ordinal - b.ordinal; });
    this.tempWidgetDisplayGroup.forEach(wtg => {
      wtg.widgetList = wtg.widgetList.sort((a, b) => { return a.index - b.index; });
    });


    // Add fake ones if there aren't any real ones.
    if (this.tempWidgetDisplayGroup.length === 0 && Object.keys(this.DisplayStateService.appState.current.context).length > 0) {
      // this.AddSomeFakeOnes(this.tempWidgetDisplayGroup);
    } else {
      this.DisplayStateService.SaveUserStats();
    }

    // Check if the new list is different than current and, if so, rebind
    this.CheckDifferences();
    this.ResetLayout();
    // console.log(JSON.stringify(this.tempWidgetDisplayGroup, null, 2));
    this.SetWidth();
  }

  AddSomeFakeOnes(tempWidgetDisplayGroup: WidgetDisplayGroup[]) {
    const extraGroups = 1 + (Math.random() * 4);
    for (let i = 0; i < extraGroups; i++) {
      const g = new WidgetDisplayGroup(i, undefined);
      const widgetCount = 1 + (Math.random() * 1);
      for (let j = 0; j < widgetCount; j++) {
        g.widgetList.push(new OrderedWidget(this.CreateRandomWidget(`Example widget${i}.${j}`), 1));
      }
      this.tempWidgetDisplayGroup.push(g);
    }
  }

  CheckDifferences() {
    if (this.tempWidgetDisplayGroup.length !== this.widgetDisplayGroups.length) {
      this.widgetDisplayGroups = this.tempWidgetDisplayGroup;
    } else {
      for (let i = 0; i < this.tempWidgetDisplayGroup.length; i++) {
        if (this.widgetDisplayGroups[i].ordinal !== this.tempWidgetDisplayGroup[i].ordinal) {
          this.widgetDisplayGroups = this.tempWidgetDisplayGroup;
          return;
        }

        if (this.widgetDisplayGroups[i].sourcewidgetGroup !== this.tempWidgetDisplayGroup[i].sourcewidgetGroup) {
          console.log('sourcewidgetGroup difference');
          this.widgetDisplayGroups = this.tempWidgetDisplayGroup;
          return;
        }


        if (this.widgetDisplayGroups[i].widgetList.length !== this.tempWidgetDisplayGroup[i].widgetList.length) {
          this.widgetDisplayGroups = this.tempWidgetDisplayGroup;
          return;
        }
        for (let j = 0; j < this.widgetDisplayGroups[i].widgetList.length; j++) {
          const existingOrderedWidget = this.widgetDisplayGroups[i].widgetList[j];
          const newOrderedWidget = this.tempWidgetDisplayGroup[i].widgetList[j];
          if (existingOrderedWidget.widgetConfiguration.name !== newOrderedWidget.widgetConfiguration.name) {
            this.widgetDisplayGroups = this.tempWidgetDisplayGroup;
            return;
          }
        }
      }
    }
  }

  CreateRandomWidget(displayName: string): WidgetConfiguration {

    const fakeConfig: WidgetConfiguration = {
      name: displayName,
      supportMessage: 'Contact ITENGWEB for support',
      componentType: 'RandomChartWidget',
      description: 'xample chart based on fake cached data from platform middleware',
      dataConsumerConfiguration: { dataPolicy: 'none' },
      contextMatchingRules: []
    };

    return fakeConfig;
  }

  widgetClassFor(idx: number): string {
    return this.widgetToggleClass[idx];
  }

  ToggleWidgetClass(idx: number) {
    const copy = [... this.widgetToggleClass];
    copy[idx] = copy[idx] === 'window-minimize' ? 'window-maximize' : 'window-minimize';
    this.widgetToggleClass = [...copy];
  }
}
