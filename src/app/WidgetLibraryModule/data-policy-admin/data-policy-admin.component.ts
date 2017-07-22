import { Params } from '@angular/router';
import { Component } from '@angular/core';
import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';
import { DataPolicy } from 'app/common/interfaces/WidgetInterfaces';

@Component({
  selector: 'app-data-policy-admin',
  templateUrl: './data-policy-admin.component.html',
  styleUrls: ['./data-policy-admin.component.css']
})
export class DataPolicyAdminComponent extends BaseWidget {
  dataPolicyList: DataPolicy[] = [];
  selectedDataPolicy: DataPolicy;

  onInitialize() {
    this.engWebApiService.GetConfig<DataPolicy[]>('DataPolicyList').subscribe(x => {
      this.dataPolicyList = x;
      if (this.dataPolicyList.length > 0) {
        this.selectedDataPolicy = this.dataPolicyList[0];
        this.selectChanged();
      }
    });
  }

  onNewMessage(msgParams: Params) {
    if (msgParams['dataPolicy'] !== undefined) {
      const matchingPolicy = this.dataPolicyList.find(dp => dp.name === msgParams['dataPolicy']);
      if (matchingPolicy !== undefined) {
        this.selectedDataPolicy = matchingPolicy;
        this.selectChanged();
      }
    }
  }

  isSelected(dataPolicy: DataPolicy) {
    return (dataPolicy.name === this.selectedDataPolicy.name) ? 'active' : '';
  }

  AddPolicy() {
    const newPolicy: DataPolicy = {
      name: '',
      supportMessage: '',
      supportGroup: '',
      supportNameList: '',
      sourceURL: '',
      CacheRules: { period: 'hour', frequency: 2 },
      fixedParameters: [],
      columnRenameMap: []
    };
    this.dataPolicyList.push(newPolicy);
    this.selectedDataPolicy = newPolicy;
    this.selectChanged();
  }

  selectChanged() {
    if (this.selectedDataPolicy.fixedParameters === undefined) {
      this.selectedDataPolicy.fixedParameters = [];
    }

    if (this.selectedDataPolicy.columnRenameMap === undefined) {
      this.selectedDataPolicy.columnRenameMap = [];
    }

  }

}
