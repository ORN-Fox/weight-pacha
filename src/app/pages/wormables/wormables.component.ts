import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { DialogAction } from 'src/app/core/enums/dialog-action/dialog.action.enum';

import { ITableHeader } from 'src/app/core/interfaces/ITableHeader';

import { ISerializedWormable, Wormable } from 'src/app/core/models/wormable/wormable.model';

import { WormableDialogComponent, WormableDialogData } from './wormable-dialog/wormable-dialog.component';


@Component({
  selector: 'app-wormables',
  templateUrl: './wormables.component.html',
  styleUrl: './wormables.component.scss',
  standalone: false
})
export class WormablesComponent {

  readonly dialog = inject(MatDialog);
  readonly localStorageService = inject(LocalStorageService);
  readonly toastService = inject(ToastService);
  readonly translateService = inject(TranslateService);
  readonly serializerService = inject(SerializerService);
  readonly settingsService = inject(SettingsService);
  
  private readonly APP_STORAGE_KEY: string = 'weight-pacha-wormables';
  
  tableHeaders: ITableHeader[];
  wormables: Wormable[];

  dateFormat: string;

  page: number;
  itemsPerPage: number;

  constructor() {
    this.setupTableHeaders();
    this.loadWormables();

    this.settingsService.settings$.subscribe(() => {
      this.dateFormat = this.translateService.instant('commons.dateFormats.date');
    });
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
    this.openWormableDialog(false, wormable);
  }

  updateWormable(wormable: Wormable) {
    this.openWormableDialog(true, wormable);
  }

  deleteWormable(id: string) {
    this.toastService.showConfirm().then((result: { isConfirmed: boolean; }) => {
      if (result.isConfirmed) {
        this.wormables = this.wormables.filter(wormable => wormable.id != id);
        this.saveWormables();
      }
    });
  }

  private loadWormables() {
    this.wormables = [];
    
    if (this.localStorageService.isItemExist(this.APP_STORAGE_KEY)) {
      let wormables: Wormable[] = [];
      const wormablesJSON = this.localStorageService.getItem(this.APP_STORAGE_KEY);

      wormablesJSON.wormables.forEach((wormableJSON: ISerializedWormable) => {
        let wormable = new Wormable();
        wormable.deserilizeFromSave(wormableJSON);
        wormables.push(wormable);
      });
      this.wormables = this.sortWormablesByInjectionDate(wormables);
    } else {
      this.localStorageService.setItem(this.APP_STORAGE_KEY, { wormables: this.wormables });
    }
  }

  private sortWormablesByInjectionDate(wormables: Wormable[]) {
    return wormables.sort((firstWormable, secondWormable) => firstWormable.injectionDate.isAfter(secondWormable.injectionDate, 'day') ? 1 : -1);
  }

  private openWormableDialog(editMode: boolean = false, wormable: Wormable) {
    const action = editMode ? DialogAction.UPDATE : DialogAction.ADD;
    const dialogRef = this.dialog.open(WormableDialogComponent, {
      data: { action: action, wormable: cloneDeep(wormable) },
      autoFocus: false,
      disableClose: true,
      width: '40rem'
    });

    dialogRef.afterClosed().subscribe((result: WormableDialogData) => {
      if (result) {
        switch (result.action) {
          case DialogAction.ADD:
            this.wormables.push(result.wormable);
            break;

          case DialogAction.UPDATE:
            const index = this.wormables.findIndex(wormable => wormable.id === result.wormable.id);
            if (index !== -1) {
              this.wormables[index] = result.wormable;
            }
            break;
        }
        
        this.saveWormables();
      }
    });
  }
  
  private saveWormables() {
    this.wormables = this.sortWormablesByInjectionDate(this.wormables);
    const serializedWormables = this.serializerService.serializeList(this.wormables);
    this.localStorageService.setItem(this.APP_STORAGE_KEY, { wormables: serializedWormables });
  }

}
