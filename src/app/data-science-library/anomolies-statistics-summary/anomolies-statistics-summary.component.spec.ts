import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnomoliesStatisticsSummaryComponent } from './anomolies-statistics-summary.component';

describe('AnomoliesStatisticsSummaryComponent', () => {
  let component: AnomoliesStatisticsSummaryComponent;
  let fixture: ComponentFixture<AnomoliesStatisticsSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnomoliesStatisticsSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnomoliesStatisticsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
