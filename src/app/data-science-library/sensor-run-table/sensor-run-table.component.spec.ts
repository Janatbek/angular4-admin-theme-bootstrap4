import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorRunTableComponent } from './sensor-run-table.component';

describe('SensorRunTableComponent', () => {
  let component: SensorRunTableComponent;
  let fixture: ComponentFixture<SensorRunTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorRunTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorRunTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
