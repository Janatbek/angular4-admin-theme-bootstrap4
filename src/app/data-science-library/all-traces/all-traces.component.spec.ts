import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTracesComponent } from './all-traces.component';

describe('AllTracesComponent', () => {
  let component: AllTracesComponent;
  let fixture: ComponentFixture<AllTracesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllTracesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllTracesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
