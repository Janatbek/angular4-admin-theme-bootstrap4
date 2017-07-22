import { Component } from '@angular/core';
import { Params } from '@angular/router';

import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';

// This is a boilerplate starting point for creating a new widget. You will want to copy the imports above
// and everything below from 'extends' to the end of the class definition

@Component({
  selector: 'app-example-widget-component',
  templateUrl: './exampleWidget.component.html',
  styleUrls: ['./exampleWidget.component.css']
})
export class ExampleWidgetComponent extends BaseWidget {

  onInitialize() {
    // This method is called on the base class in the ngOnInit method.  You could implement the OnInit interface
    // and the ngOnInit method in your widget, but you have to remember to call super.ngOnInit() or you will break
    // the base class handling of filter/sort/context/message event handling. It easier to put the code you would
    // normally put in ngOnInit in this method instead so you don't have to worry about it, and it is called at the
    // same lifecyle points as ngOnInit.  This method can be deleted if you don't need it.
  }

  onNewMessage(messageParams: Params) {
    // Add code here if you want to receive messages from other components in the form of Params, which are like 
    // a simple dictionary of string keys with values that can be any object.
    // Note that you can completely delete this method if you don't need to respond to messages

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
