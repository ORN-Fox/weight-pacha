import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
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
export class InformationsComponent {

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

  submitted: boolean = false;

  constructor() {
    this.initForm(new PetRecord());

    this.loadSpecies();
    this.loadPetRecord();
    
    this.settingsService.settings$.subscribe(() => {
      this.updateFlatpickrLocales();
    });
  }

  saveInformations() {
    this.submitted = true;

    if (this.petForm.valid) {
      Object.assign(this.petRecord, this.petForm.value);
      this.petRecord.birthDate = moment(this.petRecord.birthDate);
      this.petRecord.adoptedDate = this.petRecord.adoptedDate ? moment(this.petRecord.adoptedDate) : null,
      this.petRecord.sterilizeDate = this.petRecord.sterilizeDate ? moment(this.petRecord.sterilizeDate) : null,
      this.petRecord.updatedAt = moment();

      const serializedPetRecord = this.petRecord.serializeForSave();
      this.apiService.put<ISerializedPetRecord>(`/pet-record/${ this.authService.selectedPetRecordValue.id }/update`, serializedPetRecord).pipe(
        tap(async () => {
          this.submitted = false;

          this.toastService.showToast('success', this.translateService.instant('commons.toast.success.save'));
          this.router.navigate(['/home']);
        }),
        catchError(err => {
          this.submitted = false;
          
          this.toastService.showToast('error', this.translateService.instant('commons.toast.error.save'));
          console.error('Unable to update pet record', err);
          return throwError(err);
        }),
      ).subscribe();
    }
  }

  private loadPetRecord() {
    this.apiService.get<ISerializedPetRecord>(`/pet-record/${ this.authService.selectedPetRecordValue.id }`).pipe(
      tap(async (serializedPetRecord: ISerializedPetRecord) => {
        let petRecord = new PetRecord();
        petRecord.deserilizeFromSave(serializedPetRecord);
        this.petRecord = petRecord;

        this.initForm(this.petRecord);
      }),
      catchError(err => {
        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.load'));
        console.error('Unable to load pet record', err);
        return throwError(err);
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

}
