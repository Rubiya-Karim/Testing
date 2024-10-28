import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationChannelComponent } from './notification-channel.component';

describe('NotificationChannelComponent', () => {
  let component: NotificationChannelComponent;
  let fixture: ComponentFixture<NotificationChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationChannelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
