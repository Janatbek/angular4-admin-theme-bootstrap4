import { Component, OnInit, Input } from '@angular/core';
import { DataPolicy } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-data-policy-editor',
  templateUrl: './data-policy-editor.component.html',
  styleUrls: ['./data-policy-editor.component.css']
})
export class DataPolicyEditorComponent implements OnInit {

  @Input() dataPolicy: DataPolicy;

  periods: string[] = [];

  constructor() { }

  ngOnInit() { }

}
