import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { Vaccine } from 'src/app/core/models/vaccine/vaccine.model';

import { ActionButtonComponent } from 'src/app/core/components/action-button/action-button.component';
import { FormErrorComponent } from 'src/app/core/components/form-error/form-error.component';

import { VaccineDialogComponent } from './vaccine-dialog.component';

describe('VaccineDialogComponent', () => {
  let component: VaccineDialogComponent;
  let fixture: ComponentFixture<VaccineDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ActionButtonComponent,
        FormErrorComponent,
        VaccineDialogComponent
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        TranslateModule.forRoot({})
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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
