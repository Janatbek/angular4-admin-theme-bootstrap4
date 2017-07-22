import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnomaliesTravelerStepComponent } from './anomalies-traveler-step.component';

describe('AnomaliesTravelerStepComponent', () => {
  let component: AnomaliesTravelerStepComponent;
  let fixture: ComponentFixture<AnomaliesTravelerStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnomaliesTravelerStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnomaliesTravelerStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
