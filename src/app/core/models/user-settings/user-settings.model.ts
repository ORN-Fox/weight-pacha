import { ISerializeModel, SerializeModel } from "../serialize.model";

export interface ISerializedUserSettings extends ISerializeModel {
    locale: string;
    theme?: string;
    calendarViewFormat?: string;
    itemsPerPage?: number;
    weightUnit?: number;
}

export class UserSettings extends SerializeModel {

    locale: string;
    theme?: string;
    calendarViewFormat?: string;
    itemsPerPage?: number;
    weightUnit?: number;

    constructor() {
        super();

        this.locale = this.getLocale();
    }

    override serializeForSave(): ISerializedUserSettings {
        let serializedFields = {
            locale: this.locale,
            theme: this.theme,
            calendarViewFormat: this.calendarViewFormat,
            itemsPerPage: this.itemsPerPage,
            weightUnit: this.weightUnit
        };

        let serializedUserSettings: ISerializedUserSettings = Object.assign(serializedFields, super.serializeForSave());

        return serializedUserSettings;
    }

    override deserilizeFromSave(serializedUSerSettings: ISerializedUserSettings) {
        try {
            super.deserilizeFromSave(serializedUSerSettings);
            
            this.locale = serializedUSerSettings.locale;
            this.theme = serializedUSerSettings.theme;
            this.calendarViewFormat = serializedUSerSettings.calendarViewFormat;
            this.itemsPerPage = serializedUSerSettings.itemsPerPage;
            this.weightUnit = serializedUSerSettings.weightUnit;
        } catch (exception) {
            console.error('Exception on deserialize user settings model', exception);
        }
    }

    getLocale(): string {
        if (navigator.languages && navigator.languages.length) {
            const languages = navigator.languages.filter(language => language.length > 3);
            return languages[0];
        }
        return navigator.language;
    }
}