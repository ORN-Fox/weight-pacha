import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarOptions, EventClickArg, ViewMountArg } from '@fullcalendar/core';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';
import frLocale from '@fullcalendar/core/locales/fr';
import frCaLocale from '@fullcalendar/core/locales/fr-ca';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { DialogAction } from 'src/app/core/enums/dialog-action/dialog.action.enum';

import { CalendarEvent, CalendarEventSource, IFullCalendarEventModel, ISerializedCalendarEvent } from 'src/app/core/models/calendar-event/calendar-event.model';
import { ISerializedVaccine, Vaccine } from 'src/app/core/models/vaccine/vaccine.model';
import { ISerializedWormable, Wormable } from 'src/app/core/models/wormable/wormable.model';

import { CalendarEventDialogComponent, CalendarEventDialogData } from './calendar-event-dialog/calendar-event-dialog.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  standalone: false
})
export class CalendarComponent {

  readonly dialog = inject(MatDialog);
  readonly translateService = inject(TranslateService);

  APP_STORAGE_KEY: string = 'weight-pacha-calendar';
  APP_VACCINES_STORAGE_KEY: string = 'weight-pacha-vaccines';
  APP_WORMABLES_STORAGE_KEY: string = 'weight-pacha-wormables';

  calendarOptions: CalendarOptions;

  calendarEvents: CalendarEvent[] = [];

  timeFormat: string;

  constructor(
    private localStorageService: LocalStorageService,
    private serializerService: SerializerService,
    private settingsService: SettingsService
  ) {
    this.loadCalendarEvents();

    this.settingsService.settings$.subscribe(() => {
      this.timeFormat = this.translateService.instant('commons.dateFormats.time');

      this.updateFullCalendarLocale();
    });
  }

  addCalendarEvent() {
    const calendarEvent = new CalendarEvent();
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
    if (this.localStorageService.isItemExist(this.APP_STORAGE_KEY)) {
      let calendarEvents: CalendarEvent[] = [];
      const calendarEventsJSON = this.localStorageService.getItem(this.APP_STORAGE_KEY);

      calendarEventsJSON.calendarEvents.forEach((calendarEventJSON: ISerializedCalendarEvent) => {
        let calendarEvent = new CalendarEvent();
        calendarEvent.deserilizeFromSave(calendarEventJSON);
        calendarEvents.push(calendarEvent);
      });
      this.calendarEvents = calendarEvents;
    } else {
      this.localStorageService.setItem(this.APP_STORAGE_KEY, { calendarEvents: this.calendarEvents });
    }

    let vaccinesEvents = this.loadVaccinesEvents();
    let wormablesEvents = this.loadWormablesEvents();
    this.calendarEvents = this.calendarEvents.concat(vaccinesEvents, wormablesEvents);

    this.initCalendarOptions(this.calendarEvents);
  }

  private loadVaccinesEvents(): CalendarEvent[] {
    let vaccineEvents: CalendarEvent[] = [];

    if (this.localStorageService.isItemExist(this.APP_VACCINES_STORAGE_KEY)) {
      const vaccinesJSON = this.localStorageService.getItem(this.APP_VACCINES_STORAGE_KEY);

      vaccinesJSON.vaccines.forEach((vaccineJSON: ISerializedVaccine) => {
        let vaccine = new Vaccine();
        vaccine.deserilizeFromSave(vaccineJSON);

        let vaccineEvent = new CalendarEvent(vaccine.name, vaccine.injectionDate, CalendarEventSource.VACCINE);
        vaccineEvent.id = vaccine.id;
        vaccineEvents.push(vaccineEvent);
      });
    }

    return vaccineEvents;
  }

  private loadWormablesEvents(): CalendarEvent[] {
    let wormableEvents: CalendarEvent[] = [];

    if (this.localStorageService.isItemExist(this.APP_WORMABLES_STORAGE_KEY)) {
      const wormablesJSON = this.localStorageService.getItem(this.APP_WORMABLES_STORAGE_KEY);

      wormablesJSON.wormables.forEach((wormableJSON: ISerializedWormable) => {
        let wormable = new Wormable();
        wormable.deserilizeFromSave(wormableJSON);

        let wormableEvent = new CalendarEvent(wormable.name, wormable.injectionDate, CalendarEventSource.WORMABLE);
        wormableEvent.id = wormableEvent.id;
        wormableEvents.push(wormableEvent);
      });
    }

    return wormableEvents;
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
      this.settingsService.updateSettings({ calendarViewFormat: newCalendarViewFormat });
    }
  }

  private handleDateClick(arg: DateClickArg) {
    const calendarEvent = new CalendarEvent('', moment(arg.date));
    this.openCalendarEventDialog(false, calendarEvent);
  }

  private handleEventClick(arg: EventClickArg) {
    const calendarEventId: string = arg.event?._def?.publicId;
    const calendarEventSource: number = arg.event?.extendedProps['eventSource'];

    // TODO: enable vaccine and wormable crud event (comming soon 0.3.0 or api version)
    if (calendarEventId && calendarEventSource === CalendarEventSource.CALENDAR) {
      const calendarEvent = this.calendarEvents.filter(calendarEvent => calendarEvent.id == calendarEventId)[0];
      this.openCalendarEventDialog(true, calendarEvent);
    }
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
        switch (result.action) {
          case DialogAction.ADD:
            this.calendarEvents.push(result.calendarEvent);
            break;

          case DialogAction.UPDATE:
            const indexToUpdate = this.calendarEvents.findIndex(calendarEvent => calendarEvent.id === result.calendarEvent.id);
            if (indexToUpdate !== -1) {
              this.calendarEvents[indexToUpdate] = result.calendarEvent;
            }
            break;

          case DialogAction.DELETE:
            this.calendarEvents = this.calendarEvents.filter((calendarEvent) => calendarEvent.id !== result.calendarEvent.id);
            break;
        }

        this.saveCalendarEvents();
        this.refreshCalendarEventsInCalendarOptions();
      }
    });
  }

  // #endregion

  private saveCalendarEvents() {
    const calendarEvents = this.calendarEvents.filter((calendarEvent) => calendarEvent.eventSource === CalendarEventSource.CALENDAR);

    // TODO: enable vaccine and wormable crud event (comming soon 0.3.0 or api version)

    const serializedCalendarEvents = this.serializerService.serializeList(calendarEvents);
    this.localStorageService.setItem(this.APP_STORAGE_KEY, { calendarEvents: serializedCalendarEvents });
  }

}
