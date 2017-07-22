import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Params } from '@angular/router';
import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';
import { AppStateService } from 'app/common/services/AppStateService';
import { DisplayStateService } from 'app/common/services/DisplayStateService';
import { EngWebApiService } from 'app/common/services/EngWebApiService';
import { Observable } from 'rxjs/Rx';

declare const tableau: any;

@Component({
  selector: 'app-tableau',
  templateUrl: './tableau.component.html',
  styleUrls: ['./tableau.component.css']
})
export class TableauComponent extends BaseWidget {

  @ViewChild('tableauDiv') tableauDiv;
  url: SafeUrl;
  tableauConfig: TableauConfig;

  constructor(
    protected element: ElementRef,
    protected displayStateService: DisplayStateService,
    protected appStateService: AppStateService,
    protected engWebApiService: EngWebApiService,
    private sanitizer: DomSanitizer) {

    super(element, displayStateService, appStateService, engWebApiService);
  }

  onInitialize() {

    this.tableauConfig = <TableauConfig>this.Config.config;

    this.ProcessUrl(this.displayStateService.appState.current.context);
  }
    
  onContextChanged(currentContext: Params) {
    this.ProcessUrl(currentContext)
  }

  ProcessUrl(currentContext: Params) {
    if (this.tableauConfig === undefined) {
      return;
    }

    const ToReplace: Params = [];

    let re = new RegExp('\\|\\|.+?\\|\\|', 'g');

    let matches = re.exec(this.tableauConfig.url);
    while (matches !== null) {
      matches.forEach( m => {
        console.log(`tableau context match: ${m}`);
        const inner = m.substr(2, m.length - 4);
        if (inner.startsWith('c.')) {
          if (Object.keys(this.displayStateService.appState.current.context).find(k => k === inner.substr(2)) !== undefined)
          {
            ToReplace[m] = this.displayStateService.appState.current.context[inner.substr(2)];
          }
        }
      });
      matches = re.exec(this.tableauConfig.url);
    }
    let url = this.tableauConfig.url;
    Object.keys(ToReplace).forEach(k => { url = url.replace(k, ToReplace[k]); });
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

class TableauConfig {
  url: string;
}
