import moment from "moment";

import { DateService } from '../../services/date/date.service';

import { ISerializeModel, SerializeModel } from '../serialize.model';

export interface ISerializedMeasure extends ISerializeModel {
    date: string,
    weight: number;
}

export class Measure extends SerializeModel {

    date: moment.Moment;
    weight: number;

    constructor(date: moment.Moment = moment(), weigth: number = 1) {
        super();

        this.date = date;
        this.weight = weigth;
    }

    override serializeForSave(): ISerializedMeasure {
        let serializeFields = {
            date: DateService.getStringDateFromMoment(this.date) as string,
            weight: this.weight
        };

        let serializeMeasure: ISerializedMeasure = Object.assign(serializeFields, super.serializeForSave());

        return serializeMeasure;
    }

    override deserilizeFromSave(serializeMeasure: ISerializedMeasure) {
        try {
            super.deserilizeFromSave(serializeMeasure);
            
            this.date = DateService.getMomentFromStringDate(serializeMeasure.date) as moment.Moment;
            this.weight = serializeMeasure.weight;
        } catch (exception) {
            console.error('Exception on deserialize measure model', exception);
        }
    }

}