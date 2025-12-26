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
    sterilize: boolean;
    sterilizeDate: string | null;
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
    sterilizeDate: moment.Moment | null;
    sterilize: boolean;
    tagNumber: string;
    tagRageNumber: string;
    description: string;

    // local data
    isNewPetRecord: boolean;

    constructor() {
        super();

        this.sterilize = false;

        // local data
        this.isNewPetRecord = false;
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
            sterilize: this.sterilize,
            sterilizeDate: DateService.getStringDateFromMoment(this.sterilizeDate),
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
            this.sterilize = serializePetRecord.sterilize;
            this.sterilizeDate = DateService.getMomentFromStringDate(serializePetRecord.sterilizeDate);
            this.tagNumber = serializePetRecord.tagNumber;
            this.tagRageNumber = serializePetRecord.tagRageNumber;
            this.description = serializePetRecord.description;
        } catch (exception) {
            console.error('Exception on deserialize pet record model', exception);
        }
    }

    getAge(date: moment.Moment = moment()): number {
        if (this.birthDate) {
            return date.diff(this.birthDate, 'years', false);
        }
        return -1;
    }

    getSpecieIcon(): string {
        switch (this.specie) {
            case PetType.Dog:
                return 'dog';
            case PetType.Cat:
                return 'cat';
            case PetType.Rabbit:
                return 'rabbit';
            case PetType.Others:
            default:
                return 'others';
        }
    }

}
