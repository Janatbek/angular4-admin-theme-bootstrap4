import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';

import { DisplayStateService, Events } from 'app/common/services/DisplayStateService';

@Component({
  selector: 'app-widget-display',
  templateUrl: './widget-display.component.html',
  styleUrls: ['./widget-display.component.css']
})
export class WidgetDisplayComponent implements OnInit, OnDestroy {

  sideNavDisplay = 'block';
  mainMarginLeft = '280px';
  statechanged$: Subscription;
  showWaitingUser = true;

  constructor(public DisplayStateService: DisplayStateService) {
  }

  ngOnInit() {

    this.showWaitingUser = this.DisplayStateService.appState.current.user === undefined;

    // console.log('WidgetDisplayComponent.ngOnInit');
    this.statechanged$ = this.DisplayStateService.AppStateChanged.subscribe( x => {
      if (x === Events.SIDE_NAV_DISPLAYED_CHANGED) {
        // if (this.DisplayStateService.appState.current.sideNav.displayState === 'show') {
        //   this.sideNavDisplay = 'block';  this.mainMarginLeft = '340px';
        // } else {
        //   this.sideNavDisplay = 'none';   this.mainMarginLeft = '40px';
        // }

        if (this.DisplayStateService.appState.current.sideNav.displayState === 'show') {
          this.mainMarginLeft = '280px';
        } else {
          this.mainMarginLeft = '33px';
        }


      } else if (x === Events.USER_CHANGED) {
        this.showWaitingUser = false;
      }

    });
  }

  ngOnDestroy() {
    this.statechanged$.unsubscribe();
  }

}
