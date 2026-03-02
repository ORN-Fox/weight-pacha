import moment from 'moment';

import { Invoice } from './invoice.model';

describe('Invoice', () => {
    let invoice: Invoice;

    beforeEach(() => {
        invoice = new Invoice();
    });

    it('should create an instance', () => {
        expect(invoice).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(invoice.id).toBeUndefined();
        expect(invoice.amount).toBeNull();
        expect(invoice.description).toBeUndefined();
        expect(moment.isMoment(invoice.billingDate)).toBeTruthy();
        expect(moment.isMoment(invoice.createdAt)).toBeFalsy();
        expect(invoice.updatedAt).toBeUndefined();
    });
});
