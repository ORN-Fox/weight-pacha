import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { Vaccine } from 'src/app/core/models/vaccine/vaccine.model';

import { VaccineDialogComponent } from './vaccine-dialog.component';

describe('VaccineDialogComponent', () => {
  let component: VaccineDialogComponent;
  let fixture: ComponentFixture<VaccineDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        VaccineDialogComponent
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        TranslateModule.forRoot({})
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            action: 0,
            vaccine: new Vaccine()
          }
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(VaccineDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
