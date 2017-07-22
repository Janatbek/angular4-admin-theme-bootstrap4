import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { WidgetConfiguration } from 'app/common/interfaces/WidgetInterfaces';
import { DisplayStateService } from 'app/common/services/DisplayStateService';

@Component({
  selector: 'app-widget-config-editor',
  templateUrl: './widget-config-editor.component.html',
  styleUrls: ['./widget-config-editor.component.css']
})
export class WidgetConfigEditorComponent implements OnInit, OnChanges {

  @Input() selectedWidgetConfig: WidgetConfiguration;

  selectedWidgetConfigJson: string;

  constructor(private displayStateService: DisplayStateService ) { }

  ngOnInit() {
    this.grabJSON();
  }

  canAddAsSideNav() {
    return this.displayStateService.appState.sideNavWidgetConfig !== undefined &&
      this.displayStateService.appState.sideNavWidgetConfig.widgetNameList.findIndex(x => x.name === this.selectedWidgetConfig.name) === -1;
  }

  ngOnChanges() {
    console.log('WidgetConfigEditorComponent.ngOnChanges');
    this.grabJSON();
  }

  private grabJSON() {
    this.selectedWidgetConfigJson =
      this.selectedWidgetConfig === undefined || this.selectedWidgetConfig.config === undefined ?
      '' :
      JSON.stringify(this.selectedWidgetConfig.config, null, 2);
  }

  DeleteContextByIndex(idx: number) {

    this.selectedWidgetConfig.contextMatchingRules.splice(idx, 1);
  }

  AddAsSideNav() {
    this.displayStateService.appState.sideNavWidgetConfig.widgetNameList.push(
      {
        name: this.selectedWidgetConfig.name,
        value: this.selectedWidgetConfig.name});
  }

  AddContextRule() {
    this.selectedWidgetConfig.contextMatchingRules.push({contextName: '', optional: true, valueMatch: '' });
  }
}
