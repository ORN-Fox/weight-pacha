import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';

import { ISerializedWormable, Wormable } from 'src/app/core/models/wormable/wormable';

export interface ITableHeader {
  title: string;
  width: string;
}

@Component({
  selector: 'app-wormables',
  templateUrl: './wormables.component.html',
  styleUrl: './wormables.component.scss',
  standalone: false
})
export class WormablesComponent {

  APP_STORAGE_KEY: string;
  
  tableHeaders: ITableHeader[];
  wormables: Wormable[];

  constructor(
    private localStorageService: LocalStorageService,
    private translateService: TranslateService
  ) {
    this.APP_STORAGE_KEY = 'weight-pacha-wormables';

    this.setupTableHeaders();
    this.loadWormables();
  }

  private setupTableHeaders() {
    this.tableHeaders = [
      { title: 'date', width: '12%' },
      { title: 'title', width: '' },
      { title: 'reminderDate', width: '12%' },
      { title: 'description', width: '' },
      { title: 'actions', width: '' }
    ];
  }

  addWormables() {
    let wormable = new Wormable();
    wormable.editMode = true;
    this.wormables.push(wormable);

    this.initDatePickers(wormable);
  }

  updateWormables(wormable: Wormable) {
    wormable.editMode = !wormable.editMode;
    this.initDatePickers(wormable);
  }

  saveChanges(wormable: Wormable) {
    wormable.editMode = false;
    wormable.updatedAt = moment();
    this.saveWormables();
  }

  deleteWormables(id: string) {
    this.wormables = this.wormables.filter(wormable => wormable.id != id);
    this.saveWormables();
  }

  private initDatePickers(wormable: Wormable) {
    setTimeout(() => {
      flatpickr(`#wormableInjectionDateInput_${wormable.id}`, {
        dateFormat: this.translateService.instant('commons.dateFormats.flatpickrDateFormat'),
        defaultDate: wormable.injectionDate.toDate(),
        onChange: (selectedDates: Date[]) => {
          wormable.injectionDate = moment(selectedDates[0]);
        }
      });

      flatpickr(`#wormableReminderDateInput_${wormable.id}`, {
        dateFormat: this.translateService.instant('commons.dateFormats.flatpickrDateFormat'),
        defaultDate: wormable.reminderDate?.toDate(),
        onChange: (_selectedDates: Object, date: string) => {
          wormable.reminderDate = date ? moment(date) : null;
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
    let serializedWormables: ISerializedWormable[] = [];
    this.wormables.forEach(wormable => {
      serializedWormables.push(wormable.serializeForSave());
    });

    this.localStorageService.setItem(this.APP_STORAGE_KEY, { wormables: this.wormables });
  }

}
