import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapMarkerViewComponent } from './map-marker-view.component';

describe('MapMarkerViewComponent', () => {
  let component: MapMarkerViewComponent;
  let fixture: ComponentFixture<MapMarkerViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapMarkerViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapMarkerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
