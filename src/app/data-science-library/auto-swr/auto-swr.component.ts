import { Component, OnInit } from '@angular/core';
import { ButtonCheckboxDirective } from 'ngx-bootstrap/ng2-bootstrap';
import { BaseManagedDataWidget } from '../../common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';
import { DisplayStateService } from '../../common/services/DisplayStateService';


@Component({
  selector: 'app-auto-swr',
  templateUrl: './auto-swr.component.html',
  styleUrls: ['./auto-swr.component.css']
})

export class AutoSwrComponent extends BaseManagedDataWidget {

  // indices of columns
  lotIDIndex: number;
  designIDIndex: number;
  probeProcessIDIndex: number;
  SWRNoIndex: number;
  recordCountIndex: number;

  public design_ids : any[];

  public PostProcessing() {
    this.BuildDisplay()
  }

  public BuildDisplay() {
    this.lotIDIndex = this.displayDataSet.columns.indexOf('LOT_ID');
    this.designIDIndex = this.displayDataSet.columns.indexOf('DESIGN_ID');
    this.probeProcessIDIndex = this.displayDataSet.columns.indexOf('PROBE_PROCESS_ID');
    this.SWRNoIndex = this.displayDataSet.columns.indexOf('SWR_NO');
    this.recordCountIndex = this.displayDataSet.columns.indexOf('recordCount');


    const filteredDataSet: string[][] = this.displayDataSet.data;
    
    this.design_ids= [];

    for (let i = 0; i < filteredDataSet.length; i++) {
      filteredDataSet.forEach((arr) => {
        if ( this.design_ids.indexOf(arr[this.designIDIndex]) === -1) {
           this.design_ids.push(arr[this.designIDIndex])
        }
      })
    }
  }

  data_types: string[] = [
    'Probe',
    'Param',
  ];

}