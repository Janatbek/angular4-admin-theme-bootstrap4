import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasonKeysComponent } from './reason-keys.component';

describe('ReasonKeysComponent', () => {
  let component: ReasonKeysComponent;
  let fixture: ComponentFixture<ReasonKeysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReasonKeysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReasonKeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
