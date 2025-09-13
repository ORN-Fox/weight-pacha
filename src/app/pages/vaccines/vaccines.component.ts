import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';

import { ISerializedVaccine, Vaccine } from 'src/app/core/models/vaccine/vaccine.model';

@Component({
  selector: 'app-vaccines',
  templateUrl: './vaccines.component.html',
  styleUrl: './vaccines.component.scss',
  standalone: false
})
export class VaccinesComponent {

  APP_STORAGE_KEY: string;

  tableHeaders: string[];
  vaccines: Vaccine[];

  constructor(
    private localStorageService: LocalStorageService,
    private translateService: TranslateService
  ) {
    this.APP_STORAGE_KEY = 'weight-pacha-vaccines';

    this.setupTableHeaders();
    this.loadVaccines();
  }

  private setupTableHeaders() {
    this.tableHeaders = [
      'date',
      'title',
      'reminderDate',
      'description',
      'age',
      'actions'
    ];
  }

  addVaccine() {
    let vaccine = new Vaccine();
    vaccine.editMode = true;
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
    this.vaccines = this.vaccines.filter(vaccine => vaccine.id != id);
    this.saveVaccines();
  }

  getAgeFromVaccineDate(vaccine: Vaccine) {
    // TODO: use real birthdate
    const birthdate = moment('2023-06-01');
    // TODO: compute days, weeks, months value for handle babies
    if (vaccine.injectionDate) {
      return vaccine.injectionDate?.diff(birthdate, 'years', false);
    }
    return -1;
  }

  private initDatePickers(vaccine: Vaccine) {
    setTimeout(() => {
      flatpickr(`#vaccineInjectionDateInput_${vaccine.id}`, {
        dateFormat: 'Y-m-d',
        defaultDate: vaccine.injectionDate.toDate(),
        onChange: (_selectedDates: Object, date: string) => {
          vaccine.injectionDate = moment(date);
        }
      });

      flatpickr(`#vaccineReminderDateInput_${vaccine.id}`, {
        dateFormat: 'Y-m-d',
        defaultDate: vaccine.reminderDate?.toDate(),
        onChange: (_selectedDates: Object, date: string) => {
          vaccine.reminderDate = date ? moment(date) : null;
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
  
  private saveVaccines() {
    let serializedVaccines: ISerializedVaccine[] = [];
    this.vaccines.forEach(vaccine => {
      serializedVaccines.push(vaccine.serializeForSave());
    });

    this.localStorageService.setItem(this.APP_STORAGE_KEY, { vaccines: this.vaccines });
  }

}
