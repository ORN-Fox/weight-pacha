import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
      providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          TranslateService
      ]
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
