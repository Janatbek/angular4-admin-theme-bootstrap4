import { Component } from '@angular/core';
import { Params } from '@angular/router';

import { BaseManagedDataWidget } from 'app/common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';
import { DataRequestReply } from 'app/common/interfaces/DisplayInterfaces';

@Component({
  selector: 'app-example-managed-data-widget',
  templateUrl: './ExampleManagedDataWidget.component.html',
  styleUrls: ['./ExampleManagedDataWidget.component.css']
})
export class ExampleManagedDataWidgetComponent extends BaseManagedDataWidget {

  // EXAMPLE OVERRIDE of BaseManagedDataWidget.RequestData
  RequestData() {
    // Override if you want to do anything special.  Otherwise, delete this method and base class will request data based on
    // widget config data policy and handle the reply
    // The base implementation will verify that the widget is still relevant given the current context (there is a case where
    // the method may be called before the component is destroyed but it is no longer supposed to be shown) and then make
    // the appropriate platform call to request data based on this widgets configuration and the current context.
    // It is unlikely that you will need to override this method.  Maybe you need to do some additional checks before the data request
    // is sent.  If you do, the cleanest thing is to do your checks and then call super.RequestData()
    super.RequestData();
  }

  // EXAMPLE OVERRIDE of BaseManagedDataWidget.OnDataAvailable
  OnDataAvailable(reply: DataRequestReply) {
    // The base implementation will check that the newly available data is what this widget cares about and, if so, sets
    // the new data to this.originalDataSet.  it then calls the next method in the process chain (HandleGrouping).  If you 
    // do override this method, you will either need to call super.onDataAvailable() at the end or super.HandleGrouping() to
    // keep the process chain flowing
  }

  // EXAMPLE OVERRIDE of BaseManagedDataWidget.HandleGrouping
  HandleGrouping() {
    // Override if you want to do anything special.  Otherwise, delete this method and base class will group data
    // based on any widget data consumer grouping configuration
    super.HandleGrouping();
  }

  // EXAMPLE OVERRIDE of BaseManagedDataWidget.HandleFilters
  HandleFilters() {
    // Override if you want to do anything special.  Otherwise, delete this method and base class will filter data
    // based on filters selected by the user.
    super.HandleFilters();
  }

  // EXAMPLE OVERRIDE of BaseManagedDataWidget.HandleSorts
  HandleSorts() {
    // Override if you want to do anything special.  Otherwise, delete this method and base class will filter data
    // based on sorts selected by the user.
    super.HandleSorts();
  }

  // EXAMPLE OVERRIDE of BaseManagedDataWidget.HandleMessages
  HandleMessages() {
    // If you care about messages from other widgets, implement here.  You have access to the message Params object via
    // this.messages
    console.log(`current message keys: ${Object.keys(this.messages)}`);
  }

  // EXAMPLE OVERRIDE of BaseManagedDataWidget.PostProcessing()
  PostProcessing() {
    // You'll very likely want to override this method.  At this point in the process chain the data has been retrieved, grouped,
    // filtered, and sorted and is saved to this.displayDataSet.  You can parse this data set however you need in order for it 
    // to be displayed in your widget HTML template.
  }

  SomethingHappened() {
    // This is an example where the user did something and your template has that action tied to this method to handle it.  The user action
    // in this example requires that you get new data.
    this.RequestData();
  }

  // EXAMPLE OVERRIDE of BaseWidget.onDataAvailable
  onDataAvailable(reply: DataRequestReply) {}

  // EXAMPLE OVERRIDE of BaseWidget.onInitialize
  onInitialize() {}

  // EXAMPLE OVERRIDE of BaseWidget.onNewMessage
  onNewMessage(messageParams: Params) {}

  // EXAMPLE OVERRIDE of BaseWidget.onContextChanged
  onContextChanged(currentContext: Params) {
    // Normally the BasemanagedDataWidget will respond to context changes by requesting new data again as long as the new context
    // doesn't mean your widget is no longr supposed to be shown.  If you don't want that to be the case for your widget or you 
    // want to do some additional work, you could override this method and handle the logic yourself
    super.onContextChanged(currentContext);
  }

  // EXAMPLE OVERRIDE of BaseWidget.onFiltersChanged
  onFiltersChanged(currentFilters: Params) {}

  // EXAMPLE OVERRIDE of BaseWidget.onSortsChanged
  onSortsChanged(currentSorts: Params) {}
}
