import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { PetType } from 'src/app/core/enums/pet-type/pet-type.enum';

import { IInputElementWithFlatpickr } from 'src/app/core/interfaces/IInputElementWithFlatpickr';

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
    private settingsService: SettingsService
  ) {    
    this.loadSpecies();
    this.loadPetRecord();
    
    this.settingsService.settings$.subscribe(() => {
      this.updateFlatpickrLocales();
    });
  }

  saveInformations() {
    if (this.petForm.valid) {
      Object.assign(this.petRecord, this.petForm.value);
      this.petRecord.birthDate = moment(this.petRecord.birthDate);
      this.petRecord.adoptedDate = this.petRecord.adoptedDate ? moment(this.petRecord.adoptedDate) : null,
      this.petRecord.sterilizeDate = this.petRecord.sterilizeDate ? moment(this.petRecord.sterilizeDate) : null,
      this.petRecord.updatedAt = moment();
      const serializedPetRecord = this.petRecord.serializeForSave();
      this.localStorageService.setItem(this.APP_STORAGE_KEY, serializedPetRecord);
    }
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

    this.initForm(this.petRecord);
  }

  private loadSpecies() {
    this.species = [
      { key: 'dog', value: PetType.Dog },
      { key: 'cat', value: PetType.Cat },
      { key: 'rabbit', value: PetType.Rabbit },
      { key: 'others', value: PetType.Others },
    ];
  }

  private initForm(petRecord: PetRecord) {
    this.petForm = this.formBuilder.group({
      firstName: [petRecord.firstName, [Validators.required]],
      specie: [petRecord.specie, [Validators.required]],
      breed: [petRecord.breed],
      color: [petRecord.color, [Validators.required]],
      sex: [petRecord.sex, [Validators.required]],
      birthDate: [petRecord.birthDate],
      adoptedDate: [petRecord.adoptedDate],
      sterilize: [petRecord.sterilize],
      sterilizeDate: [petRecord.sterilizeDate],
      tagNumber: [petRecord.tagNumber],
      tagRageNumber: [petRecord.tagRageNumber],
      description: [petRecord.description]
    });

    this.initDatePickers(petRecord);
  }

  private initDatePickers(petRecord: PetRecord) {
    setTimeout(() => {
      // No onChange here because petForm change event interfer with date format rendering

      flatpickr('#birthDateInput', {
        enableTime: true,
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.dateTime'),
        defaultDate: petRecord.birthDate?.toDate()
      });

      flatpickr('#adoptedDateInput', {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: petRecord.adoptedDate?.toDate()
      });

      flatpickr('#sterilizeDateInput', {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: petRecord.sterilizeDate?.toDate()
      });
    }, 100);
  }

  private updateFlatpickrLocales() {
    ['birthDateInput', 'adoptedDateInput', 'sterilizeDateInput'].forEach(inputId => {
      const input = document.querySelector(`#${inputId}`) as IInputElementWithFlatpickr;
      if (input?._flatpickr) {
        const format = inputId === 'birthDateInput' ? 'commons.dateFormats.flatpickr.dateTime' : 'commons.dateFormats.flatpickr.date';
        input._flatpickr.set('altFormat', this.translateService.instant(format));
        input._flatpickr.set('locale', this.settingsService.currentSettings.locale);
        input._flatpickr.redraw();
      }
    });
  }

}
