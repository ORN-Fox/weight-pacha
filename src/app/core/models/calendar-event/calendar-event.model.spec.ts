import moment from 'moment';

import { CalendarEvent } from './calendar-event.model';

describe('Invoice', () => {
    let calendarEvent: CalendarEvent;

    beforeEach(() => {
        calendarEvent = new CalendarEvent();
    });

    it('should create an instance', () => {
        expect(calendarEvent).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(calendarEvent.id).toBeDefined();
        expect(calendarEvent.title).toBe('');
        expect(moment.isMoment(calendarEvent.startDate)).toBe(true);
        expect(calendarEvent.description).toBeUndefined();
        expect(moment.isMoment(calendarEvent.createdAt)).toBe(true);
        expect(calendarEvent.updatedAt).toBeUndefined();
    });
});
