import { ISerializeModel, SerializeModel } from "../serialize.model";

export interface ISettings extends ISerializeModel {
    locale: string;
    theme?: string;
    calendarViewFormat?: string;
    itemsPerPage?: number;
    weightUnit?: number;
}

export class Settings extends SerializeModel {

    locale: string;
    theme?: string;
    calendarViewFormat?: string;
    itemsPerPage?: number;
    weightUnit?: number;

    constructor() {
        super();
        
        this.locale = 'en-US';
        this.theme = 'light';
        this.calendarViewFormat = 'dayGridMonth';
        this.itemsPerPage = 10;
        this.weightUnit = 0;
    }

    override serializeForSave(): ISettings {
        let serializedFields = {
            locale: this.locale,
            theme: this.theme,
            calendarViewFormat: this.calendarViewFormat,
            itemsPerPage: this.itemsPerPage,
            weightUnit: this.weightUnit
        };

        let serializedSettings: ISettings = Object.assign(serializedFields, super.serializeForSave());

        return serializedSettings;
    }

    override deserilizeFromSave(serializedSettings: ISettings) {
        try {
            super.deserilizeFromSave(serializedSettings);
            
            this.locale = serializedSettings.locale || this.locale;
            this.theme = serializedSettings.theme || this.theme;
            this.calendarViewFormat = serializedSettings.calendarViewFormat || this.calendarViewFormat;
            this.itemsPerPage = serializedSettings.itemsPerPage || this.itemsPerPage;
            this.weightUnit = serializedSettings.weightUnit || this.weightUnit;
        } catch (exception) {
            console.error('Exception on deserialize settings model', exception);
        }
    }
}