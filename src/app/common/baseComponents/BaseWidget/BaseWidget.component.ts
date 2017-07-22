import { DataRequestError } from '../../interfaces/DisplayInterfaces';
import { Component, OnInit, OnDestroy, Input, ElementRef } from '@angular/core';
import { Params } from '@angular/router';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { DisplayStateService, Events } from 'app/common/services/DisplayStateService';
import { AppStateService } from 'app/common/services/AppStateService';
import { EngWebApiService } from 'app/common/services/EngWebApiService';
import { DataRequestReply } from 'app/common/interfaces/DisplayInterfaces';
import { WidgetConfiguration } from 'app/common/interfaces/WidgetInterfaces';
import { UtilityFunctions } from 'app/common/classes/UtilityFunctions';

@Component({
  selector: 'app-base-widget-component',
  templateUrl: './BaseWidget.component.html',
  styleUrls: ['./BaseWidget.component.css']
})
// tslint:disable-next-line:component-class-suffix
export class BaseWidget implements OnInit, OnDestroy {

  @Input() Config: WidgetConfiguration;

  protected ngUnsubscribe: Subject<boolean> = new Subject();
  protected statechanged$: Subscription;
  protected messageHouseListener$: Subscription;
  protected dataAvailableListener$: Subscription;
  protected dataErrorListener$: Subscription;

constructor(
  protected element: ElementRef,
  protected displayStateService: DisplayStateService,
  protected appStateService: AppStateService,
  protected engWebApiService: EngWebApiService) {}

  ngOnInit() {

    // Listen for new data available and call a method the child class can override to act on the event
    this.dataAvailableListener$ = this.displayStateService.DataAvailable
      .takeUntil(this.ngUnsubscribe)
      .subscribe(reply => {
        this.onDataAvailable(reply)
      });

      this.dataErrorListener$ = this.displayStateService.DataError
      .takeUntil(this.ngUnsubscribe)
      .subscribe(error => {
        this.onDataError(error)
      });

    // Listen for changes to context, filters, or sorts and call methods the child class can override to act on the event
    this.statechanged$ = this.displayStateService.AppStateChanged
      .takeUntil(this.ngUnsubscribe)
      .subscribe(x => {
        if (x === Events.CURRENT_CONTEXT_CHANGED) {
          this.onContextChanged(this.displayStateService.appState.current.context);
        } else if (x === Events.CURRENT_FILTERS_CHANGED) {
          this.onFiltersChanged(this.displayStateService.appState.current.filters);
        } else if (x === Events.CURRENT_SORTS_CHANGED) {
          this.onSortsChanged(this.displayStateService.appState.current.sorts);
        }
        this.onStateChanged(x);
      });

    // Listen for new messages from other widgets and call a method the child class can override to act on the event
    this.messageHouseListener$ = this.displayStateService.MessageHouse
      .takeUntil(this.ngUnsubscribe)
      .subscribe(messageParams => {
        this.onNewMessage(messageParams);
      });

      // call a method the child class can override if they want to do anything at initialization.
      this.onInitialize();
  }

  onDataAvailable(reply: DataRequestReply) { }

  onDataError(error: DataRequestError) { }

  onInitialize() {}

  onNewMessage(messageParams: Params) {}

  onContextChanged(currentContext: Params) {}

  onFiltersChanged(currentFilters: Params) {}

  onSortsChanged(currentSorts: Params) {}

  onStateChanged(eventName: string) {}

  ngOnDestroy() {
        this.ngUnsubscribe.next(true);
        this.ngUnsubscribe.complete();
    }
}
