import { CacheRules, DataPolicy } from '../../../common/interfaces/WidgetInterfaces';

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cache-rule-editor',
  templateUrl: './cache-rule-editor.component.html',
  styleUrls: ['./cache-rule-editor.component.css']
})
export class CacheRuleEditorComponent implements OnInit {

  @Input() cacheRules: CacheRules;

  periods = [
          '',
          'hour',
          'minute',
          'day',
          'week',
          'never',
          'month',
          'permanent'
        ];

  constructor() { }

  ngOnInit() {
  }

}
