import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataErrorDisplayComponent } from './data-error-display.component';

describe('DataErrorDisplayComponent', () => {
  let component: DataErrorDisplayComponent;
  let fixture: ComponentFixture<DataErrorDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataErrorDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataErrorDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
