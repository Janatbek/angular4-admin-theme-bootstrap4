import { EngWebApiService } from '../services/EngWebApiService';
import { DataPolicy, WidgetConfiguration } from '../interfaces/WidgetInterfaces';
import { DataRequestError } from '../interfaces/DisplayInterfaces';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-data-error-display',
  templateUrl: './data-error-display.component.html',
  styleUrls: ['./data-error-display.component.css']
})
export class DataErrorDisplayComponent implements OnInit {

  @Input() dataRequestError: DataRequestError;
  @Input() parentConfig: WidgetConfiguration;

  dataPolicyList: DataPolicy[] = [];
  matchingDataPolicy: DataPolicy;
  constructor(private engWebApiService: EngWebApiService) {
    this.engWebApiService.GetConfig<DataPolicy[]>('DataPolicyList').subscribe(x => {
      this.dataPolicyList = x;

      this.matchingDataPolicy = this.dataPolicyList.find(dp => dp.name === this.dataRequestError.dataPolicy);
    });
  }

  ngOnInit() {

  }

}
