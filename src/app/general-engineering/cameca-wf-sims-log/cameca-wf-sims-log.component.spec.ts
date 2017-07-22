import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CamecaSurfLogComponent } from './cameca-surf-log.component';

describe('CamecaSurfLogComponent', () => {
  let component: CamecaSurfLogComponent;
  let fixture: ComponentFixture<CamecaSurfLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CamecaSurfLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CamecaSurfLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
