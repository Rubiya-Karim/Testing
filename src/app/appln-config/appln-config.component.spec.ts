import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplnConfigComponent } from './appln-config.component';

describe('ApplnConfigComponent', () => {
  let component: ApplnConfigComponent;
  let fixture: ComponentFixture<ApplnConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplnConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplnConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
