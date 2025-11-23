import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { NoVaccineRageAlertComponent } from './no-vaccine-rage-alert.component';

describe('NoVaccineRageAlertComponent', () => {
  let component: NoVaccineRageAlertComponent;
  let fixture: ComponentFixture<NoVaccineRageAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        NoVaccineRageAlertComponent
      ],
      imports: [
        TranslateModule.forRoot({})
      ],
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
