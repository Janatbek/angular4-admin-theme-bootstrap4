import { Component } from '@angular/core';
import { Params } from '@angular/router';

import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';

@Component({
  selector: 'app-example-widget',
  templateUrl: './example-widget.component.html',
  styleUrls: ['./example-widget.component.css']
})
export class ExampleWidgetComponent extends BaseWidget {

  onInitialize() {}

  onNewMessage(messageParams: Params) {
    // Add code here if you want to receive messages from other components in the form of Params, which are like 
    // a simple dictionary of string keys with values that can be any object.

    // Example of sending a message to other components, which can be ANYWHERE in your widget code:

    //  this.displayStateService.MessageHouse.next( {'SomeKeyOtherWidgetsWillLookFor': 'SomeValueTheyWillLookAt'} );

    // Example of listening for and responding to a message from another component in this method:

    // if (messageParams['SomeKeyOtherWidgetsWillLookFor'] !== undefined) {
    //     const value = <string>messageParams['SomeKeyOtherWidgetsWillLookFor'];
    //     // Do something interesting with the value here
    // }
  }

  onContextChanged(currentContext: Params) {
    // This method is called whenever the user or any other widget has changed the current context name/value pairs.  Implement any
    // code here that needs to modify the data model or whatever based on existence of values of context.
    // Note that you can completely delete this method if you don't need to respond to context changes
  }

  onFiltersChanged(currentFilters: Params) {
    // This method is called whenever the user or any other widget has changed the current context name/value pairs.  Implement any
    // code here that needs to look at filters that other widgets have published that could require you to filter your model data
    // Note that you can completely delete this method if you don't need to respond to filter changes
  }

  onSortsChanged(currentSorts: Params) {
    // This method is called whenever the user or any other widget has changed the current context name/value pairs.  Implement any
    // code here that needs to look at sort instructions that other widgets have published that could require you to sort your model data
    // Note that you can completely delete this method if you don't need to respond to sort changes
  }
}
