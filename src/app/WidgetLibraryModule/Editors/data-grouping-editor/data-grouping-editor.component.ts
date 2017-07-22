import { DataGrouping } from '../../../common/interfaces/WidgetInterfaces';

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-grouping-editor',
  templateUrl: './data-grouping-editor.component.html',
  styleUrls: ['./data-grouping-editor.component.css']
})
export class DataGroupingEditorComponent implements OnInit {

  @Input() dataGrouping: DataGrouping;
  @Input() columns: string[];

  newGroupByColum: string;

  operations = [ 'mean', 'median', 'stddev', 'sum', 'min', 'max', 'count' ];
  constructor() { }

  AddGroupBy() {
    this.dataGrouping.groupBy.push(this.newGroupByColum);
  }

  RemoveGroupBy(col: string) {
    this.dataGrouping.groupBy = this.dataGrouping.groupBy.filter(s => s !== col);
  }

  AddAggregate() {
    this.dataGrouping.aggregations.push({ name: '', operation: '', rename: '' });
  }

  RemoveAggregate(i: number) {
      this.dataGrouping.aggregations.splice(i, 1);
  }

  ngOnInit() {
  }

}
