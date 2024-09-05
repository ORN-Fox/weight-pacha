import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureComponent } from './measure.component';

describe('MeasureComponent', () => {
  let component: MeasureComponent;
  let fixture: ComponentFixture<MeasureComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeasureComponent]
    });
    fixture = TestBed.createComponent(MeasureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
