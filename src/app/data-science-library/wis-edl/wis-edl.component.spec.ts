import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WisEdlComponent } from './wis-edl.component';

describe('WisEdlComponent', () => {
  let component: WisEdlComponent;
  let fixture: ComponentFixture<WisEdlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WisEdlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WisEdlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
