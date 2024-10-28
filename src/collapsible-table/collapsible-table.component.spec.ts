import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsibleTableComponent } from './collapsible-table.component';

describe('CollapsibleTableComponent', () => {
  let component: CollapsibleTableComponent;
  let fixture: ComponentFixture<CollapsibleTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollapsibleTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollapsibleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
