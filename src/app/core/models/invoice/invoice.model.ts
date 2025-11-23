import moment from "moment";

import { DateService } from '../../services/date/date.service';

import { ISerializeModel, SerializeModel } from '../serialize.model';

export interface ISerializedInvoice extends ISerializeModel {
    billingDate: string;
    amount: number | null;
    description: string | null;
}

export class Invoice extends SerializeModel {

    billingDate: moment.Moment;
    amount: number | null;
    description: string | null;

    // local data
    editMode: boolean;

    constructor(billingDate: moment.Moment = moment(), amount: number | null = null) {
        super();
        
        this.billingDate = billingDate;
        this.amount = amount;

        // local data
        this.editMode = false;
    }

    override serializeForSave(): ISerializedInvoice {
        let serializeFields = {
            billingDate: DateService.getStringDateFromMoment(this.billingDate) as string,
            amount: this.amount,
            description: this.description
        };
        
        let serializeInvoice: ISerializedInvoice = Object.assign(serializeFields, super.serializeForSave());

        return serializeInvoice;
    }

    override deserilizeFromSave(serializeInvoice: ISerializedInvoice) {
        try {
            super.deserilizeFromSave(serializeInvoice);

            this.billingDate = DateService.getMomentFromStringDate(serializeInvoice.billingDate) as moment.Moment;
            this.amount = serializeInvoice.amount;
            this.description = serializeInvoice.description;
        } catch (exception) {
            console.error('Exception on deserialize invoice model', exception);
        }
    }

}