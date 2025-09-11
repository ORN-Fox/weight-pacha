import moment from "moment";

import { DateService } from '../../services/date/date.service';

import { ISerializeModel, SerializeModel } from '../serialize.model';

export interface ISerializedVaccine extends ISerializeModel {
    name: string;
    description: string | null;
    injectionDate: string;
    reminderDate: string | null;
}

export class Vaccine extends SerializeModel {

    name: string;
    description: string | null;
    injectionDate: moment.Moment;
    reminderDate?: moment.Moment | null;

    // local data
    editMode: boolean;
    age: number;

    constructor(name: string, injectionDate: moment.Moment, reminderDate?: moment.Moment | null) {
        super();
        
        this.name = name;
        this.injectionDate = injectionDate;
        this.reminderDate = reminderDate;

        // local data
        this.editMode = false;
    }

    override serializeForSave(): ISerializedVaccine {
        let serializeFields = {
            name: this.name,
            description: this.description,
            injectionDate: DateService.getStringDateFromMoment(this.injectionDate) as string,
            reminderDate: DateService.getStringDateFromMoment(this.reminderDate)
        };
        
        let serializeVaccine: ISerializedVaccine = Object.assign(serializeFields, super.serializeForSave());

        return serializeVaccine;
    }

    override deserilizeFromSave(serializeVaccine: ISerializedVaccine) {
        try {
            super.deserilizeFromSave(serializeVaccine);

            this.name = serializeVaccine.name;
            this.description = serializeVaccine.description;
            this.injectionDate = DateService.getMomentFromStringDate(serializeVaccine.injectionDate) as moment.Moment;
            this.reminderDate = DateService.getMomentFromStringDate(serializeVaccine.reminderDate);
        } catch (exception) {
            console.error('Exception on deserialize vaccine model', exception);
        }
    }

}