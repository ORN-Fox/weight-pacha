import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { SettingsService } from 'src/app/core/services/settings/settings.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';

import { DialogAction } from 'src/app/core/enums/dialog-action/dialog.action.enum';

import { IInputElementWithFlatpickr } from 'src/app/core/interfaces/IInputElementWithFlatpickr';

import { CalendarEvent } from 'src/app/core/models/calendar-event/calendar-event.model';

export interface CalendarEventDialogData {
  action: DialogAction;
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

  editMode: boolean;
  
  constructor() {
    this.editMode = this.data.action === DialogAction.UPDATE;

    this.settingsService.settings$.subscribe(() => {
      this.updateFlatpickrLocales();
    });
  }
  
  ngOnInit() {
    this.initForm(this.data.calendarEvent);
  }

  saveCalendarEvent() {
    if (this.calendarEventForm.valid) {
      Object.assign(this.data.calendarEvent, this.calendarEventForm.value);
      this.data.calendarEvent.startDate = moment(this.data.calendarEvent.startDate);
      this.data.calendarEvent.updatedAt = moment();

      const dialogResult: CalendarEventDialogData = {
        action: this.data.action == DialogAction.ADD ? DialogAction.ADD : DialogAction.UPDATE,
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
