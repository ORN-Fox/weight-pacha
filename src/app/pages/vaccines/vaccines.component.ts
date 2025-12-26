import { Component, inject, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, throwError } from 'rxjs';
import { cloneDeep } from 'lodash';
import { catchError, tap } from 'rxjs/operators';
import moment from 'moment';

import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { DialogAction } from 'src/app/core/enums/dialog-action/dialog.action.enum';

import { ITableHeader } from 'src/app/core/interfaces/ITableHeader';

import { PetRecord } from 'src/app/core/models/pet-record/pet-record.model';
import { ISerializedVaccine, Vaccine } from 'src/app/core/models/vaccine/vaccine.model';

import { VaccineDialogComponent } from './vaccine-dialog/vaccine-dialog.component';

@Component({
  selector: 'app-vaccines',
  templateUrl: './vaccines.component.html',
  styleUrl: './vaccines.component.scss',
  standalone: false
})
export class VaccinesComponent implements OnDestroy {

  readonly apiService = inject(ApiService);
  readonly authService = inject(AuthService);
  readonly dialog = inject(MatDialog);
  readonly toastService = inject(ToastService);
  readonly translateService = inject(TranslateService);
  readonly serializerService = inject(SerializerService);
  readonly settingsService = inject(SettingsService);

  tableHeaders: ITableHeader[];
  vaccines: Vaccine[];

  petRecord: PetRecord;

  deleteVaccineSub: Subscription;
  loadVaccinesSub: Subscription;

  dateFormat: string;

  page: number;
  itemsPerPage: number;

  constructor() {
    this.settingsService.settings$.subscribe(() => {
      this.dateFormat = this.translateService.instant('commons.dateFormats.date');
    });

    this.setupTableHeaders();
    this.loadPetRecord();
    this.loadVaccines();
  }

  ngOnDestroy() {
    this.deleteVaccineSub?.unsubscribe();
    this.loadVaccinesSub?.unsubscribe();
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
    vaccine.petRecordId = this.petRecord.id;
    this.openVaccineDialog(false, vaccine);
  }

  updateVaccine(vaccine: Vaccine) {
    this.openVaccineDialog(true, vaccine);
  }

  deleteVaccine(id: string) {
    this.toastService.showConfirm().then((result: { isConfirmed: boolean; }) => {
      if (result.isConfirmed) {
        this.deleteVaccineSub = this.apiService.delete(`/pet-record/${ this.petRecord.id }/vaccine/${ id }`).pipe(
          tap(() => this.loadVaccines()),
          catchError((error) => {
            this.toastService.showToast('error', this.translateService.instant('commons.toast.error.delete'));
            console.error('Unable to delete vaccine', error);
            return throwError(() => error);
          }),
        ).subscribe();
      }
    });
  }

  getAgeFromVaccineDate(vaccine: Vaccine) {
    // TODO: compute days, weeks, months value for handle babies
    if (vaccine.injectionDate && this.petRecord.birthDate) {
      vaccine.injectionDate = moment(vaccine.injectionDate);
      return this.petRecord.getAge(vaccine.injectionDate);
    }
    return null;
  }

  private loadPetRecord() {
    this.petRecord = this.authService.selectedPetRecordValue;
  }

  private loadVaccines() {
    this.vaccines = [];
    this.loadVaccinesSub = this.apiService.get<ISerializedVaccine[]>(`/pet-record/${ this.petRecord.id }/vaccines`).pipe(
      tap((vaccinesJSON: ISerializedVaccine[]) => {
        let vaccines: Vaccine[] = [];
        vaccinesJSON.forEach((vaccineJSON: ISerializedVaccine) => {
          let vaccine = new Vaccine();
          vaccine.deserilizeFromSave(vaccineJSON);
          vaccine.age = this.getAgeFromVaccineDate(vaccine);
          vaccines.push(vaccine);
        });
        this.vaccines = vaccines;
      }),
      catchError((error) => {
        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.load'));
        console.error('Unable to load vaccines', error);
        return throwError(() => error);
      })
    ).subscribe();
  }

  private openVaccineDialog(editMode: boolean = false, vaccine: Vaccine) {
    const action = editMode ? DialogAction.UPDATE : DialogAction.ADD;
    const dialogRef = this.dialog.open(VaccineDialogComponent, {
      data: { action: action, vaccine: cloneDeep(vaccine) },
      autoFocus: false,
      disableClose: true,
      width: '40rem'
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadVaccines();
      }
    });
  }

}
