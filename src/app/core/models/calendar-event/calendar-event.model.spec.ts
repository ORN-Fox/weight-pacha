import moment from 'moment';

import { CalendarEvent, CalendarEventSource } from './calendar-event.model';

describe('CalendarEvent', () => {
    let calendarEvent: CalendarEvent;

    beforeEach(() => {
        calendarEvent = new CalendarEvent();
    });

    it('should create an instance', () => {
        expect(calendarEvent).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(calendarEvent.id).toBeUndefined();
        expect(calendarEvent.title).toBe('');
        expect(moment.isMoment(calendarEvent.startDate)).toBeTruthy();
        expect(calendarEvent.eventSource).toBe(CalendarEventSource.CALENDAR);
        expect(calendarEvent.description).toBeNull();
        expect(moment.isMoment(calendarEvent.createdAt)).toBeFalsy();
        expect(calendarEvent.updatedAt).toBeUndefined();
    });
});
