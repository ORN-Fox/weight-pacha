import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';

import { ITableHeader } from 'src/app/core/interfaces/ITableHeader';

import { ISerializedVaccine, Vaccine } from 'src/app/core/models/vaccine/vaccine.model';
import { PetRecord } from 'src/app/core/models/pet-record/pet-record.model';

import { VaccineDialogComponent, VaccineDialogData } from './vaccine-dialog/vaccine-dialog.component';

@Component({
  selector: 'app-vaccines',
  templateUrl: './vaccines.component.html',
  styleUrl: './vaccines.component.scss',
  standalone: false
})
export class VaccinesComponent {

  readonly dialog = inject(MatDialog);

  APP_STORAGE_KEY: string = 'weight-pacha-vaccines';

  tableHeaders: ITableHeader[];
  vaccines: Vaccine[];

  petRecord: PetRecord;

  dateFormat: string;

  page: number;
  itemsPerPage: number;

  constructor(
    private localStorageService: LocalStorageService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private serializerService: SerializerService
  ) {
    this.dateFormat = this.translateService.instant('commons.dateFormats.date');

    this.setupTableHeaders();
    this.loadPetRecord();
    this.loadVaccines();
  }

  private setupTableHeaders() {
    this.tableHeaders = [
      { title: 'date', align: 'center', width: '12%' },
      { title: 'title', align: 'left', width: '' },
      { title: 'reminderDate', align: 'center', width: '12%' },
      { title: 'description', align: 'left', width: '' },
      { title: 'age', align: 'center', width: '' },
      { title: 'actions', align: 'center', width: '15%' }
    ];
  }

  addVaccine() {
    let vaccine = new Vaccine();
    this.openVaccineDialog(false, vaccine);
  }

  updateVaccine(vaccine: Vaccine) {
    this.openVaccineDialog(true, vaccine);
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

  private loadVaccines() {
    this.vaccines = [];
    
    if (this.localStorageService.isItemExist(this.APP_STORAGE_KEY)) {
      let vaccines: Vaccine[] = [];
      const vaccinesJSON = this.localStorageService.getItem(this.APP_STORAGE_KEY);

      vaccinesJSON.vaccines.forEach((vaccineJSON: ISerializedVaccine) => {
        let vaccine = new Vaccine();
        vaccine.deserilizeFromSave(vaccineJSON);
        vaccine.age = this.getAgeFromVaccineDate(vaccine);
        vaccines.push(vaccine);
      });
      this.vaccines = this.sortVaccinesByInjectionDate(vaccines);
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

  private sortVaccinesByInjectionDate(vaccines: Vaccine[]) {
    return vaccines.sort((firstVaccine, secondVaccine) => firstVaccine.injectionDate.isAfter(secondVaccine.injectionDate, 'day') ? 1 : -1);
  }

  private openVaccineDialog(editMode: boolean = false, vaccine: Vaccine) {
      const dialogRef = this.dialog.open(VaccineDialogComponent, {
        data: { editMode: editMode, vaccine: cloneDeep(vaccine) },
        autoFocus: false,
        disableClose: true,
        width: '40rem'
      });
  
      dialogRef.afterClosed().subscribe((result: VaccineDialogData) => {
        if (result) {
          result.vaccine.age = this.getAgeFromVaccineDate(result.vaccine);
          
          if (result.editMode) {
            const index = this.vaccines.findIndex(vaccine => vaccine.id === result.vaccine.id);
            if (index !== -1) {
              this.vaccines[index] = result.vaccine;
            }
          } else {
            this.vaccines.push(result.vaccine);
          }
          this.saveVaccines();
        }
      });
    }
  
  private saveVaccines() {
    this.vaccines = this.sortVaccinesByInjectionDate(this.vaccines);
    const serializedVaccines = this.serializerService.serializeList(this.vaccines);
    this.localStorageService.setItem(this.APP_STORAGE_KEY, { vaccines: serializedVaccines });
  }

}
