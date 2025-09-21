import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';

import { ISerializedVaccine, Vaccine } from 'src/app/core/models/vaccine/vaccine.model';

export interface ITableHeader {
  title: string;
  width: string;
}

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
    this.loadVaccines();
  }

  private setupTableHeaders() {
    this.tableHeaders = [
      { title: 'date', width: '12%' },
      { title: 'title', width: '' },
      { title: 'reminderDate', width: '12%' },
      { title: 'description', width: '' },
      { title: 'age', width: '' },
      { title: 'actions', width: '' }
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
    // TODO: use real birthdate
    const birthdate = moment('2023-06-01');
    // TODO: compute days, weeks, months value for handle babies
    if (vaccine.injectionDate) {
      vaccine.injectionDate = moment(vaccine.injectionDate);
      return vaccine.injectionDate?.diff(birthdate, 'years', false);
    }
    return -1;
  }

  private initDatePickers(vaccine: Vaccine) {
    setTimeout(() => {
      flatpickr(`#vaccineInjectionDateInput_${vaccine.id}`, {
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: vaccine.injectionDate.toDate(),
        onChange: (selectedDates: Date[]) => {
          vaccine.injectionDate = moment(selectedDates[0]);
          vaccine.age = this.getAgeFromVaccineDate(vaccine);
        }
      });

      flatpickr(`#vaccineReminderDateInput_${vaccine.id}`, {
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
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
    const serializedVaccines = this.serializerService.serializeList(this.vaccines);
    this.localStorageService.setItem(this.APP_STORAGE_KEY, { vaccines: serializedVaccines });
  }

}
