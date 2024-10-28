import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteSetupComponent } from './site-setup.component';

describe('SiteSetupComponent', () => {
  let component: SiteSetupComponent;
  let fixture: ComponentFixture<SiteSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
