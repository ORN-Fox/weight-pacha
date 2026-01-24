import { Component, inject, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarOptions, EventClickArg, ViewMountArg } from '@fullcalendar/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, Subscription, tap, throwError } from 'rxjs';
import { cloneDeep } from 'lodash';
import frLocale from '@fullcalendar/core/locales/fr';
import frCaLocale from '@fullcalendar/core/locales/fr-ca';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import moment from 'moment';

import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';

import { DialogAction } from 'src/app/core/enums/dialog-action/dialog.action.enum';

import { CalendarEvent, CalendarEventSource, IFullCalendarEventModel, ISerializedCalendarEvent } from 'src/app/core/models/calendar-event/calendar-event.model';

import { CalendarEventDialogComponent, CalendarEventDialogData } from './calendar-event-dialog/calendar-event-dialog.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  standalone: false
})
export class CalendarComponent implements OnDestroy {

  readonly apiService = inject(ApiService);
  readonly authService = inject(AuthService);
  readonly dialog = inject(MatDialog);
  readonly localStorageService = inject(LocalStorageService);
  readonly serializerService = inject(SerializerService);
  readonly settingsService = inject(SettingsService);
  readonly toastService = inject(ToastService);
  readonly translateService = inject(TranslateService);

  calendarOptions: CalendarOptions;

  calendarEvents: CalendarEvent[] = [];

  loadCalendarEventsSub: Subscription;

  timeFormat: string;

  constructor() {
    this.loadCalendarEvents();

    this.settingsService.settings$.subscribe(() => {
      this.timeFormat = this.translateService.instant('commons.dateFormats.time');

      this.updateFullCalendarLocale();
    });
  }

  ngOnDestroy() {
    this.loadCalendarEventsSub?.unsubscribe();
  }

  addCalendarEvent() {
    const calendarEvent = new CalendarEvent();
    calendarEvent.petRecordId = this.authService.selectedPetRecordValue.id;
    this.openCalendarEventDialog(false, calendarEvent);
  }

  getEventTime(date: any): string {
    return moment(date).format(this.timeFormat);
  }

  shouldDisplayCustomData(): boolean {
    return this.settingsService.currentSettings.calendarViewFormat == 'dayGridMonth';
  }

  // #region loading data

  private loadCalendarEvents() {
    this.calendarEvents = [];
    this.initCalendarOptions();

    this.loadCalendarEventsSub = this.apiService.get<ISerializedCalendarEvent[]>(`/pet-record/${ this.authService.selectedPetRecordValue.id }/calendar-events`).pipe(
      tap((serializedCalendarEvents: ISerializedCalendarEvent[]) => {
        let calendarEvents: CalendarEvent[] = [];
        serializedCalendarEvents.forEach((calendarEventJSON: ISerializedCalendarEvent) => {
          let calendarEvent = new CalendarEvent();
          calendarEvent.deserilizeFromSave(calendarEventJSON);
          calendarEvents.push(calendarEvent);
        });
        this.calendarEvents = calendarEvents;
        this.refreshCalendarEventsInCalendarOptions();
      }),
      catchError((error) => {
        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.load'));
        console.error('Unable to create calendar event', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

  // #endregion 
  
  // #region calendar actions

  private initCalendarOptions(calendarEvents: CalendarEvent[] = []) {
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin, listPlugin],
      locales: [frLocale, frCaLocale],
      locale: this.settingsService.currentSettings.locale,
      initialView: this.settingsService.currentSettings.calendarViewFormat,
      headerToolbar: {
        start: 'prev,today,next',
        center: 'title',
        end: 'dayGridMonth,listMonth'
      },
      events: this.convertToFullCalendarModel(calendarEvents),
      viewDidMount: (arg) => this.handViewFormatChange(arg),
      dateClick: (arg) => this.handleDateClick(arg),
      eventClick: (arg) => this.handleEventClick(arg)
    }
  }

  private convertToFullCalendarModel(calendarEvents: CalendarEvent[] = []): IFullCalendarEventModel[] {
    if (calendarEvents) {
      return calendarEvents.map((calendarEvent) => calendarEvent.convertToFullCalendarModel());
    }
    return calendarEvents;
  }

  private refreshCalendarEventsInCalendarOptions() {
    this.calendarOptions.events = this.convertToFullCalendarModel(this.calendarEvents);
  }

  private updateFullCalendarLocale() {
    this.calendarOptions.locale = this.settingsService.currentSettings.locale;
  }

  private handViewFormatChange(arg: ViewMountArg) {
    const newCalendarViewFormat = arg.view.type;
    if (newCalendarViewFormat && newCalendarViewFormat != this.settingsService.currentSettings.calendarViewFormat) {
      this.settingsService.updateSettings(this.authService.userValue.id, { calendarViewFormat: newCalendarViewFormat });
    }
  }

  private handleDateClick(arg: DateClickArg) {
    const calendarEvent = new CalendarEvent('', moment(arg.date), CalendarEventSource.CALENDAR, this.authService.selectedPetRecordValue.id);
    this.openCalendarEventDialog(false, calendarEvent);
  }

  private handleEventClick(arg: EventClickArg) {
    const calendarEventId: string = arg.event?._def?.publicId;
    const calendarEvent = this.calendarEvents.filter(calendarEvent => calendarEvent.id == calendarEventId)[0];
    this.openCalendarEventDialog(true, calendarEvent);
  }

  private openCalendarEventDialog(editMode: boolean = false, calendarEvent: CalendarEvent) {
    const action = editMode ? DialogAction.UPDATE : DialogAction.ADD;
    const dialogRef = this.dialog.open(CalendarEventDialogComponent, {
      data: { action: action, calendarEvent: cloneDeep(calendarEvent) },
      autoFocus: false,
      disableClose: true,
      width: '40rem'
    });

    dialogRef.afterClosed().subscribe((result: CalendarEventDialogData) => {
      if (result) {
        this.loadCalendarEvents();
      }
    });
  }

  // #endregion

}
