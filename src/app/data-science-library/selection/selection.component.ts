import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { BaseWidget } from 'app/common/baseComponents/BaseWidget/BaseWidget.component';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormControl } from '@angular/forms';

export interface LotForm {
  data_type: string,
  /**
   * Number of hours
   */
  time: number,
  design_id: string | null,
  start: Date | null,
  end: Date | null,
  /**
   * `null` mean 'All lots'
   */
  lot: string | null,
  pid: string | null,
}

export interface Lot {
  id: string,
  lot: string,
  design_id: string,
  swrs: number,
  pid: string,
  rev: number,
  number: number,
}

export interface SWR {
  id: string,
  number: number,
  title: string,
  groups: number,
}

export interface Wafer {
  id: string,
  time: Date,
  reprobe: number,
  group: string,
}

// Fake api functions 
function fakeGetLots(params: LotForm): Observable<Lot[]> {
  let lots = [{
    id: 'abc',
    lot: params.lot,
    design_id: params.design_id,
    swrs: 4443333,
    pid: params.pid,
    rev: Math.floor(Math.random() * 100),
    number: 25,
  }, {
    id: 'def',
    lot: params.lot,
    design_id: params.design_id,
    swrs: 4443333,
    pid: params.pid,
    rev: Math.floor(Math.random() * 100),
    number: 25,
  }];

  if (params.lot) {
    lots = [lots[0]];
  }
  return new Observable(observer => {
    observer.next(lots);
    observer.complete();
  });
}

function fakeGetSWRs(params: LotForm, lot: Lot): Observable<SWR[]> {
  return new Observable(observer => {
    observer.next([
      {
        id: 'abc',
        number: 111,
        title: 'My SWR Title',
        groups: 10,
      },
      {
        id: 'cde',
        number: 222,
        title: 'Another SWR Title',
        groups: 20,
      },
    ]);
    observer.complete();
  })
}

function fakeGetWafers(params: LotForm, lot: Lot, swr: SWR): Observable<Wafer[]> {
  return new Observable(observer => {
    observer.next([
      {
        id: 'wafer0',
        time: new Date(),
        reprobe: Math.floor(Math.random() * 100),
        group: '1C',
      },
      {
        id: 'wafer1',
        time: new Date(),
        reprobe: Math.floor(Math.random() * 100),
        group: '2E',
      },
      {
        id: 'wafer2',
        time: new Date(),
        reprobe: Math.floor(Math.random() * 100),
        group: '3F',
      },
    ]);
    observer.complete();
  });
}

@Component({
  selector: 'app-selection',
  templateUrl: './selection.component.html',
  styleUrls: [
    './selection.component.css',
  ]
})
export class SelectionComponent extends BaseWidget {
  /**
   * ALC - TODO - need to rename to distinguish between
   * 'selected' and 'checked'
   * 'selected' - items that are 'selected' for the 'Currently Selected' page
   * There will be 'selected_swr' and 'selected_wafers'
   * 
   * 'checked' - items that are selected or checked in the datatables
   * And 'checked_lot', 'checked_swr', 'checked_groups', and 'checked_wafers'
   * 
   */


  // lots to show in datatable   
  lots: Lot[] = [];
  checked_lot: Lot = undefined;

  // swrs to show in datatable 
  swrs: SWR[] = [];
  checked_swr: SWR;

  // wafers to show in datatable  
  wafers: Wafer[] = [];
  checked_wafers: Wafer[] = [];

  /**
   * wafer_id => Wafer
   * This may eventually be in its own service so it can 
   * be available everywhere
   */
  selected_wafers: Map<string, Wafer> = new Map();
  selected_swr: SWR;

  lotFormGroup: FormGroup;

  data_types: string[] = [
    'Probe',
    'Param',
  ];

  design_ids: string[] = [
    'Z01A',
    'V90B',
  ];

  lot_names: string[] = [
    '1234',
    'abcd',
  ];

  pids: string[] = [
    'FPP',
    'FPC',
  ];

  groups: Set<string> = new Set([]);
  checked_groups: Set<string> = new Set([]);

  onInitialize() {

    this.lots = [];

    this.lotFormGroup = new FormGroup({
      data_type: new FormControl(''),
      time: new FormControl(24),
      design_id: new FormControl(null),
      start: new FormControl(null),
      end: new FormControl(null),
      lot: new FormControl(null),
      pid: new FormControl(null),
    });

    this.handleFormChange();
  }

  handleFormChange() {
    const formChange =
      this
        .lotFormGroup
        .valueChanges
        .subscribe((form: LotForm) => {
          this.getLots(form).subscribe((lots: Lot[]) => {
            this.lots = lots;
          });
        });
  }

  /**
   * `ngx-datatable` requires the `selected` attribute to be
   * an array, so we need to turn it into one
   */
  getCheckedSWRAsList(): SWR[] {
    return (this.checked_swr !== undefined) ? [this.checked_swr] : [];
  }

  selectWafers(wafers: Wafer[]) {
    let selected_wafers = new Map(this.selected_wafers);
    wafers.forEach(wafer => {
      selected_wafers.set(wafer.id, wafer);
    });

    this.selected_wafers = selected_wafers;
    console.log('SELECTED WAFERS:', selected_wafers);
  }

  removeWafers(wafers: Wafer[]) {
    let selected_wafers = new Map(this.selected_wafers);
    wafers.forEach(wafer => {
      selected_wafers.delete(wafer.id);
    });

    this.selected_wafers = selected_wafers;
    console.log('SELECTED WAFERS AFTER REMOVE:', selected_wafers);
  }

  getLots(form: LotForm) {
    // go get lots
    return fakeGetLots(form);
  }

  getSWRs(form: LotForm, lot: Lot) {
    return fakeGetSWRs(form, lot)
      .map((swrs) => {
        this.swrs = swrs;
        if (swrs.length > 0) {
          this.checked_swr = swrs[0];
        }
        return swrs;
      });
  }

  getWafers(form: LotForm, lot: Lot, swr: SWR) {
    return fakeGetWafers(form, lot, swr).map((wafers) => {
      this.wafers = wafers;
      this.checked_wafers = [];
      this.wafers.forEach(wafer => {
        this.groups.add(wafer.group);
      });
      return wafers;
    });
  }

  getLotDetail(lotForm: LotForm, lot: Lot): Observable<Wafer[]> {
    return this.getSWRs(lotForm, lot)
      .flatMap((swrs) => {
        return this.getWafers(lotForm, lot, this.checked_swr);
      });
  }

  // get lot detail for given lot and select all wafers  
  selectAllLotWafers(lotFormGroup: FormGroup, lot: Lot) {
    return this.getLotDetail(lotFormGroup.value, lot)
      .subscribe((wafers) => {
        this.selectWafers(wafers);
      });
  }  

  // set `checked_lot` and get lot details  
  checkLotRow(lotFormGroup: FormGroup, { selected }: { selected: Lot[] }) {
    if (selected.length > 0) {
      const checked_lot = selected[0];
      this.checked_lot = checked_lot;
      this.getLotDetail(lotFormGroup.value, checked_lot)
        .subscribe();
    } else {
      this.checked_lot = undefined;
    }
  }

  // set `checked_swr`
  checkSWRRow(lotFormGroup: FormGroup, lot: Lot, { selected }) {
    if (selected.length > 0) {
      const checked_swr = selected[0];
      this.checked_swr = checked_swr;
      // ALC - not sure if wafers need to be re-fetched on a `checked_swr` change
      this.getWafers(lotFormGroup.value, lot, checked_swr)
        .subscribe();
    } else {
      this.checked_swr = undefined;
    }
  }

  closeExtra() {
    this.checked_lot = undefined;
  }

  selectSWR(swr: SWR) {
    this.selected_swr = swr;
  }

  goToSWR(swr: SWR) {
    console.log('Go To SWR:', swr);
  }

  checkGroup(event) {
    const value = event.target.value;
    // need to change reference so filters will update
    let checked_groups = new Set([]);
    if (value.length > 0) {
      checked_groups.add(event.target.value);
    }

    this.checked_groups = checked_groups;
    // need to uncheck wafers which dont match group name
    this.checked_wafers = this.checked_wafers.filter(wafer => {
      return checked_groups.has(wafer.group);
    });
  }

  onCheckWafers({ selected }) {
    this.checked_wafers = selected;
  }

  toggleDataType(lotFormGroup: FormGroup) {
    return lotFormGroup.patchValue({
      data_type: this.data_types.find((value) => value !== lotFormGroup.get('data_type').value)
    });
  }

  findParamDataForLot(lot: Lot) {
    this.toggleDataType(this.lotFormGroup);
  }
}
