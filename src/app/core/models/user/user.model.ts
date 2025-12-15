import { ISerializeModel, SerializeModel } from '../serialize.model';
import { ISerializedPetRecord, PetRecord } from '../pet-record/pet-record.model';

export interface ISerializedUser extends ISerializeModel {
    username: string;
    email: string;
    PetRecords?: ISerializedPetRecord[];
}

export class User extends SerializeModel {

    username: string;
    email: string;
    petRecords: PetRecord[];

    constructor() {
        super();
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
        } catch (exception) {
            console.error('Exception on deserialize user model', exception);
        }
    }

}