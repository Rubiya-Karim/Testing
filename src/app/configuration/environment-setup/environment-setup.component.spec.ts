import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvironmentSetupComponent } from './environment-setup.component';

describe('EnvironmentSetupComponent', () => {
  let component: EnvironmentSetupComponent;
  let fixture: ComponentFixture<EnvironmentSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnvironmentSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnvironmentSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
