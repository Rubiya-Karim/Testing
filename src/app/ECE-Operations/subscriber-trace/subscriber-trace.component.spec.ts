import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberTraceComponent } from './subscriber-trace.component';

describe('SubscriberTraceComponent', () => {
  let component: SubscriberTraceComponent;
  let fixture: ComponentFixture<SubscriberTraceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscriberTraceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriberTraceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
