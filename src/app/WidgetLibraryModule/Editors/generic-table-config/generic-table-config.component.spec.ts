import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericTableConfigComponent } from './generic-table-config.component';

describe('GenericTableConfigComponent', () => {
  let component: GenericTableConfigComponent;
  let fixture: ComponentFixture<GenericTableConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericTableConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericTableConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
