import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'src/app/core/services/settings/settings.service';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { IInputElementWithFlatpickr } from 'src/app/core/interfaces/IInputElementWithFlatpickr';

import { Vaccine } from 'src/app/core/models/vaccine/vaccine.model';

export interface VaccineDialogData {
  editMode: boolean;
  vaccine: Vaccine;
}

enum VaccineDatePickerInput {
  InjectionDateInput = '#injectionDateInput',
  ReminderDateInput = '#reminderDateInput'
}

@Component({
  selector: 'app-vaccine-dialog',
  templateUrl: './vaccine-dialog.component.html',
  styleUrl: './vaccine-dialog.component.scss',
  standalone: false
})
export class VaccineDialogComponent {

  readonly formBuilder = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<VaccineDialogComponent>);
  readonly translateService = inject(TranslateService);
  readonly settingsService = inject(SettingsService);
  readonly data = inject<VaccineDialogData>(MAT_DIALOG_DATA);

  vaccineForm: FormGroup;
  
  constructor() {    
    this.settingsService.settings$.subscribe(() => {
      this.updateFlatpickrLocales();
    });
  }
  
  ngOnInit() {
    this.initForm(this.data.vaccine);
  }

  reminderDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const reminderDate = moment(control.value);
      if (reminderDate) {
        if (reminderDate.isSameOrBefore(this.data.vaccine.injectionDate, 'day')) {
          return { 'sameOrBeforeReminderDateError': true };
        }
      }
      return null;
    };
  }

  saveChanges() {
    if (this.vaccineForm.valid) {
      Object.assign(this.data.vaccine, this.vaccineForm.value);
      this.data.vaccine.injectionDate = moment(this.data.vaccine.injectionDate);
      this.data.vaccine.reminderDate = this.data.vaccine.reminderDate ? moment(this.data.vaccine.reminderDate) : null,
      this.data.vaccine.updatedAt = moment();

      const dialogResult: VaccineDialogData = {
        editMode: this.data.editMode,
        vaccine: this.data.vaccine
      };
      this.dialogRef.close(dialogResult);
    }
  }

  private initForm(vaccine: Vaccine) {
    this.vaccineForm = this.formBuilder.group({
      injectionDate: [vaccine.injectionDate, [Validators.required]],
      name: [vaccine.name, [Validators.required]],
      reminderDate: [vaccine.reminderDate, [this.reminderDateValidator()]],
      description: [vaccine.description]
    })

    this.initDatePickers(this.data.vaccine);
  }

  private initDatePickers(vaccine: Vaccine) {
    setTimeout(() => {
      // No onChange here because petForm change event interfer with date format rendering

      flatpickr(VaccineDatePickerInput.InjectionDateInput, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: vaccine.injectionDate.toDate()
      });

      flatpickr(VaccineDatePickerInput.ReminderDateInput, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: vaccine.reminderDate?.toDate()
      });
    }, 100);
  }
  
  private updateFlatpickrLocales() {
    [VaccineDatePickerInput.InjectionDateInput, VaccineDatePickerInput.ReminderDateInput].forEach(inputId => {
      const input = document.querySelector(inputId) as IInputElementWithFlatpickr;
      if (input?._flatpickr) {
        input._flatpickr.set('altFormat', this.translateService.instant('commons.dateFormats.flatpickr.date'));
        input._flatpickr.set('locale', this.settingsService.currentSettings.locale);
        input._flatpickr.redraw();
      }
    });
  }

}
