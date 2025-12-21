import { Component, inject, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { catchError, Subscription, tap, throwError } from 'rxjs';
import { cloneDeep } from 'lodash';

import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { DialogAction } from 'src/app/core/enums/dialog-action/dialog.action.enum';

import { ITableHeader } from 'src/app/core/interfaces/ITableHeader';

import { ISerializedWormable, Wormable } from 'src/app/core/models/wormable/wormable.model';

import { WormableDialogComponent } from './wormable-dialog/wormable-dialog.component';


@Component({
  selector: 'app-wormables',
  templateUrl: './wormables.component.html',
  styleUrl: './wormables.component.scss',
  standalone: false
})
export class WormablesComponent implements OnDestroy {

  readonly dialog = inject(MatDialog);
  readonly apiService = inject(ApiService);
  readonly authService = inject(AuthService);
  readonly toastService = inject(ToastService);
  readonly translateService = inject(TranslateService);
  readonly serializerService = inject(SerializerService);
  readonly settingsService = inject(SettingsService);
  
  tableHeaders: ITableHeader[];
  wormables: Wormable[];

  deleteWormableSub: Subscription;
  loadWormablesSub: Subscription;

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

  ngOnDestroy() {
    this.loadWormablesSub?.unsubscribe();
  }

  loadWormables() {
    this.wormables = [];

    this.loadWormablesSub = this.apiService.get<ISerializedWormable[]>(`/pet-record/${this.authService.selectedPetRecordValue?.id}/wormables`).pipe(
      tap((wormablesJSON: ISerializedWormable[]) => {
        let wormables: Wormable[] = [];
        wormablesJSON.forEach((wormableJSON: ISerializedWormable) => {
          let wormable = new Wormable();
          wormable.deserilizeFromSave(wormableJSON);
          wormables.push(wormable);
        });
        this.wormables = wormables;
      }),
      catchError((error) => {
        this.toastService.showToast('error', this.translateService.instant('commons.toast.load.delete'));
        console.error('Unable to load wormables', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

  addWormable() {
    let wormable = new Wormable();
    wormable.petRecordId = this.authService.selectedPetRecordValue.id;
    this.openWormableDialog(false, wormable);
  }

  updateWormable(wormable: Wormable) {
    this.openWormableDialog(true, wormable);
  }

  deleteWormable(id: string) {
    this.toastService.showConfirm().then((result: { isConfirmed: boolean; }) => {
      if (result.isConfirmed) {
        this.deleteWormableSub = this.apiService.delete(`/pet-record/${ this.authService.selectedPetRecordValue?.id }/wormable/${ id }`).pipe(
          tap(() => this.loadWormables()),
          catchError((error) => {
            this.toastService.showToast('error', this.translateService.instant('commons.toast.error.delete'));
            console.error('Unable to delete wormable', error);
            return throwError(() => error);
          }),
        ).subscribe();
      }
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

  private openWormableDialog(editMode: boolean = false, wormable: Wormable) {
    const action = editMode ? DialogAction.UPDATE : DialogAction.ADD;
    const dialogRef = this.dialog.open(WormableDialogComponent, {
      data: { action: action, wormable: cloneDeep(wormable) },
      autoFocus: false,
      disableClose: true,
      width: '40rem'
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadWormables();
      }
    });
  }

}
