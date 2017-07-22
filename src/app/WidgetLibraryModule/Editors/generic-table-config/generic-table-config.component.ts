import { Component, Input, OnInit } from '@angular/core';
import { GenericTableConfiguration } from '../../../common/interfaces/WidgetInterfaces';
import { WidgetConfiguration } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-generic-table-config',
  templateUrl: './generic-table-config.component.html',
  styleUrls: ['./generic-table-config.component.css']
})
export class GenericTableConfigComponent implements OnInit {

  genericTableConfiguration: GenericTableConfiguration;
  widgetConfiguration: WidgetConfiguration;

  @Input() set widgetConfig(value: WidgetConfiguration) {

    if (value) {
      this.widgetConfiguration = value;
      if (value.config && value.config.tableColumnRules) {
        this.genericTableConfiguration = value.config;
      } else {
        this.genericTableConfiguration = { tableColumnRules : [] };
        value.config = this.genericTableConfiguration;
      }
      this.genericTableConfiguration.tableColumnRules.forEach( tcr =>
        tcr.heatmapRules = tcr.heatmapRules ? tcr.heatmapRules : {low: '', high: '' });
    } else {
      this.genericTableConfiguration = undefined;
      this.widgetConfiguration = undefined;
    }

  }

  constructor() { }

  ngOnInit() {

  }

  Add() {
    this.widgetConfig.config.tableColumnRules.push({
      columnName: '',
      alternateColorOnValueChange: false,
      heatmapRules: {
        low: '',
        high: ''
      }
    });
  }

  DeleteByIndex(idx: number) {
    this.genericTableConfiguration.tableColumnRules.splice(idx, 1);
  }
}
