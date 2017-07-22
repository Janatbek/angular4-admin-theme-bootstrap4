import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGroupingEditorComponent } from './data-grouping-editor.component';

describe('DataGroupingEditorComponent', () => {
  let component: DataGroupingEditorComponent;
  let fixture: ComponentFixture<DataGroupingEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataGroupingEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataGroupingEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
