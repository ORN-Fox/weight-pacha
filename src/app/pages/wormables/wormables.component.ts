import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';

import { ITableHeader } from 'src/app/core/interfaces/ITableHeader';

import { ISerializedWormable, Wormable } from 'src/app/core/models/wormable/wormable.model';

@Component({
  selector: 'app-wormables',
  templateUrl: './wormables.component.html',
  styleUrl: './wormables.component.scss',
  standalone: false
})
export class WormablesComponent {

  APP_STORAGE_KEY: string = 'weight-pacha-wormables';
  
  tableHeaders: ITableHeader[];
  wormables: Wormable[];

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
    this.loadWormables();
  }

  private setupTableHeaders() {
    this.tableHeaders = [
      { title: 'date', align: 'center', width: '12%' },
      { title: 'title', align: 'left', width: '' },
      { title: 'reminderDate', align: 'center', width: '12%' },
      { title: 'description', align: 'left', width: '' },
      { title: 'actions', align: 'center', width: '15%' }
    ];
  }

  addWormable() {
    let wormable = new Wormable();
    wormable.editMode = true;
    this.wormables.push(wormable);

    this.initDatePickers(wormable);
  }

  updateWormable(wormable: Wormable) {
    wormable.editMode = !wormable.editMode;
    this.initDatePickers(wormable);
  }

  saveChanges(wormable: Wormable) {
    wormable.editMode = false;
    wormable.updatedAt = moment();
    this.saveWormables();
  }

  deleteWormable(id: string) {
    this.toastService.showConfirm().then((result: { isConfirmed: boolean; }) => {
      if (result.isConfirmed) {
        this.wormables = this.wormables.filter(wormable => wormable.id != id);
        this.saveWormables();
      }
    });
  }

  private initDatePickers(wormable: Wormable) {
    setTimeout(() => {
      flatpickr(`#wormableInjectionDateInput_${wormable.id}`, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: wormable.injectionDate.toDate(),
        onChange: (selectedDates: Date[]) => {
          wormable.injectionDate = moment(selectedDates[0]);
        }
      });

      flatpickr(`#wormableReminderDateInput_${wormable.id}`, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: wormable.reminderDate?.toDate(),
        onChange: (selectedDates: Date[]) => {
          wormable.reminderDate = selectedDates[0] ? moment(selectedDates[0]) : null;
        }
      });
    }, 100);
  }

  private loadWormables() {
    this.wormables = [];
    
    if (this.localStorageService.isItemExist(this.APP_STORAGE_KEY)) {
      let wormablesJSON = this.localStorageService.getItem(this.APP_STORAGE_KEY);

      wormablesJSON.wormables.forEach((wormableJSON: ISerializedWormable) => {
        let wormable = new Wormable();
        wormable.deserilizeFromSave(wormableJSON);
        this.wormables.push(wormable);
      });
    } else {
      this.localStorageService.setItem(this.APP_STORAGE_KEY, { wormables: this.wormables });
    }
  }
  
  private saveWormables() {
    const serializedWormables = this.serializerService.serializeList(this.wormables);
    this.localStorageService.setItem(this.APP_STORAGE_KEY, { wormables: serializedWormables });
  }

}
