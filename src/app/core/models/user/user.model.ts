import { ISerializeModel, SerializeModel } from '../serialize.model';

export interface ISerializedUser extends ISerializeModel {
    username: string;
}

export class User extends SerializeModel {

    username: string;

    constructor() {
        super();
    }

    override serializeForSave(): ISerializedUser {
        let serializeFields = {
            username: this.username
        };
        
        let serializeUser: ISerializedUser = Object.assign(serializeFields, super.serializeForSave());

        return serializeUser;
    }

    override deserilizeFromSave(serializeUser: ISerializedUser) {
        try {
            super.deserilizeFromSave(serializeUser);

            this.username = serializeUser.username;
        } catch (exception) {
            console.error('Exception on deserialize user model', exception);
        }
    }

}