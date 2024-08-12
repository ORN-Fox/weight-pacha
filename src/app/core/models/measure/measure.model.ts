import * as moment from "moment";

export interface ISerializedMeasure {
    date: string,
    weight: number | null;
}

export class Measure {

    date: moment.Moment;
    weigth: number | null;

    constructor(date: moment.Moment, weigth: number | null) {
        this.date = date;
        this.weigth = weigth;
    }

    serializeForSave(): ISerializedMeasure {
        let serializeMeasure: ISerializedMeasure = {
          date: this.date.toISOString(),
          weight: this.weigth
        };

        return serializeMeasure;
    }

    deserilizeFromSave(serializeMeasure: ISerializedMeasure) {
        this.date = moment(serializeMeasure.date);
        this.weigth = serializeMeasure.weight;
    }

}