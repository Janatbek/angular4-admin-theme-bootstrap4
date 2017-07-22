import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericChartConfigComponent } from './generic-chart-config.component';

describe('GenericChartConfigComponent', () => {
  let component: GenericChartConfigComponent;
  let fixture: ComponentFixture<GenericChartConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericChartConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericChartConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
