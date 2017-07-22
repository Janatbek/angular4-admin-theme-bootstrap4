import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';
import { ChartsModule } from 'ng2-charts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable'
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { MdSliderModule } from '@angular/material';

import {TooltipModule} from 'ngx-tooltip';
import { Ng2DragDropModule } from 'ng2-drag-drop';

import { CommonAppModule } from 'app/common/CommonAppModule';

import { GenericBaseComponent } from './generic-base/generic-base.component';
import { GenericTableComponent } from './generic-table/generic-table.component';
import { GenericChartComponent } from './generic-chart/generic-chart.component';
import { LotForecasterComponent } from './lot-forecaster/lot-forecaster.component';
import { RandomChartComponent } from './random-chart/random-chart.component';
import { NetworkDiagramComponent } from './network-diagram/network-diagram.component';
import { UserAdministrationComponent } from './user-administration/user-administration.component';
import { SideNavAdminComponent } from './side-nav-admin/side-nav-admin.component';
import { DataPolicyAdminComponent } from './data-policy-admin/data-policy-admin.component';
import { CacheDataAdminComponent } from './cache-data-admin/cache-data-admin.component';
import { WidgetAdminComponent } from './widget-admin/widget-admin.component';
import { DiagnosticsComponent } from './diagnostics/diagnostics.component';
import { ServerHitLogsComponent } from './server-hit-logs/server-hit-logs.component';
import { WidgetRegistration2Component } from './widget-registration2/widget-registration2.component';
import { WidgetHelpComponent } from './widget-help/widget-help.component';
import { GenericGroupedDataSideNavComponent } from './generic-grouped-data-side-nav/generic-grouped-data-side-nav.component';
import { GroupKeyVisibleFilterPipe } from './GroupKeyVisibleFilterPipe';
import { RecursivePanelComponent } from './recursive-panel/recursive-panel.component';
import { NameValueEditorComponent } from './Editors/name-value-editor/name-value-editor.component';
import { CacheRuleEditorComponent } from './Editors/cache-rule-editor/cache-rule-editor.component';
import { WidgetConfigEditorComponent } from './Editors/widget-config-editor/widget-config-editor.component';
import { DataConsumerConfigEditorComponent } from './Editors/data-consumer-config-editor/data-consumer-config-editor.component';
import { DataPolicyEditorComponent } from './Editors/data-policy-editor/data-policy-editor.component';
import { CacheRulesEditorComponent } from './Editors/cache-rules-editor/cache-rules-editor.component';
import { DataGroupingEditorComponent } from './Editors/data-grouping-editor/data-grouping-editor.component';
import { FilterRuleEditorComponent } from './Editors/filter-rule-editor/filter-rule-editor.component';
import { MasterConfigurationComponent } from './master-configuration/master-configuration.component';
import { TableauComponent } from './tableau/tableau.component';
import { DataPolicyTestingComponent } from './data-policy-testing/data-policy-testing.component'
import { DataSetTableComponent } from './data-set-table/data-set-table.component';
import { GenericTableConfigComponent } from './Editors/generic-table-config/generic-table-config.component';
import { GenericChartConfigComponent } from './Editors/generic-chart-config/generic-chart-config.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CommonAppModule,
    ChartsModule,
    Angular2FontawesomeModule,
    TabsModule.forRoot(),
    CollapseModule.forRoot(),
    MdSliderModule,
    TooltipModule,
    Ng2DragDropModule,
    NgxDatatableModule
  ],
  declarations: [
    GenericTableComponent, GenericChartComponent, GenericBaseComponent, LotForecasterComponent, RandomChartComponent,
    NetworkDiagramComponent, WidgetRegistration2Component, WidgetHelpComponent,
    UserAdministrationComponent, SideNavAdminComponent, DataPolicyAdminComponent, CacheDataAdminComponent, WidgetAdminComponent,
    DiagnosticsComponent, ServerHitLogsComponent,
    GenericGroupedDataSideNavComponent,
    GroupKeyVisibleFilterPipe,
    RecursivePanelComponent,
    NameValueEditorComponent,
    CacheRuleEditorComponent,
    WidgetConfigEditorComponent,
    DataConsumerConfigEditorComponent,
    DataPolicyEditorComponent,
    CacheRulesEditorComponent,
    DataGroupingEditorComponent,
    FilterRuleEditorComponent,
    MasterConfigurationComponent,
    TableauComponent,
    DataPolicyTestingComponent,
    DataSetTableComponent,
    GenericTableConfigComponent,
    GenericChartConfigComponent ],
  exports: [GenericTableComponent, GenericChartComponent, GenericBaseComponent, LotForecasterComponent, RandomChartComponent,
    UserAdministrationComponent, SideNavAdminComponent, DataPolicyAdminComponent, CacheDataAdminComponent, WidgetAdminComponent,
    NetworkDiagramComponent, WidgetRegistration2Component, WidgetHelpComponent,
    DiagnosticsComponent, ServerHitLogsComponent,
    GenericGroupedDataSideNavComponent,
    RecursivePanelComponent,
    NameValueEditorComponent,
    MasterConfigurationComponent,
    TableauComponent,
    DataSetTableComponent]
})
export class WidgetLibraryModule { }
