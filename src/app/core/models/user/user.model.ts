import { ISerializeModel, SerializeModel } from '../serialize.model';
import { ISerializedPetRecord, PetRecord } from '../pet-record/pet-record.model';
import { ISerializedUserSettings, UserSettings } from '../user-settings/user-settings.model';

export interface ISerializedUser extends ISerializeModel {
    username: string;
    email: string;
    PetRecords?: ISerializedPetRecord[];
    Settings?: ISerializedUserSettings;
}

export class User extends SerializeModel {

    username: string;
    email: string;
    verified: boolean;
    petRecords: PetRecord[];
    settings: UserSettings;

    constructor() {
        super();

        this.verified = true;
    }

    override serializeForSave(): ISerializedUser {
        let serializeFields = {
            username: this.username,
            email: this.email
        };
        
        let serializeUser: ISerializedUser = Object.assign(serializeFields, super.serializeForSave());

        return serializeUser;
    }

    override deserilizeFromSave(serializeUser: ISerializedUser) {
        try {
            super.deserilizeFromSave(serializeUser);

            this.username = serializeUser.username;
            this.email = serializeUser.email;
            
            this.petRecords = [];
            if (serializeUser.PetRecords) {
                serializeUser.PetRecords.forEach((petRecordJson) => {
                    let petRecord = new PetRecord();
                    petRecord.deserilizeFromSave(petRecordJson);
                    this.petRecords.push(petRecord);
                });
            }

            let settings = new UserSettings(); 
            if (serializeUser.Settings) {
                settings.deserilizeFromSave(serializeUser.Settings);
            }
            this.settings = settings;
        } catch (exception) {
            console.error('Exception on deserialize user model', exception);
        }
    }

}