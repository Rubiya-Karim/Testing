import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FederationManagementComponent } from './federation-management.component';

describe('FederationManagementComponent', () => {
  let component: FederationManagementComponent;
  let fixture: ComponentFixture<FederationManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FederationManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FederationManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
