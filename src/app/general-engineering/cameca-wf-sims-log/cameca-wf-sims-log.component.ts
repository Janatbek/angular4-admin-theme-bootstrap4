// import * as console from 'console';
import { Component, OnInit } from '@angular/core';
import { BaseWidget } from '../../common/baseComponents/BaseWidget/BaseWidget.component';
import { CamecaWFSIMSLog, SIMSTableRow } from './interfaces';

@Component({
  selector: 'app-cameca-wf-sims-log',
  templateUrl: './cameca-wf-sims-log.component.html',
  styleUrls: ['./cameca-wf-sims-log.component.css']
})
export class CamecaWFSIMSLogComponent extends BaseWidget {
  docs: CamecaWFSIMSLog[];
  filteredDocs: CamecaWFSIMSLog[];
  currentDoc: CamecaWFSIMSLog;
  justSaved: boolean;

  onInitialize() {
    this.engWebApiService.GetMongoDocs('GenericTest').subscribe(x => {
      this.docs = <CamecaWFSIMSLog[]>x;
      this.clearForm(true);
    });
  }

  filterDocs(event) {
    const filterValue: string = <string>event.target.value;

    this.filteredDocs = null;

    if (filterValue !== '') {
      if (filterValue === 'all') {
        this.filteredDocs = this.docs;
      } else {
        const filterRegex = new RegExp(`.*${filterValue}.*`, 'i');
        this.filteredDocs = this.docs.filter(doc => filterRegex.test(JSON.stringify(doc)));
      }
    }
  }

  populateForm(jobNumber: string) {
    this.engWebApiService.GetMongoDoc('GenericTest', 'JobNumber', jobNumber).subscribe(doc => {
      this.currentDoc = <CamecaWFSIMSLog>doc;
    });
  }

  addTableRow() {
    if (!this.currentDoc.BottomTable) {
      this.currentDoc.BottomTable = [];
    }

    this.currentDoc.BottomTable.push({
      ChainAnalysisNumber: '',
      FileNumber: '',
      Comments: '',
      RSF_SR: ''
    });
  }

  setAngleForSource(event) {
    if (event.target.value === 'Cs') {
      this.currentDoc.Angle = '60';
    } else {
      this.currentDoc.Angle = '36';
    }
  }

  clearForm(bypassConfirm: boolean) {
    if (bypassConfirm || confirm('Are you sure you want to clear the existing form?')) {
      const now = new Date();
      this.currentDoc = {
        DateIn: `${now.toLocaleDateString()}`,
        DateOut: '',
        Analyst: '',
        TimeIn: `${now.toLocaleTimeString()}`,
        TimeOut: '',
        TotalInstTime: '',
        JobNumber: '',

        ReferenceJobNumber: '',

        ReportTime: '',
        Requestor: '',
        Angle: '',
        IBCurrent: '',

        Source: '',
        Primary: '',
        Secondary: '',
        Float: '',
        Impact: '',
        MaxCurrent: '',
        MainVacuumPressure: '',

        FileUsed: '',
        SampleDescription: '',
        PurposeOfExperiment: '',

        FA: '',
        CA: '',
        MaxArea: '',
        EnergySlits: '',
        EntranceSlits: '',
        ExitSlits: '',
        MassRes: '',
        InteTime: '',
        WaitTime: '',
        RasterSize: '',
        Neut: '',
        Gating: '',
        Holder: '',

        FilePrefix: '',
        BottomTable: []
      };
    }
  }

  saveForm(form: CamecaWFSIMSLog, valid: boolean) {
    if (valid) {
      if (form.JobNumber) {
        const numRows = Object.keys(form.BottomTable).length / 4;
        const tableRows: SIMSTableRow[] = [];

        for (let i = 0; i < numRows; i++) {
          tableRows.push({
            ChainAnalysisNumber: '',
            FileNumber: '',
            Comments: '',
            RSF_SR: ''
          });
        }

        for (const key in form.BottomTable) {
          if (form.BottomTable.hasOwnProperty(key)) {
            const keyRegex = /(\d)-(.*)/;
            const matches = key.match(keyRegex);
            const index = matches[1];
            const rowKey = matches[2];

            if (matches) {
              tableRows[index][rowKey] = form.BottomTable[key];
            }
          }
        }

        form.BottomTable = tableRows;

        this.engWebApiService.UpsertMongoDocObs('GenericTest', 'JobNumber', form).subscribe(() => {
          this.justSaved = true;
          setTimeout(() => this.justSaved = false, 2000);

          // Pull in all the docs again so search will work for this saved log
          this.engWebApiService.GetMongoDocs('GenericTest').subscribe(docs => this.docs = <CamecaWFSIMSLog[]>docs);
        });

        this.currentDoc = form;
      } else {
        alert('SIMS Log must have a Job # to save');
      }
    }
  }
}
