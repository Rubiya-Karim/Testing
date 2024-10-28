import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingInfoDetailsComponent } from './billing-info-details.component';

describe('BillingInfoDetailsComponent', () => {
  let component: BillingInfoDetailsComponent;
  let fixture: ComponentFixture<BillingInfoDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingInfoDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingInfoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
