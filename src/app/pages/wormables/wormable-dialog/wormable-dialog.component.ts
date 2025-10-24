import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'src/app/core/services/settings/settings.service';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { IInputElementWithFlatpickr } from 'src/app/core/interfaces/IInputElementWithFlatpickr';

import { Wormable } from 'src/app/core/models/wormable/wormable.model';

export interface WormableDialogData {
  editMode: boolean;
  wormable: Wormable;
}

@Component({
  selector: 'app-wormable-dialog',
  templateUrl: './wormable-dialog.component.html',
  styleUrl: './wormable-dialog.component.scss',
  standalone: false
})
export class WormableDialogComponent {

  readonly formBuilder = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<WormableDialogComponent>);
  readonly translateService = inject(TranslateService);
  readonly settingsService = inject(SettingsService);
  readonly data = inject<WormableDialogData>(MAT_DIALOG_DATA);

  wormableForm: FormGroup;
  
  constructor() {    
    this.settingsService.settings$.subscribe(() => {
      this.updateFlatpickrLocales();
    });
  }
  
  ngOnInit() {
    this.initForm(this.data.wormable);
  }

  reminderDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const reminderDate = moment(control.value);
      console.log('validtor', reminderDate)
      if (reminderDate) {
        console.log('a', this.data.wormable.injectionDate);
        let a = reminderDate.isSameOrBefore(this.data.wormable.injectionDate, 'day');
        console.log('a', a)
        if (a)
        return { 'sameOrBeforeReminderDateError': true };
      }
      return null;
    };
  }

  saveChanges() {
    if (this.wormableForm.valid) {
      Object.assign(this.data.wormable, this.wormableForm.value);
      this.data.wormable.injectionDate = moment(this.data.wormable.injectionDate);
      this.data.wormable.reminderDate = this.data.wormable.reminderDate ? moment(this.data.wormable.reminderDate) : null,
      this.data.wormable.updatedAt = moment();

      const dialogResult: WormableDialogData = {
        editMode: this.data.editMode,
        wormable: this.data.wormable
      };
      this.dialogRef.close(dialogResult);
    }
  }

  private initForm(wormable: Wormable) {
    this.wormableForm = this.formBuilder.group({
      injectionDate: [wormable.injectionDate, [Validators.required]],
      name: [wormable.name, [Validators.required]],
      reminderDate: [wormable.reminderDate, [this.reminderDateValidator()]],
      description: [wormable.description]
    })

    this.initDatePickers(this.data.wormable);
  }

  private initDatePickers(wormable: Wormable) {
    setTimeout(() => {
      // No onChange here because petForm change event interfer with date format rendering

      flatpickr('#injectionDateInput', {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: wormable.injectionDate.toDate()
      });

      flatpickr('#reminderDateInput', {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: wormable.reminderDate?.toDate()
      });
    }, 100);
  }
  
  private updateFlatpickrLocales() {
    ['injectionDateInput', 'reminderDateInput'].forEach(inputId => {
      const input = document.querySelector(inputId) as IInputElementWithFlatpickr;
      if (input?._flatpickr) {
        input._flatpickr.set('altFormat', this.translateService.instant('commons.dateFormats.flatpickr.date'));
        input._flatpickr.set('locale', this.settingsService.currentSettings.locale);
        input._flatpickr.redraw();
      }
    });
  }

}
