import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashReportComponent } from './dash-report.component';

describe('DashReportComponent', () => {
  let component: DashReportComponent;
  let fixture: ComponentFixture<DashReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
