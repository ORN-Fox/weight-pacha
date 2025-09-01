import { AfterViewInit, Component } from '@angular/core';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';

import { PetRecord } from 'src/app/core/models/pet-record/pet-record';

@Component({
  selector: 'app-informations',
  templateUrl: './informations.component.html',
  styleUrl: './informations.component.scss',
  standalone: false
})
export class InformationsComponent implements AfterViewInit {

  APP_STORAGE_KEY: string;

  petRecord: PetRecord;

  constructor(
    private localStorageService: LocalStorageService,
  ) {
    this.APP_STORAGE_KEY = 'weight-pacha-data-pet-record';
    
    this.loadPetRecord();
  }

  ngAfterViewInit() {
    flatpickr('#birthDateInput', {
      enableTime: true,
      dateFormat: 'Y-m-d H:i',
      defaultDate: this.petRecord?.birthDate?.toDate(),
      onChange: (_selectedDates: Object, date: string) => {
        this.petRecord.birthDate = moment(date);
      }
    });

    flatpickr('#adoptedDateInput', {
      enableTime: true,
      dateFormat: 'Y-m-d H:i',
      defaultDate: this.petRecord?.adoptedDate?.toDate(),
      onChange: (_selectedDates: Object, date: string) => {
        this.petRecord.adoptedDate = moment(date);
      }
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
  }

  saveChanges(petRecord: PetRecord) {
    // TODO added validations

    const serializedPetRecord = petRecord.serializeForSave();
    this.localStorageService.setItem(this.APP_STORAGE_KEY, serializedPetRecord);
  }

}
