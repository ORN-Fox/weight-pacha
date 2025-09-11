import moment from "moment";

import { DateService } from "../../services/date/date.service";

import { PetSex } from "../../enums/pet-sex/pet-sex.enum";
import { PetType } from "../../enums/pet-type/pet-type.enum";

import { ISerializeModel, SerializeModel } from "../serialize.model";

export interface ISerializedPetRecord extends ISerializeModel {
    firstName: string;
    lastName: string;
    specie: number;
    breed: string;
    sex: number;
    color: string;
    birthDate: string | null;
    adoptedDate: string | null;
    sterilise: boolean;
    tagNumber: string;
    tagRageNumber: string;
    description: string;
}

export class PetRecord extends SerializeModel {

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
        super();

        this.sterilise = false;
    }
    
    override serializeForSave(): ISerializedPetRecord {
        let serializeFields = {
            firstName: this.firstName,
            lastName: this.lastName,
            specie: this.specie,
            breed: this.breed,
            sex: this.sex,
            color: this.color,
            birthDate: DateService.getStringDateFromMoment(this.birthDate),
            adoptedDate: DateService.getStringDateFromMoment(this.adoptedDate),
            sterilise: this.sterilise,
            tagNumber: this.tagNumber,
            tagRageNumber: this.tagRageNumber,
            description: this.description
        };

        let serializePetRecord: ISerializedPetRecord = Object.assign(serializeFields, super.serializeForSave());

        return serializePetRecord;
    }

    override deserilizeFromSave(serializePetRecord: ISerializedPetRecord) {
        try {
            super.deserilizeFromSave(serializePetRecord);

            this.firstName = serializePetRecord.firstName;
            this.lastName = serializePetRecord.lastName;
            this.specie = serializePetRecord.specie;
            this.breed = serializePetRecord.breed;
            this.sex = serializePetRecord.sex;
            this.color = serializePetRecord.color;
            this.birthDate = DateService.getMomentFromStringDate(serializePetRecord.birthDate);
            this.adoptedDate = DateService.getMomentFromStringDate(serializePetRecord.adoptedDate);
            this.sterilise = serializePetRecord.sterilise;
            this.tagNumber = serializePetRecord.tagNumber;
            this.tagRageNumber = serializePetRecord.tagRageNumber;
            this.description = serializePetRecord.description;
        } catch (exception) {
            console.error('Exception on deserialize pet record model', exception);
        }
    }

}
