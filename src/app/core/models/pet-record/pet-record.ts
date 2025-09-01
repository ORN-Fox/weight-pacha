import moment from "moment";

import { PetSex } from "../../enums/pet-sex/pet-sex.enum";
import { PetType } from "../../enums/pet-type/pet-type.enum";

export interface ISerializedPetRecord {
    firstName: string;
    lastName: string;
    specie: number;
    breed: string;
    sex: number;
    color: string;
    birthDate: string;
    adoptedDate: string;
    sterilise: boolean;
    tagNumber: string;
    tagRageNumber: string;
    description: string;
}

export class PetRecord {

    firstName: string;
    lastName: string;
    specie: PetType;
    breed: string;
    sex: PetSex;
    color: string;
    birthDate: moment.Moment | null;
    adoptedDate: moment.Moment | null;
    sterilise: boolean;
    tagNumber: string;
    tagRageNumber: string;
    description: string;

    constructor() {
        this.sterilise = false;
    }
    
    serializeForSave(): ISerializedPetRecord {
        let serializePetRecord: ISerializedPetRecord = {
            firstName: this.firstName,
            lastName: this.lastName,
            specie: this.specie,
            breed: this.breed,
            sex: this.sex,
            color: this.color,
            birthDate: this.birthDate ? moment(this.birthDate).toISOString() : '',
            adoptedDate: this.adoptedDate ? moment(this.adoptedDate).toISOString() : '',
            sterilise: this.sterilise,
            tagNumber: this.tagNumber,
            tagRageNumber: this.tagRageNumber,
            description: this.description
        };

        return serializePetRecord;
    }

    deserilizeFromSave(serializePetRecord: ISerializedPetRecord) {
        try {
            this.firstName = serializePetRecord.firstName;
            this.lastName = serializePetRecord.lastName;
            this.specie = serializePetRecord.specie;
            this.breed = serializePetRecord.breed;
            this.sex = serializePetRecord.sex;
            this.color = serializePetRecord.color;
            this.birthDate = serializePetRecord.birthDate ? moment(serializePetRecord.birthDate) : null;
            this.adoptedDate = serializePetRecord.adoptedDate ? moment(serializePetRecord.adoptedDate) : null;
            this.sterilise = serializePetRecord.sterilise;
            this.tagNumber = serializePetRecord.tagNumber;
            this.tagRageNumber = serializePetRecord.tagRageNumber;
            this.description = serializePetRecord.description;
        } catch (exception) {
            console.error('Exception on deserialize pet record', exception);
        }
    }

}
