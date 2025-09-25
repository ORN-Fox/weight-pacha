import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';

import { ITableHeader } from 'src/app/core/interfaces/ITableHeader';

import { ISerializedVaccine, Vaccine } from 'src/app/core/models/vaccine/vaccine.model';
import { PetRecord } from 'src/app/core/models/pet-record/pet-record.model';

@Component({
  selector: 'app-vaccines',
  templateUrl: './vaccines.component.html',
  styleUrl: './vaccines.component.scss',
  standalone: false
})
export class VaccinesComponent {

  APP_STORAGE_KEY: string;

  tableHeaders: ITableHeader[];
  vaccines: Vaccine[];

  petRecord: PetRecord;

  dateFormat: string;

  constructor(
    private localStorageService: LocalStorageService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private serializerService: SerializerService
  ) {
    this.APP_STORAGE_KEY = 'weight-pacha-vaccines';

    this.dateFormat = this.translateService.instant('commons.dateFormats.date');

    this.setupTableHeaders();
    this.loadPetRecord();
    this.loadVaccines();
  }

  private setupTableHeaders() {
    this.tableHeaders = [
      { title: 'date', width: '12%' },
      { title: 'title', width: '' },
      { title: 'reminderDate', width: '12%' },
      { title: 'description', width: '' },
      { title: 'age', width: '' },
      { title: 'actions', width: '15%' }
    ];
  }

  addVaccine() {
    let vaccine = new Vaccine();
    vaccine.editMode = true;
    vaccine.age = this.getAgeFromVaccineDate(vaccine);
    this.vaccines.push(vaccine);

    this.initDatePickers(vaccine);
  }

  updateVaccine(vaccine: Vaccine) {
    vaccine.editMode = !vaccine.editMode;

    this.initDatePickers(vaccine);
  }

  saveChanges(vaccine: Vaccine) {
    vaccine.editMode = false;
    vaccine.age = this.getAgeFromVaccineDate(vaccine);
    vaccine.updatedAt = moment();
    this.saveVaccines();
  }

  deleteVaccine(id: string) {
    this.toastService.showConfirm().then((result: { isConfirmed: boolean; }) => {
      if (result.isConfirmed) {
        this.vaccines = this.vaccines.filter(vaccine => vaccine.id != id);
        this.saveVaccines();
      }
    });
  }

  getAgeFromVaccineDate(vaccine: Vaccine) {
    // TODO: compute days, weeks, months value for handle babies
    if (vaccine.injectionDate && this.petRecord.birthDate) {
      vaccine.injectionDate = moment(vaccine.injectionDate);
      return vaccine.injectionDate?.diff(this.petRecord.birthDate, 'years', false);
    }
    return -1;
  }

  private initDatePickers(vaccine: Vaccine) {
    setTimeout(() => {
      flatpickr(`#vaccineInjectionDateInput_${vaccine.id}`, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: vaccine.injectionDate.toDate(),
        onChange: (selectedDates: Date[]) => {
          vaccine.injectionDate = moment(selectedDates[0]);
          vaccine.age = this.getAgeFromVaccineDate(vaccine);
        }
      });

      flatpickr(`#vaccineReminderDateInput_${vaccine.id}`, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: vaccine.reminderDate?.toDate(),
        onChange: (selectedDates: Date[]) => {
          vaccine.reminderDate = selectedDates[0] ? moment(selectedDates[0]) : null;
        }
      });
    }, 100);
  }

  private loadVaccines() {
    this.vaccines = [];
    
    if (this.localStorageService.isItemExist(this.APP_STORAGE_KEY)) {
      let vaccinesJSON = this.localStorageService.getItem(this.APP_STORAGE_KEY);

      vaccinesJSON.vaccines.forEach((vaccineJSON: ISerializedVaccine) => {
        let vaccine = new Vaccine();
        vaccine.deserilizeFromSave(vaccineJSON);
        vaccine.age = this.getAgeFromVaccineDate(vaccine);
        this.vaccines.push(vaccine);
      });
    } else {
      this.localStorageService.setItem(this.APP_STORAGE_KEY, { vaccines: this.vaccines });
    }
  }

  private loadPetRecord() {
    const APP_PET_RECORD_STORAGE_KEY = 'weight-pacha-data-pet-record';

    this.petRecord = new PetRecord();

    if (this.localStorageService.isItemExist(APP_PET_RECORD_STORAGE_KEY)) {
      let petRecordJSON = this.localStorageService.getItem(APP_PET_RECORD_STORAGE_KEY);
      this.petRecord.deserilizeFromSave(petRecordJSON);
    }
  }
  
  private saveVaccines() {
    const serializedVaccines = this.serializerService.serializeList(this.vaccines);
    this.localStorageService.setItem(this.APP_STORAGE_KEY, { vaccines: serializedVaccines });
  }

}
