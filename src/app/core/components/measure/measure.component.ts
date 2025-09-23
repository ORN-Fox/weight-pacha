import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { Measure } from '../../models/measure/measure.model';
import { DateService } from '../../services/date/date.service';

export interface IMeasureDiff {
  value: string;
  percentage: number;
  icon: string;
  colorClass: string;
}

@Component({
    selector: 'app-measure',
    templateUrl: './measure.component.html',
    styleUrls: ['./measure.component.scss'],
    standalone: false
})
export class MeasureComponent implements OnInit {

  @Input() measures: Measure[];
  @Input() measure: Measure;
  @Input() measureUnitLabel: string;

  @Output() updateMeasureEvent: EventEmitter<{ measure: Measure }> = new EventEmitter();
  @Output() deleteMeasureEvent: EventEmitter<{ measure: Measure }> = new EventEmitter();

  editMode: boolean;

  measureForm: FormGroup;
  measureDiff: IMeasureDiff;
  dateTimeFormat: string;

  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {
    this.editMode = false;
    this.dateTimeFormat = this.translateService.instant('commons.dateFormats.dateTime');
  }

  ngOnInit() {
    this.measureDiff = this.getDiffWithPreviousMeasure(this.measure.date);
  }

  invalidDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      let targetDate = moment(control.value);
      if (!targetDate || this.isInvalidDate(control.value)) {
        return { 'invalidDate': true };
      }
      return null;
    };
  }

  existingMeasureAtDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      let existingMeasureAtDate = this.isExistingMeasureOnSelectedDate(moment(control.value));
      if (existingMeasureAtDate) {
        return { 'existingMeasureAtDate': true };
      }
      return null;
    };
  }

  isInvalidDate(date: moment.Moment | Date | string): boolean {
    return DateService.isInvalidDate(moment(date));
  }

  isInvalidWeight(weight: number): boolean {
    return weight <= 0;
  }

  isExistingMeasureOnSelectedDate(targetDate: moment.Moment): boolean {
    return this.measures.filter(measure => measure.date.isSame(targetDate, 'day') && measure.id != this.measure.id).length > 0;
  }

  getDiffIcon(diff: number): string {
    if (diff == 0) {
      return 'fa-equals';
    } else if (diff > 0) {
      return 'fa-arrow-alt-up';
    } else {
      return 'fa-arrow-alt-down';
    }
  }

  getDiffColorClass(diff: number): string {
    if (diff == 0) {
      return 'is-light';
    } else if (diff > 0) {
      return 'is-success';
    } else {
      return 'is-danger';
    }
  }

  getDiffWithPreviousMeasure(date: moment.Moment): IMeasureDiff {
    const previousMeasure = this.measures.reduce((previousMeasure, measure) => {
      if (measure.date.isBefore(date, 'd')) {
        if (!previousMeasure) {
          previousMeasure = measure;
        } else if (measure.date.isAfter(previousMeasure.date, 'd')) {
          previousMeasure = measure;
        }
      }
      return previousMeasure;
    });

    let weightDiff = (this.measure.weight - previousMeasure.weight);

    let measureDiff: IMeasureDiff = {
      value: weightDiff == 0 ? weightDiff.toString() : weightDiff.toFixed(3),
      percentage: -1,
      icon: this.getDiffIcon(weightDiff),
      colorClass: this.getDiffColorClass(weightDiff)
    };
    return measureDiff;
  }

  updateMeasure() {
    this.editMode = !this.editMode;

    if (this.editMode) {
      this.initForm();

      // Wait dom rendering before init flatpickr
      setTimeout(() => {

        // No date update in onChange here because petForm change event interfer with date format rendering
        flatpickr(`#measureDateInput_${this.measure.id}`, {
          enableTime: true,
          altInput: true,
          altFormat: this.translateService.instant('commons.dateFormats.flatpickr.dateTime'),
          defaultDate: this.measureForm.get('date')?.value?.toDate(),
          onChange: (selectedDates: Date[]) => {
            this.measureDiff = this.getDiffWithPreviousMeasure(moment(selectedDates[0]));
          }
        });
      }, 100);
    }
  }

  saveMeasure() {
    if (this.measureForm.valid) {
      this.editMode = false;

      Object.assign(this.measure, this.measureForm.value);
      this.measure.date = moment(this.measure.date);
      this.measure.updatedAt = moment();
      this.measureDiff = this.getDiffWithPreviousMeasure(this.measure.date);
      this.updateMeasureEvent.emit({ measure: this.measure })
    }
  }

  deleteMeasure() {
    this.deleteMeasureEvent.emit({ measure: this.measure });
  }

  private initForm() {
    this.measureForm = this.formBuilder.group({
      date: [this.measure.date, [Validators.required, this.invalidDateValidator(), this.existingMeasureAtDateValidator()]],
      weight: [this.measure.weight, [Validators.required, Validators.min(0.001)]]
    });
  }

}
