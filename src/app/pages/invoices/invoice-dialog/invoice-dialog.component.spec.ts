import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { Invoice } from 'src/app/core/models/invoice/invoice.model';

import { ActionButtonComponent } from 'src/app/core/components/action-button/action-button.component';
import { FormErrorComponent } from 'src/app/core/components/form-error/form-error.component';

import { InvoiceDialogComponent } from './invoice-dialog.component';

describe('InvoiceDialogComponent', () => {
  let component: InvoiceDialogComponent;
  let fixture: ComponentFixture<InvoiceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ActionButtonComponent,
        FormErrorComponent,
        InvoiceDialogComponent
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
            invoice: new Invoice()
          }
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
