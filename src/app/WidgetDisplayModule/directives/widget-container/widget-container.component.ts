import { Component, Input, OnInit } from '@angular/core';

import { WidgetConfiguration } from 'app/common/interfaces/WidgetInterfaces';
import { DisplayStateService } from 'app/common/services/DisplayStateService';

@Component({
  selector: 'app-widget-container',
  templateUrl: './widget-container.component.html',
  styleUrls: ['./widget-container.component.css']
})
export class WidgetContainerComponent implements OnInit {

  @Input() Config: WidgetConfiguration;
  flag = false;
  constructor(private displayStateService: DisplayStateService) {}

  UserAcessDenied() {
    if (!this.Config.adminRequired) {
      return false;
    } else {
      return !this.displayStateService.appState.current.userIsAdmin;
    }
  }
  ngOnInit() {

  }

}
