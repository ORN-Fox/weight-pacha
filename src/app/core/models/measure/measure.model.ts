import { Moment } from "moment";

export class Measure {

    date: Moment;
    weigth: number | null;

    constructor(date: Moment, weigth: number | null) {
        this.date = date;
        this.weigth = weigth;
    }

}