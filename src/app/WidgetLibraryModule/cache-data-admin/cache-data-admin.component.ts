import { RedirectUrlSuffixes } from '../../../environments/CommonEnvironment';
import { DataSet } from '../../common/interfaces/DisplayInterfaces';
import { Component, keyframes } from '@angular/core';
import { Params } from '@angular/router';

import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';
import { CacheConstants } from 'app/common/services/DisplayStateService';

declare var $: any;

@Component({
  selector: 'app-cache-data-admin',
  templateUrl: './cache-data-admin.component.html',
  styleUrls: ['./cache-data-admin.component.css']
})
export class CacheDataAdminComponent extends BaseWidget {

  managedCacheDataStatusList: string[][] = [];
  minutesAhead = 10;
  updating = false;
  isAdmin = false;
  columns: any[];
  displayDataSet: DataSet = undefined;
  selectedKey: string = undefined;

  onInitialize() {
    if (this.displayStateService.appState.current.user !== undefined) {
      this.isAdmin = this.displayStateService.appState.current.userIsAdmin;
    }
    this.Refresh();
  }

  GetClass(row: string[]) {
    const minutes = Number(row[2]);
    if (row[2] === 'permanent') {
      return 'bg-info';
    } else if (minutes > 30) {
      return 'bg-success';
    } else if (minutes > 5) {
      return 'bg-warning';
    } else if (minutes <= 5) { return 'table-danger'; }
  }



  ViewData(key: string) {
    this.engWebApiService.GetCacheDataByKey(key).subscribe(x => {
      this.displayDataSet = <DataSet>x.Payload;
      this.selectedKey = key;
      $('#dataViewModal').modal('show');
    });
  }

  UpdateForce(key: string) {
    this.updating = true;
    this.engWebApiService.ForceUpdateByKey(key).subscribe(x => {
      this.Refresh();
      this.updating = false;
    });
  }

  Update() {
    this.updating = true;
    this.engWebApiService.UpdateCacheStatus(this.minutesAhead).subscribe(x => {
      this.Refresh();
      this.updating = false;
    });
  }

  Refresh() {
    this.engWebApiService.GetManagedCacheDataStatus().subscribe(x => {

      this.managedCacheDataStatusList = x.map(r => {
        if (Number(r[2]) > 100000) {
          r[2] = 'permanent';
        }
        return r;
      });
    });
  }
}
