// angular modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// modules installed from npm
import {ToastModule} from 'ng2-toastr/ng2-toastr';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts';
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';

// Module directives
import { TopNavComponent } from './directives/top-nav/top-nav.component';
import { WidgetDisplayComponent } from './directives/widget-display/widget-display.component';
import { SideNavComponent } from './directives/side-nav/side-nav.component';
import { GroupDisplayComponent } from './directives/group-display/group-display.component';
import { WidgetContainerComponent } from './directives/widget-container/widget-container.component';

// Imported modules
import { WidgetLibraryModule } from 'app/WidgetLibraryModule/WidgetLibraryModule';
import { CommonAppModule } from 'app/common/CommonAppModule';
import { DataScienceLibraryModule } from 'app/data-science-library/data-science-library.module';
import { GeneralEngineeringModule } from 'app/general-engineering/general-engineering.module';

import {ToastOptions} from 'ng2-toastr';

export class CustomOption extends ToastOptions {
  animate = 'fade'; // you can override any options available
  newestOnTop = false;
  showCloseButton = true;
}

@NgModule({
  declarations: [
    TopNavComponent,
    WidgetDisplayComponent,
    SideNavComponent,
    GroupDisplayComponent,
    WidgetContainerComponent
  ],
  imports: [
    Angular2FontawesomeModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    ChartsModule,
    CommonAppModule,
    WidgetLibraryModule,
    DataScienceLibraryModule,
    GeneralEngineeringModule,
    TabsModule.forRoot(),
    ToastModule.forRoot()
  ],
  exports: [
    WidgetDisplayComponent
  ],
   providers: [
    {provide: ToastOptions, useClass: CustomOption}
  ],
})
export class WidgetDisplayModule {}
