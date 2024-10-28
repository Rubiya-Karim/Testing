import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateModalComponent } from './create-update-modal.component';

describe('CreateUpdateModalComponent', () => {
  let component: CreateUpdateModalComponent;
  let fixture: ComponentFixture<CreateUpdateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateUpdateModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
