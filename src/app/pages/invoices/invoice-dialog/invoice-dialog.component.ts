import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'src/app/core/services/settings/settings.service';
import flatpickr from 'flatpickr';
import moment from 'moment';

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
export class InvoiceDialogComponent {

  readonly formBuilder = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<InvoiceDialogComponent>);
  readonly translateService = inject(TranslateService);
  readonly settingsService = inject(SettingsService);
  readonly data = inject<InvoiceDialogData>(MAT_DIALOG_DATA);

  invoiceForm: FormGroup;

  editMode: boolean;
  submitted: boolean = false;
  
  displaySignPosition: string;
  
  constructor() {
    this.editMode = this.data.action === DialogAction.UPDATE;
    
    this.settingsService.settings$.subscribe(() => {
      this.displaySignPosition = this.translateService.currentLang == 'en-US' ? 'left' : 'right';

      this.updateFlatpickrLocales();
    });
  }
  
  ngOnInit() {
    this.initForm(this.data.invoice);
  }

  saveInvoice() {
    this.submitted = true;
    
    if (this.invoiceForm.valid) {
      Object.assign(this.data.invoice, this.invoiceForm.value);
      this.data.invoice.billingDate = moment(this.data.invoice.billingDate);
      this.data.invoice.updatedAt = moment();

      this.submitted = false;

      const dialogResult: InvoiceDialogData = {
        action: this.data.action == DialogAction.ADD ? DialogAction.ADD : DialogAction.UPDATE,
        invoice: this.data.invoice
      };
      this.dialogRef.close(dialogResult);
    }
  }

  private initForm(invoice: Invoice) {
    this.invoiceForm = this.formBuilder.group({
      billingDate: [invoice.billingDate, [Validators.required]],
      amount: [invoice.amount, [Validators.required, Validators.min(0)]],
      description: [invoice.description]
    })

    this.initDatePickers(this.data.invoice);
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

}
