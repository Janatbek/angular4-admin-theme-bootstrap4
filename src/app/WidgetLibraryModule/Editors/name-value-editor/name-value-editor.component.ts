import { Component, OnInit, Input } from '@angular/core';

import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';
import { NameValue } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-name-value-editor',
  templateUrl: './name-value-editor.component.html',
  styleUrls: ['./name-value-editor.component.css']
})
export class NameValueEditorComponent extends BaseWidget {

  @Input() nvArray: NameValue[];
  @Input() nameDisplay: string;
  @Input() valueDisplay: string;
  @Input() nameEnum: string[];
  @Input() valueEnum: string[];

  Add() {
    this.nvArray.push({name: '', value: ''});
  }

  DeleteByIndex(idx) {
    this.nvArray.splice(idx, 1);
  }

}
