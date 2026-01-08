import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { catchError, Subscription, tap, throwError } from 'rxjs';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';

import { DialogAction } from 'src/app/core/enums/dialog-action/dialog.action.enum';

import { IInputElementWithFlatpickr } from 'src/app/core/interfaces/IInputElementWithFlatpickr';

import { reminderDateValidator } from 'src/app/core/validators/same-or-before-reminder-date-error.validator';

import { Vaccine } from 'src/app/core/models/vaccine/vaccine.model';

export interface VaccineDialogData {
  action: DialogAction;
  vaccine: Vaccine;
}

enum VaccineDatePickerInput {
  InjectionDateInput = '#injectionDateInput',
  ReminderDateInput = '#reminderDateInput'
}

@Component({
  selector: 'app-vaccine-dialog',
  templateUrl: './vaccine-dialog.component.html',
  styleUrl: './vaccine-dialog.component.scss',
  standalone: false
})
export class VaccineDialogComponent implements OnInit, OnDestroy {

  readonly apiService = inject(ApiService);
  readonly authService = inject(AuthService);
  readonly dialogRef = inject(MatDialogRef<VaccineDialogComponent>);
  readonly formBuilder = inject(FormBuilder);
  readonly toastService = inject(ToastService);
  readonly translateService = inject(TranslateService);
  readonly settingsService = inject(SettingsService);
  
  readonly data = inject<VaccineDialogData>(MAT_DIALOG_DATA);

  vaccineForm: FormGroup;

  createVaccineSub: Subscription;
  updateVaccineSub: Subscription;
  
  addMode: boolean;
  isLoading: boolean = false;
  isSubmitted: boolean = false;

  constructor() {
    this.addMode = this.data.action === DialogAction.ADD;
    
    this.settingsService.settings$.subscribe(() => {
      this.updateFlatpickrLocales();
    });
  }
  
  ngOnInit() {
    this.initForm(this.data.vaccine);
  }

  ngOnDestroy() {
    this.createVaccineSub?.unsubscribe();
    this.updateVaccineSub?.unsubscribe();
  }

  saveVaccine() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.vaccineForm.valid) {
      Object.assign(this.data.vaccine, this.vaccineForm.value);
      this.data.vaccine.injectionDate = moment(this.data.vaccine.injectionDate);
      this.data.vaccine.reminderDate = this.data.vaccine.reminderDate ? moment(this.data.vaccine.reminderDate) : null;

      if (this.data.action === DialogAction.ADD) {
        this.createVaccine();
      }

      if (this.data.action === DialogAction.UPDATE) {
        this.updateVaccine();
      }
    } else {
      setTimeout(() => this.isLoading = false, 500);
    }
  }

  private initForm(vaccine: Vaccine) {
    this.vaccineForm = this.formBuilder.group({
      injectionDate: [vaccine.injectionDate, [Validators.required]],
      name: [vaccine.name, [Validators.required]],
      reminderDate: [vaccine.reminderDate, [reminderDateValidator(vaccine.injectionDate)]],
      description: [vaccine.description]
    })

    this.initDatePickers(this.data.vaccine);
  }

  private initDatePickers(vaccine: Vaccine) {
    setTimeout(() => {
      // No onChange here because petForm change event interfer with date format rendering

      flatpickr(VaccineDatePickerInput.InjectionDateInput, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: vaccine.injectionDate.toDate(),
        position: 'below'
      });

      flatpickr(VaccineDatePickerInput.ReminderDateInput, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: vaccine.reminderDate?.toDate(),
        position: 'below'
      })
    }, 100);
  }
  
  private updateFlatpickrLocales() {
    [VaccineDatePickerInput.InjectionDateInput, VaccineDatePickerInput.ReminderDateInput].forEach(inputId => {
      const input = document.querySelector(inputId) as IInputElementWithFlatpickr;
      if (input?._flatpickr) {
        input._flatpickr.set('altFormat', this.translateService.instant('commons.dateFormats.flatpickr.date'));
        input._flatpickr.set('locale', this.settingsService.currentSettings.locale);
        input._flatpickr.redraw();
      }
    });
  }

  private createVaccine() {
    const serializeVaccine = this.data.vaccine.serializeForSave();
    this.createVaccineSub = this.apiService.post(`/pet-record/${ this.authService.selectedPetRecordValue.id }/vaccine`, serializeVaccine).pipe(
      tap(() => {
        this.isLoading = false;
        this.isSubmitted = false;
        this.dialogRef.close(true);
      }),
      catchError((error) => {
        this.isLoading = false;
        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.create'));
        console.error('Unable to create vaccine', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

  private updateVaccine() {
    const serializeVaccine = this.data.vaccine.serializeForSave();
    this.updateVaccineSub = this.apiService.put(`/pet-record/${ this.authService.selectedPetRecordValue.id }/vaccine/${ serializeVaccine.id }`, serializeVaccine).pipe(
      tap(() => {
        this.isLoading = false;
        this.isSubmitted = false;
        this.dialogRef.close(true);
      }),
      catchError((error) => {
        this.isLoading = false;
        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.update'));
        console.error('Unable to update vaccine', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

}
