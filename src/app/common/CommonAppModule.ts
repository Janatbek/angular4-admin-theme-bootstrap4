import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdalService } from 'ng2-adal/core';

import { DisplayStateService } from 'app/common/services/DisplayStateService';
import { EngWebApiService } from 'app/common/services/EngWebApiService';
import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';
import { BaseManagedDataWidget } from 'app/common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';
import { DataErrorDisplayComponent } from 'app/common/data-error-display/data-error-display.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    BaseWidget,
    BaseManagedDataWidget,
    DataErrorDisplayComponent
  ],
  providers: [
      DisplayStateService,
      EngWebApiService,
      AdalService
  ],
  exports: [
    BaseWidget,
    BaseManagedDataWidget,
    DataErrorDisplayComponent
  ]

})
export class CommonAppModule { }
