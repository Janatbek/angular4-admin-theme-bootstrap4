import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoSwrComponent } from './auto-swr.component';

describe('AutoSwrComponent', () => {
  let component: AutoSwrComponent;
  let fixture: ComponentFixture<AutoSwrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoSwrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoSwrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
