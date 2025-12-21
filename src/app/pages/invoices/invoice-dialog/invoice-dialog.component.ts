import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'src/app/core/services/settings/settings.service';
import { catchError, Subscription, tap, throwError } from 'rxjs';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';

import { DialogAction } from 'src/app/core/enums/dialog-action/dialog.action.enum';

import { IInputElementWithFlatpickr } from 'src/app/core/interfaces/IInputElementWithFlatpickr';

import { Invoice } from 'src/app/core/models/invoice/invoice.model';

export interface InvoiceDialogData {
  action: DialogAction;
  invoice: Invoice;
}

enum InvoiceDatePickerInput {
  BillingDateInput = '#billingDateInput'
}

@Component({
  selector: 'app-invoice-dialog',
  templateUrl: './invoice-dialog.component.html',
  styleUrl: './invoice-dialog.component.scss',
  standalone: false
})
export class InvoiceDialogComponent implements OnInit, OnDestroy {

  readonly apiService = inject(ApiService);
  readonly authService = inject(AuthService);
  readonly formBuilder = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<InvoiceDialogComponent>);
  readonly toastService = inject(ToastService);
  readonly translateService = inject(TranslateService);
  readonly settingsService = inject(SettingsService);

  readonly data = inject<InvoiceDialogData>(MAT_DIALOG_DATA);

  invoiceForm: FormGroup;

  createInvoiceSub: Subscription;
  updateInvoiceSub: Subscription;

  addMode: boolean;
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  
  displaySignPosition: string;
  
  constructor() {
    this.addMode = this.data.action === DialogAction.ADD;
    
    this.settingsService.settings$.subscribe(() => {
      this.displaySignPosition = this.translateService.currentLang == 'en-US' ? 'left' : 'right';

      this.updateFlatpickrLocales();
    });
  }
  
  ngOnInit() {
    this.initForm(this.data.invoice);
  }

  ngOnDestroy() {
    this.createInvoiceSub?.unsubscribe();
    this.updateInvoiceSub?.unsubscribe();
  }

  saveInvoice() {
    this.isLoading = true;
    this.isSubmitted = true;
    
    if (this.invoiceForm.valid) {
      Object.assign(this.data.invoice, this.invoiceForm.value);
      this.data.invoice.billingDate = moment(this.data.invoice.billingDate);
      this.data.invoice.updatedAt = moment();

      if (this.addMode) {
        this.createInvoice();
      } else {
        this.updateInvoice();
      }
    } else {
      setTimeout(() => this.isLoading = false, 500);
    }
  }

  private initDatePickers(invoice: Invoice) {
    setTimeout(() => {
      // No onChange here because petForm change event interfer with date format rendering

      flatpickr(InvoiceDatePickerInput.BillingDateInput, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: invoice.billingDate.toDate(),
        position: 'below'
      });
    }, 100);
  }

  private initForm(invoice: Invoice) {
    this.invoiceForm = this.formBuilder.group({
      billingDate: [invoice.billingDate, [Validators.required]],
      amount: [invoice.amount, [Validators.required, Validators.min(0)]],
      description: [invoice.description]
    })

    this.initDatePickers(this.data.invoice);
  }
  
  private updateFlatpickrLocales() {
    [InvoiceDatePickerInput.BillingDateInput].forEach(inputId => {
      const input = document.querySelector(inputId) as IInputElementWithFlatpickr;
      if (input?._flatpickr) {
        input._flatpickr.set('altFormat', this.translateService.instant('commons.dateFormats.flatpickr.date'));
        input._flatpickr.set('locale', this.settingsService.currentSettings.locale);
        input._flatpickr.redraw();
      }
    });
  }

  private createInvoice() {
    const serializeInvoice = this.data.invoice.serializeForSave();
    this.createInvoiceSub = this.apiService.post(`/pet-record/${ this.authService.selectedPetRecordValue.id }/invoice`, serializeInvoice).pipe(
      tap(() => {
        this.isSubmitted = false;
        this.dialogRef.close(true);
      }),
      catchError((error) => {
        this.isSubmitted = false;

        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.create'));
        console.error('Unable to create invoice', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

  private updateInvoice() {
    const serializeInvoice = this.data.invoice.serializeForSave();
    this.updateInvoiceSub = this.apiService.put(`/pet-record/${ this.authService.selectedPetRecordValue.id }/invoice/${ serializeInvoice.id }`, serializeInvoice).pipe(
      tap(() => {
        this.isLoading = false;
        this.isSubmitted = false;
        this.dialogRef.close(true);
      }),
      catchError((error) => {
        this.isLoading = false;

        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.update'));
        console.error('Unable to update invoice', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

}
