import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ECEOperationComponent } from './ece-operation.component';

describe('ECEOperationComponent', () => {
  let component: ECEOperationComponent;
  let fixture: ComponentFixture<ECEOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ECEOperationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ECEOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
