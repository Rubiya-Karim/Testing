import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailoverRecoverComponent } from './failover-recover.component';

describe('FailoverRecoverComponent', () => {
  let component: FailoverRecoverComponent;
  let fixture: ComponentFixture<FailoverRecoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FailoverRecoverComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FailoverRecoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
