import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { Measure } from '../../models/measure/measure.model';

import { MeasureComponent } from './measure.component';

describe('MeasureComponent', () => {
  let component: MeasureComponent;
  let fixture: ComponentFixture<MeasureComponent>;

  beforeEach(() => {
    const measure = new Measure();

    TestBed.configureTestingModule({
      declarations: [MeasureComponent],
      imports: [
        TranslateModule.forRoot({})
      ],
    });
    fixture = TestBed.createComponent(MeasureComponent);
    component = fixture.componentInstance;
    component.measure = measure;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
