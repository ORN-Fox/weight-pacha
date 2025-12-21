import moment from "moment";

import { DateService } from '../../services/date/date.service';

import { ISerializeModel, SerializeModel } from '../serialize.model';

export interface ISerializedWormable extends ISerializeModel {
    name: string;
    description: string | null;
    injectionDate: string;
    reminderDate: string | null;
    petRecordId: string;
}

export class Wormable extends SerializeModel {

    name: string;
    description: string | null;
    injectionDate: moment.Moment;
    reminderDate?: moment.Moment | null;
    petRecordId: string;

    // local data
    editMode: boolean;

    constructor(name: string = '', injectionDate: moment.Moment = moment(), reminderDate?: moment.Moment | null, petRecordId: string = '') {
        super();
        
        this.name = name;
        this.injectionDate = injectionDate;
        this.reminderDate = reminderDate;
        this.petRecordId = petRecordId;

        // local data
        this.editMode = false;
    }

    override serializeForSave(): ISerializedWormable {
        let serializeFields = {
            name: this.name,
            description: this.description,
            injectionDate: DateService.getStringDateFromMoment(this.injectionDate) as string,
            reminderDate: DateService.getStringDateFromMoment(this.reminderDate),
            petRecordId: this.petRecordId
        };
        
        let serializeWormable: ISerializedWormable = Object.assign(serializeFields, super.serializeForSave());

        return serializeWormable;
    }

    override deserilizeFromSave(serializeWormable: ISerializedWormable) {
        try {
            super.deserilizeFromSave(serializeWormable);

            this.name = serializeWormable.name;
            this.description = serializeWormable.description;
            this.injectionDate = DateService.getMomentFromStringDate(serializeWormable.injectionDate) as moment.Moment;
            this.reminderDate = DateService.getMomentFromStringDate(serializeWormable.reminderDate);
            this.petRecordId = serializeWormable.petRecordId;
        } catch (exception) {
            console.error('Exception on deserialize wormable model', exception);
        }
    }

}