import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'src/app/core/services/settings/settings.service';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { IInputElementWithFlatpickr } from 'src/app/core/interfaces/IInputElementWithFlatpickr';

import { CalendarEvent } from 'src/app/core/models/calendar-event/calendar-event.model';

export interface CalendarEventDialogData {
  editMode: boolean;
  calendarEvent: CalendarEvent;
}

enum CalendarEventDatePickerInput {
  StartDateInput = '#startDateInput'
}

@Component({
  selector: 'app-calendar-event-dialog',
  templateUrl: './calendar-event-dialog.component.html',
  styleUrl: './calendar-event-dialog.component.scss',
  standalone: false
})
export class CalendarEventDialogComponent {

  readonly formBuilder = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<CalendarEventDialogComponent>);
  readonly translateService = inject(TranslateService);
  readonly settingsService = inject(SettingsService);
  readonly data = inject<CalendarEventDialogData>(MAT_DIALOG_DATA);

  calendarEventForm: FormGroup;
  
  constructor() {    
    this.settingsService.settings$.subscribe(() => {
      this.updateFlatpickrLocales();
    });
  }
  
  ngOnInit() {
    this.initForm(this.data.calendarEvent);
  }

  saveChanges() {
    if (this.calendarEventForm.valid) {
      Object.assign(this.data.calendarEvent, this.calendarEventForm.value);
      this.data.calendarEvent.startDate = moment(this.data.calendarEvent.startDate);
      this.data.calendarEvent.updatedAt = moment();

      const dialogResult: CalendarEventDialogData = {
        editMode: this.data.editMode,
        calendarEvent: this.data.calendarEvent
      };
      this.dialogRef.close(dialogResult);
    }
  }

  private initForm(calendarEvent: CalendarEvent) {
    this.calendarEventForm = this.formBuilder.group({
      startDate: [calendarEvent.startDate, [Validators.required]],
      title: [calendarEvent.title, [Validators.required]],
      description: [calendarEvent.description]
    })

    this.initDatePickers(this.data.calendarEvent);
  }

  private initDatePickers(calendarEvent: CalendarEvent) {
    setTimeout(() => {
      // No onChange here because petForm change event interfer with dateTime format rendering

      flatpickr(CalendarEventDatePickerInput.StartDateInput, {
        enableTime: true,
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.dateTime'),
        defaultDate: calendarEvent.startDate.toDate()
      });
    }, 100);
  }
  
  private updateFlatpickrLocales() {
    [CalendarEventDatePickerInput.StartDateInput].forEach(inputId => {
      const input = document.querySelector(inputId) as IInputElementWithFlatpickr;
      if (input?._flatpickr) {
        input._flatpickr.set('altFormat', this.translateService.instant('commons.dateFormats.flatpickr.dateTime'));
        input._flatpickr.set('locale', this.settingsService.currentSettings.locale);
        input._flatpickr.redraw();
      }
    });
  }

}
