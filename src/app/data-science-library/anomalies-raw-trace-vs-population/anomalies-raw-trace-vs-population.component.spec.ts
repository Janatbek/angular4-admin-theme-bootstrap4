import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnomaliesRawTraceVsPopulationComponent } from './anomalies-raw-trace-vs-population.component';

describe('AnomaliesRawTraceVsPopulationComponent', () => {
  let component: AnomaliesRawTraceVsPopulationComponent;
  let fixture: ComponentFixture<AnomaliesRawTraceVsPopulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnomaliesRawTraceVsPopulationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnomaliesRawTraceVsPopulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
