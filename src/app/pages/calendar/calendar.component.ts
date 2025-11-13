import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarOptions } from '@fullcalendar/core';
import { cloneDeep } from 'lodash';
import frLocale from '@fullcalendar/core/locales/fr';
import frCaLocale from '@fullcalendar/core/locales/fr-ca';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { CalendarEvent, IFullCalendarEventModel, ISerializedCalendarEvent } from 'src/app/core/models/calendar-event/calendar-event.model';

import { CalendarEventDialogComponent, CalendarEventDialogData } from './calendar-event-dialog/calendar-event-dialog.component';
import { DialogAction } from 'src/app/core/enums/dialog-action/dialog.action.enum';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  standalone: false
})
export class CalendarComponent {

  readonly dialog = inject(MatDialog);

  APP_STORAGE_KEY: string = 'weight-pacha-calendar';

  calendarOptions: CalendarOptions;

  calendarEvents: CalendarEvent[] = [];

  constructor(
    private localStorageService: LocalStorageService,
    private serializerService: SerializerService,
    private settingsService: SettingsService
  ) {
    this.loadCalendarEvents();

    this.settingsService.settings$.subscribe(() => {
      this.updateFullCalendarLocale();
    });
  }

  addCalendarEvent() {
    const calendarEvent = new CalendarEvent();
    this.openCalendarEventDialog(false, calendarEvent);
  }
  
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

    this.initCalendarOptions(this.calendarEvents);
  }

  private saveCalendarEvents() {
    const serializedCalendarEvents = this.serializerService.serializeList(this.calendarEvents);
    this.localStorageService.setItem(this.APP_STORAGE_KEY, { calendarEvents: serializedCalendarEvents });
  }

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
      dateClick: (info) => {
        const calendarEvent = new CalendarEvent('', moment(info.date));
        this.openCalendarEventDialog(false, calendarEvent);
      },
      eventClick: (arg) => {
        const calendarEventId: string = arg.event?._def?.publicId;
        if (calendarEventId) {
          const calendarEvent = this.calendarEvents.filter(calendarEvent => calendarEvent.id == calendarEventId)[0];
          this.openCalendarEventDialog(true, calendarEvent);
        }
      }
    };
  }

  private refreshCalendarEventsInCalendarOptions() {
    this.calendarOptions.events = this.convertToFullCalendarModel(this.calendarEvents);
  }

  private updateFullCalendarLocale() {
    this.calendarOptions.locale = this.settingsService.currentSettings.locale;
  }

  private convertToFullCalendarModel(calendarEvents: CalendarEvent[] = []): IFullCalendarEventModel[] {
    if (calendarEvents) {
      return calendarEvents.map((calendarEvent) => calendarEvent.convertToFullCalendarModel());
    }
    return calendarEvents;
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

}
