import moment from "moment";

import { DateService } from "../../services/date/date.service";

import { ISerializeModel, SerializeModel } from "../serialize.model";

export enum CalendarEventSource {
    CALENDAR = 0,
    VACCINE,
    WORMABLE
}

export interface ISerializedCalendarEvent extends ISerializeModel {
    title: string;
    startDate: string | null;
    description: string | null;
    petRecordId: string;
}

export interface IFullCalendarEventModel {
    id: string;
    title: string;
    start: Date;
    description: string | null;

    // local data
    backgroundColor: string;
    eventSource: number;
    icon: string;
}

export class CalendarEvent extends SerializeModel {

    title: string;
    startDate: moment.Moment;
    description: string | null = null;
    petRecordId: string;

    // local data
    eventSource: number;

    constructor(title: string = '', startDate: moment.Moment = moment(), eventSource: number = CalendarEventSource.CALENDAR, petRecordId: string = '') {
        super();

        this.title = title;
        this.startDate = startDate;
        this.petRecordId = petRecordId;

        // local data
        this.eventSource = eventSource;
    }

    convertToFullCalendarModel(): IFullCalendarEventModel {
        return {
            id: this.id,
            title: this.title,
            start: this.startDate.toDate(),
            description: this.description,
            
            // local data
            backgroundColor: this.getBackgroundColorWithType(),
            eventSource: this.eventSource,
            icon: this.getIconWithEventSource()
        }
    }
    
    override serializeForSave(): ISerializedCalendarEvent {
        let serializeFields = {
            title: this.title,
            startDate: DateService.getStringDateFromMoment(this.startDate),
            description: this.description,
            petRecordId: this.petRecordId
        };
        
        let serializeCalendarEvent: ISerializedCalendarEvent = Object.assign(serializeFields, super.serializeForSave());

        return serializeCalendarEvent;
    }

    override deserilizeFromSave(serializeCalendarEvent: ISerializedCalendarEvent) {
        try {
            super.deserilizeFromSave(serializeCalendarEvent);

            this.title = serializeCalendarEvent.title;
            this.startDate = DateService.getMomentFromStringDate(serializeCalendarEvent.startDate) as moment.Moment;
            this.description = serializeCalendarEvent.description;
            this.petRecordId = serializeCalendarEvent.petRecordId;
        } catch (exception) {
            console.error('Exception on deserialize calendar event model', exception);
        }
    }

    private getBackgroundColorWithType(): string {
        switch (this.eventSource) {
            case CalendarEventSource.VACCINE:
                return '#f29d5c';

            case CalendarEventSource.WORMABLE:
                return '#628bdd';

            case CalendarEventSource.CALENDAR:
            default:
                return '#00d1b2';
        }
    }

    private getIconWithEventSource(): string {
        switch (this.eventSource) {
            case CalendarEventSource.VACCINE:
                return 'far fa-syringe';

            case CalendarEventSource.WORMABLE:
                return 'far fa-shield-virus';

            case CalendarEventSource.CALENDAR:
            default:
                return 'far fa-calendar';
        }
    }

}