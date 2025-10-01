import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';

import { PetType } from 'src/app/core/enums/pet-type/pet-type.enum';

import { PetRecord } from 'src/app/core/models/pet-record/pet-record.model';

interface ISpecie {
  key: string;
  value: number;
}

@Component({
  selector: 'app-informations',
  templateUrl: './informations.component.html',
  styleUrl: './informations.component.scss',
  standalone: false
})
export class InformationsComponent {

  APP_STORAGE_KEY: string = 'weight-pacha-data-pet-record';

  petForm: FormGroup;
  petRecord: PetRecord;

  species: ISpecie[];

  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private localStorageService: LocalStorageService,
  ) {    
    this.loadSpecies();
    this.loadPetRecord();
  }

  saveChanges() {
    if (this.petForm.valid) {
      Object.assign(this.petRecord, this.petForm.value);
      this.petRecord.birthDate = moment(this.petRecord.birthDate);
      this.petRecord.adoptedDate = this.petRecord.adoptedDate ? moment(this.petRecord.adoptedDate) : null,
      this.petRecord.updatedAt = moment();
      const serializedPetRecord = this.petRecord.serializeForSave();
      this.localStorageService.setItem(this.APP_STORAGE_KEY, serializedPetRecord);
    }
  }

  private initDatePickers() {
    setTimeout(() => {
      // No onChange here because petForm change event interfer with date format rendering

      flatpickr('#birthDateInput', {
        enableTime: true,
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.dateTime'),
        defaultDate: this.petForm.get('birthDate')?.value?.toDate()
      });

      flatpickr('#adoptedDateInput', {
        enableTime: true,
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.dateTime'),
        defaultDate: this.petForm.get('adoptedDate')?.value?.toDate()
      });
    }, 100);
  }

  private initForm() {
    this.petForm = this.formBuilder.group({
      firstName: [this.petRecord.firstName, [Validators.required]],
      specie: [this.petRecord.specie, [Validators.required]],
      breed: [this.petRecord.breed],
      color: [this.petRecord.color],
      sex: [this.petRecord.sex, [Validators.required]],
      birthDate: [this.petRecord.birthDate],
      adoptedDate: [this.petRecord.adoptedDate],
      sterilise: [this.petRecord.sterilise],
      tagNumber: [this.petRecord.tagNumber],
      tagRageNumber: [this.petRecord.tagRageNumber],
      description: [this.petRecord.description]
    });
  }

  private loadPetRecord() {
    this.petRecord = new PetRecord();

    if (this.localStorageService.isItemExist(this.APP_STORAGE_KEY)) {
      let petRecordJSON = this.localStorageService.getItem(this.APP_STORAGE_KEY);
      this.petRecord.deserilizeFromSave(petRecordJSON);
    } else {
      const serializedPetRecord = this.petRecord.serializeForSave();
      this.localStorageService.setItem(this.APP_STORAGE_KEY, { petRecord: serializedPetRecord });
    }

    this.initForm();
    this.initDatePickers();
  }

  private loadSpecies() {
    this.species = [
      { key: 'dog', value: PetType.Dog },
      { key: 'cat', value: PetType.Cat },
      { key: 'rabbit', value: PetType.Rabbit },
      { key: 'others', value: PetType.Others },
    ];
  }

}
