import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoVaccineRageAlertComponent } from './no-vaccine-rage-alert.component';

describe('NoVaccineRageAlertComponent', () => {
  let component: NoVaccineRageAlertComponent;
  let fixture: ComponentFixture<NoVaccineRageAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoVaccineRageAlertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoVaccineRageAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
