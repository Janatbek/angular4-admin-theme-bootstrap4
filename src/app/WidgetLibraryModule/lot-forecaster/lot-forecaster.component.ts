import { Component } from '@angular/core';
import { Params } from '@angular/router';
import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';

@Component({
  selector: 'app-lot-forecaster',
  templateUrl: './lot-forecaster.component.html',
  styleUrls: ['./lot-forecaster.component.css']
})
export class LotForecasterComponent extends BaseWidget {

  onInitialize() {}

  onNewMessage(messageParams: Params) {}

  onContextChanged(currentContext: Params) {}

  onFiltersChanged(currentFilters: Params) {}

  onSortsChanged(currentSorts: Params) {}
}
