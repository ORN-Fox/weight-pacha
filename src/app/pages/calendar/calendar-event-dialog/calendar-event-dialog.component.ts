import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { SettingsService } from 'src/app/core/services/settings/settings.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';

import { DialogAction } from 'src/app/core/enums/dialog-action/dialog.action.enum';

import { IInputElementWithFlatpickr } from 'src/app/core/interfaces/IInputElementWithFlatpickr';

import { catchError, Subscription, tap, throwError } from 'rxjs';
import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CalendarEvent, CalendarEventSource } from 'src/app/core/models/calendar-event/calendar-event.model';

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
export class CalendarEventDialogComponent implements OnInit, OnDestroy {

  readonly apiService = inject(ApiService);
  readonly authService = inject(AuthService);
  readonly dialogRef = inject(MatDialogRef<CalendarEventDialogComponent>);
  readonly formBuilder = inject(FormBuilder);
  readonly settingsService = inject(SettingsService);
  readonly toastService = inject(ToastService);
  readonly translateService = inject(TranslateService);

  readonly data = inject<CalendarEventDialogData>(MAT_DIALOG_DATA);

  calendarEventForm: FormGroup;

  createCalendarEventSub: Subscription;
  deleteCalendarEventSub: Subscription;
  updateCalendarEventSub: Subscription;

  calendarEventSource = CalendarEventSource;
  calendarEventSources = [
    CalendarEventSource.CALENDAR,
    CalendarEventSource.VACCINE,
    CalendarEventSource.WORMABLE
  ];

  addMode: boolean;
  isDeleteLoading: boolean = false;
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  
  constructor() {
    this.addMode = this.data.action === DialogAction.ADD;

    this.settingsService.settings$.subscribe(() => {
      this.updateFlatpickrLocales();
    });
  }
  
  ngOnInit() {
    this.initForm(this.data.calendarEvent);
  }

  ngOnDestroy() {
    this.createCalendarEventSub?.unsubscribe();
    this.deleteCalendarEventSub?.unsubscribe();
    this.updateCalendarEventSub?.unsubscribe();
  }

  deleteCalendarEvent() {
    this.toastService.showConfirm().then((result: { isConfirmed: boolean; }) => {
      if (result.isConfirmed) {
        this.onDeleteCalendarEvent();
      }
    });
  }

  saveCalendarEvent() {
    this.isLoading = true;
    this.isSubmitted = true;

    if (this.calendarEventForm.valid) {
      Object.assign(this.data.calendarEvent, this.calendarEventForm.value);
      this.data.calendarEvent.startDate = moment(this.data.calendarEvent.startDate);
      this.data.calendarEvent.updatedAt = moment();

      if (this.addMode) {
        this.createCalendarEvent();
      } else {
        this.updateCalendarEvent();
      }
    } else {
      setTimeout(() => this.isLoading = false, 500);
    }
  }

  private initForm(calendarEvent: CalendarEvent) {
    this.calendarEventForm = this.formBuilder.group({
      startDate: [calendarEvent.startDate, [Validators.required]],
      title: [calendarEvent.title, [Validators.required]],
      description: [calendarEvent.description],
      eventSource: [{ value: calendarEvent.eventSource, disabled: !this.addMode }, [Validators.required]]
    });

    this.initDatePickers(this.data.calendarEvent);
  }

  private initDatePickers(calendarEvent: CalendarEvent) {
    setTimeout(() => {
      // No onChange here because petForm change event interfer with dateTime format rendering

      flatpickr(CalendarEventDatePickerInput.StartDateInput, {
        enableTime: true,
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.dateTime'),
        defaultDate: calendarEvent.startDate.toDate(),
        position: 'below'
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

  private createCalendarEvent() {
      const serializeCalendarEvent = this.data.calendarEvent.serializeForSave();
      this.createCalendarEventSub = this.apiService.post(`/pet-record/${ this.authService.selectedPetRecordValue.id }/calendar-event`, serializeCalendarEvent).pipe(
        tap(() => {
          this.isLoading = false;
          this.isSubmitted = false;
          this.dialogRef.close(true);
        }),
        catchError((error) => {
          this.isLoading = false;
  
          this.toastService.showToast('error', this.translateService.instant('commons.toast.error.create'));
          console.error('Unable to create calendar event', error);
          return throwError(() => error);
        }),
      ).subscribe();
    }
  
    private updateCalendarEvent() {
      const serializeCalendarEvent = this.data.calendarEvent.serializeForSave();
      this.updateCalendarEventSub = this.apiService.put(`/pet-record/${this.authService.selectedPetRecordValue.id}/calendar-event/${serializeCalendarEvent.id}`, serializeCalendarEvent).pipe(
        tap(() => {
          this.isSubmitted = false;
          this.dialogRef.close(true);
        }),
        catchError((error) => {
          this.isLoading = false;
  
          this.toastService.showToast('error', this.translateService.instant('commons.toast.error.update'));
          console.error('Unable to update calendar event', error);
          return throwError(() => error);
        }),
      ).subscribe();
    }

  private onDeleteCalendarEvent() {
    this.isDeleteLoading = true;
    this.deleteCalendarEventSub = this.apiService.delete(`/pet-record/${this.authService.selectedPetRecordValue.id}/calendar-event/${ this.data.calendarEvent.id }/event-source/${ this.data.calendarEvent.eventSource }`).pipe(
      tap(() => {
        this.isDeleteLoading = false;
        this.dialogRef.close(true);
      }),
      catchError((error) => {
        this.isDeleteLoading = false;

        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.delete'));
        console.error('Unable to delete calendar event', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

}
