import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightMonitoringComponent } from './weight-monitoring.component';

describe('WeightMonitoringComponent', () => {
  let component: WeightMonitoringComponent;
  let fixture: ComponentFixture<WeightMonitoringComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WeightMonitoringComponent]
    });
    fixture = TestBed.createComponent(WeightMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
