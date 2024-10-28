import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EceStateComponent } from './ece-state.component';

describe('EceStateComponent', () => {
  let component: EceStateComponent;
  let fixture: ComponentFixture<EceStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EceStateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EceStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
