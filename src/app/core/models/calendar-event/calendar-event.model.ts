import moment from "moment";

import { DateService } from "../../services/date/date.service";

import { ISerializeModel, SerializeModel } from "../serialize.model";

export interface ISerializedCalendarEvent extends ISerializeModel {
    title: string;
    startDate: string | null;
    description: string;
}

export interface IFullCalendarEventModel {
    id: string;
    title: string;
    start: Date;
    description: string;
}

export class CalendarEvent extends SerializeModel {

    title: string;
    startDate: moment.Moment;
    description: string = '';

    constructor(title: string = '', startDate: moment.Moment = moment()) {
        super();

        this.title = title;
        this.startDate = startDate;
    }

    convertToFullCalendarModel(): IFullCalendarEventModel {
        return {
            id: this.id,
            title: this.title,
            start: this.startDate.toDate(),
            description: this.description
        }
    }
    
    override serializeForSave(): ISerializedCalendarEvent {
        let serializeFields = {
            title: this.title,
            startDate: DateService.getStringDateFromMoment(this.startDate),
            description: this.description
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
        } catch (exception) {
            console.error('Exception on deserialize calendar event model', exception);
        }
    }

}