import { addImportToModule } from '@angular/cli/lib/ast-tools';
import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';

import { GroupedKey } from 'app/common/interfaces/DisplayInterfaces';
import { DisplayStateService } from 'app/common/services/DisplayStateService';
import { GroupKeyVisibleFilterPipe } from '../GroupKeyVisibleFilterPipe';
import { NameValue } from 'app/common/interfaces/WidgetInterfaces';

declare const $: any;

@Component({
  selector: 'app-recursive-panel',
  templateUrl: './recursive-panel.component.html',
  styleUrls: ['./recursive-panel.component.css']
})
export class RecursivePanelComponent implements OnInit {

  @Input() GroupedKeyList: GroupedKey[];
  @Input() levelsBelow: number;
  @Input() toggleState: string;
  @Input() additionalContext: NameValue = undefined;
  @Input() topLevel: boolean;

  constructor(public displayStateService: DisplayStateService, private myElement: ElementRef) { }

  navigate(ctxt: Params) {
    if (this.additionalContext !== null && this.additionalContext !== undefined) {
      ctxt[this.additionalContext.name] = this.additionalContext.value;
    }
    this.displayStateService.SetContext(ctxt);
  }

  toggleExpand() {
    if (this.toggleState === 'collapse') {
      this.toggleState = 'collapse in';
    } else {
      this.toggleState = 'collapse';
    }
  }

  ngOnInit() {
  }
}
