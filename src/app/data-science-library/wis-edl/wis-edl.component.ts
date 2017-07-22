import { BaseManagedDataWidget } from '../../common/baseComponents/BaseManagedDataWidget/BaseManagedDataWidget.component';
import { Component, OnInit } from '@angular/core';
import { MdSliderModule } from '@angular/material';

declare var d3: any;

@Component({
  selector: 'app-wis-edl',
  templateUrl: './wis-edl.component.html',
  styleUrls: ['./wis-edl.component.css']
})
export class WisEdlComponent extends BaseManagedDataWidget {

  originalOpacity = 100;
  contrastOpacity = 0;
  explanOpacity = 0;
  predOpacity = 0;

}