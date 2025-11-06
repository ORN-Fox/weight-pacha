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
        expect(invoice.id).toBeDefined();
        expect(invoice.amount).toBe(0);
        expect(invoice.description).toBeUndefined();
        expect(moment.isMoment(invoice.billingDate)).toBe(true);
        expect(moment.isMoment(invoice.createdAt)).toBe(true);
        expect(invoice.updatedAt).toBeUndefined();
        expect(invoice.editMode).toBe(false);
    });
});
