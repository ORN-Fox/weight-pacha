import moment from "moment";

import { DateService } from '../../services/date/date.service';

import { ISerializeModel, SerializeModel } from '../serialize.model';

export interface ISerializedInvoice extends ISerializeModel {
    billingDate: string;
    amount: number | null;
    description: string | null;
    petRecordId: string;
}

export class Invoice extends SerializeModel {

    billingDate: moment.Moment;
    amount: number | null;
    description: string | null;
    petRecordId: string;

    // local data
    editMode: boolean;

    constructor(billingDate: moment.Moment = moment(), amount: number | null = null, petRecordId: string = '') {
        super();
        
        this.billingDate = billingDate;
        this.amount = amount;
        this.petRecordId = petRecordId;

        // local data
        this.editMode = false;
    }

    override serializeForSave(): ISerializedInvoice {
        let serializeFields = {
            billingDate: DateService.getStringDateFromMoment(this.billingDate) as string,
            amount: this.amount,
            description: this.description,
            petRecordId: this.petRecordId
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
            this.petRecordId = serializeInvoice.petRecordId;
        } catch (exception) {
            console.error('Exception on deserialize invoice model', exception);
        }
    }

}