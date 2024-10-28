import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountReceivablesComponent } from './account-receivables.component';

describe('AccountReceivablesComponent', () => {
  let component: AccountReceivablesComponent;
  let fixture: ComponentFixture<AccountReceivablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountReceivablesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountReceivablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
