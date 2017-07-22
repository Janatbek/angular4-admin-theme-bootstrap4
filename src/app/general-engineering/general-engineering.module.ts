import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CamecaWFSIMSLogComponent } from './cameca-wf-sims-log/cameca-wf-sims-log.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [CamecaWFSIMSLogComponent],
  exports: [
    CamecaWFSIMSLogComponent
  ],
})
export class GeneralEngineeringModule { }
