import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodButtonGroupComponent } from './pod-button-group.component';

describe('PodButtonGroupComponent', () => {
  let component: PodButtonGroupComponent;
  let fixture: ComponentFixture<PodButtonGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PodButtonGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodButtonGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
