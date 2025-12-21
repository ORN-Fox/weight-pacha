import { clone } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { ISerializeModel, SerializeModel } from '../serialize.model';

export interface ISerializedNote extends ISerializeModel {
    name: string;
    description: string;
    petRecordId: string;
}

export class Note extends SerializeModel {

    name: string;
    description: string;
    petRecordId: string;

    constructor() {
        super();
    }

    override serializeForSave(): ISerializedNote {
        let serializeFields = {
            name: this.name,
            description: this.description,
            petRecordId: this.petRecordId
        };
        
        let serializeNote: ISerializedNote = Object.assign(serializeFields, super.serializeForSave());

        return serializeNote;
    }

    override deserilizeFromSave(serializeNote: ISerializedNote) {
        try {
            super.deserilizeFromSave(serializeNote);

            this.name = serializeNote.name;
            this.description = serializeNote.description;
            this.petRecordId = serializeNote.petRecordId;
        } catch (exception) {
            console.error('Exception on deserialize note model', exception);
        }
    }

    duplicate(): Note {
        let duplicatedNote = clone(this);
        duplicatedNote.id = uuidv4();
        duplicatedNote.name += " Copy";
        return duplicatedNote;
    }

}