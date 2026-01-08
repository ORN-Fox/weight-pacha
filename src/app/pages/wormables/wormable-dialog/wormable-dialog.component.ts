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

import { Wormable } from 'src/app/core/models/wormable/wormable.model';

export interface WormableDialogData {
  action: DialogAction;
  wormable: Wormable;
}

enum WormableDatePickerInput {
  InjectionDateInput = '#injectionDateInput',
  ReminderDateInput = '#reminderDateInput'
}

@Component({
  selector: 'app-wormable-dialog',
  templateUrl: './wormable-dialog.component.html',
  styleUrl: './wormable-dialog.component.scss',
  standalone: false
})
export class WormableDialogComponent implements OnInit, OnDestroy {

  readonly apiService = inject(ApiService);
  readonly authService = inject(AuthService);
  readonly dialogRef = inject(MatDialogRef<WormableDialogComponent>);
  readonly formBuilder = inject(FormBuilder);
  readonly translateService = inject(TranslateService);
  readonly toastService = inject(ToastService);
  readonly settingsService = inject(SettingsService);

  readonly data = inject<WormableDialogData>(MAT_DIALOG_DATA);

  wormableForm: FormGroup;

  createWormableSub: Subscription;
  updateWormableSub: Subscription;

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
    this.initForm(this.data.wormable);
  }

  ngOnDestroy() {
    this.createWormableSub?.unsubscribe();
    this.updateWormableSub?.unsubscribe();
  }

  saveWormable() {
    this.isLoading = true;
    this.isSubmitted = true;

    if (this.wormableForm.valid) {
      Object.assign(this.data.wormable, this.wormableForm.value);
      this.data.wormable.injectionDate = moment(this.data.wormable.injectionDate);
      this.data.wormable.reminderDate = this.data.wormable.reminderDate ? moment(this.data.wormable.reminderDate) : null;
      
      if (this.data.action === DialogAction.ADD) {
        this.createWormable();
      }

      if (this.data.action === DialogAction.UPDATE) {
        this.updateWormable();
      }
    } else {
      setTimeout(() => this.isLoading = false, 500);
    }
  }

  private initForm(wormable: Wormable) {
    this.wormableForm = this.formBuilder.group({
      injectionDate: [wormable.injectionDate, [Validators.required]],
      name: [wormable.name, [Validators.required]],
      reminderDate: [wormable.reminderDate, [reminderDateValidator(wormable.injectionDate)]],
      description: [wormable.description]
    })

    this.initDatePickers(this.data.wormable);
  }

  private initDatePickers(wormable: Wormable) {
    setTimeout(() => {
      // No onChange here because petForm change event interfer with date format rendering

      flatpickr(WormableDatePickerInput.InjectionDateInput, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: wormable.injectionDate.toDate(),
        position: 'below'
      });

      flatpickr(WormableDatePickerInput.ReminderDateInput, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: wormable.reminderDate?.toDate(),
        position: 'below'
      });
    }, 100);
  }
  
  private updateFlatpickrLocales() {
    [WormableDatePickerInput.InjectionDateInput, WormableDatePickerInput.ReminderDateInput].forEach(inputId => {
      const input = document.querySelector(inputId) as IInputElementWithFlatpickr;
      if (input?._flatpickr) {
        input._flatpickr.set('altFormat', this.translateService.instant('commons.dateFormats.flatpickr.date'));
        input._flatpickr.set('locale', this.settingsService.currentSettings.locale);
        input._flatpickr.redraw();
      }
    });
  }

  private createWormable() {
    const serializeWormable = this.data.wormable.serializeForSave();
    this.createWormableSub = this.apiService.post(`/pet-record/${ this.authService.selectedPetRecordValue.id }/wormable`, serializeWormable).pipe(
      tap(() => {
        this.isLoading = false;
        this.isSubmitted = false;
        this.dialogRef.close(true);
      }),
      catchError((error) => {
        this.isLoading = false;

        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.create'));
        console.error('Unable to create wormable', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

  private updateWormable() {
    const serializeWormable = this.data.wormable.serializeForSave();
    this.updateWormableSub = this.apiService.put(`/pet-record/${ this.authService.selectedPetRecordValue.id }/wormable/${ serializeWormable.id }`, serializeWormable).pipe(
      tap(() => {
        this.isLoading = false;
        this.isSubmitted = false;
        this.dialogRef.close(true);
      }),
      catchError((error) => {
        this.isLoading = false;

        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.update'));
        console.error('Unable to update wormable', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

}
