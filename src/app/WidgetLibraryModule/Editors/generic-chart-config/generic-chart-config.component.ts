import { Component, OnInit, Input } from '@angular/core';
import { WidgetConfiguration } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-generic-chart-config',
  templateUrl: './generic-chart-config.component.html',
  styleUrls: ['./generic-chart-config.component.css']
})
export class GenericChartConfigComponent implements OnInit {

  @Input() widgetConfig: WidgetConfiguration;

  constructor() { }

  ngOnInit() {
  }

}
