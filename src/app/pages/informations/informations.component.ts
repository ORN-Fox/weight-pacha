import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, tap } from 'rxjs/operators';
import { Subscription, throwError } from 'rxjs';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { PetType } from 'src/app/core/enums/pet-type/pet-type.enum';

import { IInputElementWithFlatpickr } from 'src/app/core/interfaces/IInputElementWithFlatpickr';

import { ISerializedPetRecord, PetRecord } from 'src/app/core/models/pet-record/pet-record.model';

interface ISpecie {
  key: string;
  value: number;
}

enum FlatpickrInstances {
  BirthDate = 'birthDateInput',
  AdoptedDate = 'adoptedDateInput',
  SterilizeDate = 'sterilizeDateInput'
}

@Component({
  selector: 'app-informations',
  templateUrl: './informations.component.html',
  styleUrl: './informations.component.scss',
  standalone: false
})
export class InformationsComponent implements OnDestroy {

  readonly apiService = inject(ApiService);
  readonly authService = inject(AuthService);
  readonly formBuilder = inject(FormBuilder);
  readonly localStorageService = inject(LocalStorageService);
  readonly router = inject(Router);
  readonly toastService = inject(ToastService);
  readonly translateService = inject(TranslateService);
  readonly settingsService = inject(SettingsService);

  petForm: FormGroup;
  petRecord: PetRecord;

  species: ISpecie[];

  loadPetRecordSub: Subscription;
  createPetRecordSub: Subscription;
  updatePetRecordSub: Subscription;

  isLoading: boolean = false;
  isSubmitted: boolean = false;

  constructor() {
    this.initForm(new PetRecord());

    this.loadSpecies();
    this.loadPetRecord();
    
    this.settingsService.settings$.subscribe(() => {
      this.updateFlatpickrLocales();
    });
  }

  ngOnDestroy() {
    this.loadPetRecordSub?.unsubscribe();
    this.updatePetRecordSub?.unsubscribe();
  }

  saveInformations() {
    this.isLoading = true;
    this.isSubmitted = true;

    if (this.petForm.valid) {
      Object.assign(this.petRecord, this.petForm.value);
      this.petRecord.birthDate = moment(this.petRecord.birthDate);
      this.petRecord.adoptedDate = this.petRecord.adoptedDate ? moment(this.petRecord.adoptedDate) : null;
      this.petRecord.sterilizeDate = this.petRecord.sterilizeDate ? moment(this.petRecord.sterilizeDate) : null;

      if (this.petRecord.isNewPetRecord) {
        this.createPetRecord();
      } else {
        this.updatePetRecord();
      }
    } else {
      setTimeout(() => this.isLoading = false, 500);
    }
  }

  private loadPetRecord() {
    if (this.authService.selectedPetRecordValue.isNewPetRecord) {
      this.petRecord = this.authService.selectedPetRecordValue;
      return;
    }

    this.isLoading = true;

    this.loadPetRecordSub = this.apiService.get<ISerializedPetRecord>(`/pet-record/${ this.authService.selectedPetRecordValue.id }`).pipe(
      tap(async (serializedPetRecord: ISerializedPetRecord) => {
        this.isLoading = false;
        let petRecord = new PetRecord();
        petRecord.deserilizeFromSave(serializedPetRecord);
        this.petRecord = petRecord;

        this.initForm(this.petRecord);
      }),
      catchError((error) => {
        this.isLoading = false;
        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.load'));
        console.error('Unable to load pet record', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

  private loadSpecies() {
    this.species = [
      { key: 'dog', value: PetType.Dog },
      { key: 'cat', value: PetType.Cat },
      { key: 'rabbit', value: PetType.Rabbit },
      { key: 'others', value: PetType.Others },
    ];
  }

  private initForm(petRecord: PetRecord) {
    this.petForm = this.formBuilder.group({
      firstName: [petRecord.firstName, [Validators.required]],
      specie: [petRecord.specie, [Validators.required]],
      breed: [petRecord.breed],
      color: [petRecord.color],
      sex: [petRecord.sex],
      birthDate: [petRecord.birthDate],
      adoptedDate: [petRecord.adoptedDate],
      sterilize: [petRecord.sterilize],
      sterilizeDate: [petRecord.sterilizeDate],
      tagNumber: [petRecord.tagNumber],
      tagRageNumber: [petRecord.tagRageNumber],
      description: [petRecord.description]
    });

    this.initDatePickers(petRecord);
  }

  private initDatePickers(petRecord: PetRecord) {
    setTimeout(() => {
      // No onChange here because petForm change event interfer with date format rendering

      flatpickr(`#${FlatpickrInstances.BirthDate}`, {
        enableTime: true,
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.dateTime'),
        defaultDate: petRecord.birthDate?.toDate(),
        position: 'below'
      });

      flatpickr(`#${FlatpickrInstances.AdoptedDate}`, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: petRecord.adoptedDate?.toDate(),
        position: 'below'
      });

      flatpickr(`#${FlatpickrInstances.SterilizeDate}`, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: petRecord.sterilizeDate?.toDate(),
        position: 'below'
      });
    }, 100);
  }

  private updateFlatpickrLocales() {
    const flatpickrInstances = [FlatpickrInstances.BirthDate, FlatpickrInstances.AdoptedDate, FlatpickrInstances.SterilizeDate];
    flatpickrInstances.forEach(inputId => {
      const input = document.querySelector(`#${inputId}`) as IInputElementWithFlatpickr;
      if (input?._flatpickr) {
        const format = inputId === FlatpickrInstances.BirthDate ? 'commons.dateFormats.flatpickr.dateTime' : 'commons.dateFormats.flatpickr.date';
        input._flatpickr.set('altFormat', this.translateService.instant(format));
        input._flatpickr.set('locale', this.settingsService.currentSettings.locale);
        input._flatpickr.redraw();
      }
    });
  }

  private createPetRecord() {
    const serializedPetRecord = this.petRecord.serializeForSave();
    this.updatePetRecordSub = this.apiService.post<ISerializedPetRecord>(`/pet-record`, serializedPetRecord).pipe(
      tap(async (serializedPetRecord: ISerializedPetRecord) => {
        this.isLoading = false;
        this.isSubmitted = false;

        let petRecord = new PetRecord();
        petRecord.deserilizeFromSave(serializedPetRecord);

        this.authService.selectedPetRecordValue = petRecord;

        this.toastService.showToast('success', this.translateService.instant('commons.toast.success.create'));
        this.router.navigate(['/home']);
      }),
      catchError((error) => {
        this.isLoading = false;

        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.create'));
        console.error('Unable to update pet record', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

  private updatePetRecord() {
    const serializedPetRecord = this.petRecord.serializeForSave();
    this.updatePetRecordSub = this.apiService.put<ISerializedPetRecord>(`/pet-record/${this.authService.selectedPetRecordValue.id}`, serializedPetRecord).pipe(
      tap(async () => {
        this.isLoading = false;
        this.isSubmitted = false;

        this.toastService.showToast('success', this.translateService.instant('commons.toast.success.update'));
        this.router.navigate(['/home']);
      }),
      catchError((error) => {
        this.isLoading = false;

        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.update'));
        console.error('Unable to update pet record', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

}
