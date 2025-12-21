import moment from "moment";

import { DateService } from '../../services/date/date.service';

import { ISerializeModel, SerializeModel } from '../serialize.model';

export interface ISerializedVaccine extends ISerializeModel {
    name: string;
    description: string | null;
    injectionDate: string;
    reminderDate: string | null;
    petRecordId: string;
}

export class Vaccine extends SerializeModel {

    name: string;
    description: string | null;
    injectionDate: moment.Moment;
    reminderDate?: moment.Moment | null;
    petRecordId: string;

    // local data
    editMode: boolean;
    age: number | null;

    constructor(name: string = '', injectionDate: moment.Moment = moment(), reminderDate?: moment.Moment | null, petRecordId: string = '') {
        super();
        
        this.name = name;
        this.injectionDate = injectionDate;
        this.reminderDate = reminderDate;
        this.petRecordId = petRecordId;

        // local data
        this.editMode = false;
    }

    override serializeForSave(): ISerializedVaccine {
        let serializeFields = {
            name: this.name,
            description: this.description,
            injectionDate: DateService.getStringDateFromMoment(this.injectionDate) as string,
            reminderDate: DateService.getStringDateFromMoment(this.reminderDate),
            petRecordId: this.petRecordId
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
            this.petRecordId = serializeVaccine.petRecordId;
        } catch (exception) {
            console.error('Exception on deserialize vaccine model', exception);
        }
    }

}