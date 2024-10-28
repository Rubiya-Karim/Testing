import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CacheStateManagementComponent } from './cache-state-management.component';

describe('CacheStateManagementComponent', () => {
  let component: CacheStateManagementComponent;
  let fixture: ComponentFixture<CacheStateManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CacheStateManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CacheStateManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
