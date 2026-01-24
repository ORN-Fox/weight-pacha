import moment from "moment";

import { DateService } from '../services/date/date.service';

export interface ISerializeModel {
    id: string;
    createdAt: string;
    updatedAt: string | null;
}

export abstract class SerializeModel {
    
    id: string;
    createdAt: moment.Moment | null;
    updatedAt: moment.Moment | null;

    constructor() {}

    serializeForSave(): ISerializeModel {
        let serializeModel: ISerializeModel = {
            id: this.id,
            createdAt: DateService.getStringDateFromMoment(this.createdAt) as string,
            updatedAt: DateService.getStringDateFromMoment(this.updatedAt)
        };

        return serializeModel;
    }

    deserilizeFromSave(serializeVaccine: ISerializeModel) {
        try {
            this.id = serializeVaccine.id;
            this.createdAt = DateService.getMomentFromStringDate(serializeVaccine.createdAt);
            this.updatedAt = DateService.getMomentFromStringDate(serializeVaccine.updatedAt);
        } catch (exception) {
            console.error('Exception on deserialize model', exception);
        }
    }

}