import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarOptions } from '@fullcalendar/core';
import { cloneDeep } from 'lodash';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';

import { CalendarEvent, IFullCalendarEventModel, ISerializedCalendarEvent } from 'src/app/core/models/calendar-event/calendar-event.model';

import { CalendarEventDialogComponent, CalendarEventDialogData } from './calendar-event-dialog/calendar-event-dialog.component';

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
    private serializerService: SerializerService
  ) {
    this.loadCalendarEvents();
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
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      events: this.convertToFullCalendarModel(calendarEvents),
      dateClick: (info) => {
        const calendarEvent = new CalendarEvent('', moment(info.date));
        this.openCalendarEventDialog(false, calendarEvent);
      },
      eventClick: (arg) => {
        const calendarEventId = arg.event?._def?.publicId;
        if (calendarEventId) {
          const calendarEvent = this.calendarEvents.filter(a => a.id == calendarEventId)[0];
          this.openCalendarEventDialog(true, calendarEvent);
        }
      }
    };
  }

  private refreshCalendarEventsInCalendarOptions() {
    this.calendarOptions.events = this.convertToFullCalendarModel(this.calendarEvents);
  }

  private convertToFullCalendarModel(calendarEvents: CalendarEvent[] = []): IFullCalendarEventModel[] {
    if (calendarEvents) {
      return calendarEvents.map((calendarEvent) => calendarEvent.convertToFullCalendarModel());
    }
    return calendarEvents;
  }

  private openCalendarEventDialog(editMode: boolean = false, calendarEvent: CalendarEvent) {
    const dialogRef = this.dialog.open(CalendarEventDialogComponent, {
      data: { editMode: editMode, calendarEvent: cloneDeep(calendarEvent) },
      autoFocus: false,
      disableClose: true,
      width: '40rem'
    });

    dialogRef.afterClosed().subscribe((result: CalendarEventDialogData) => {
      if (result) {
        if (result.editMode) {
          const index = this.calendarEvents.findIndex(calendarEvent => calendarEvent.id === result.calendarEvent.id);
          if (index !== -1) {
            this.calendarEvents[index] = result.calendarEvent;
          }
        } else {
          this.calendarEvents.push(result.calendarEvent);
        }
        this.saveCalendarEvents();
        this.refreshCalendarEventsInCalendarOptions();
      }
    });
  }

}
