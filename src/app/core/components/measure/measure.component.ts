import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { Measure } from '../../models/measure/measure.model';

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
export class MeasureComponent implements AfterViewInit {

  @Input() measures: Measure[];
  @Input() measure: Measure;
  @Input() measureUnitLabel: string;

  @Output() updateMeasureEvent: EventEmitter<{ measure: Measure }> = new EventEmitter();
  @Output() deleteMeasureEvent: EventEmitter<{ measure: Measure }> = new EventEmitter();

  editMode: boolean;

  constructor() {
    this.editMode = false;
  }

  ngAfterViewInit() {
    this.measureDiff = this.getDiffWithPreviousMeasure();
  }

  isInvalidDate(): boolean {
    if (this.measure.date) {
      return !moment(this.measure.date).isValid();
    }
    return false;
  }

  isInvalidWeight(weight: number): boolean {
    return weight <= 0;
  }

  isExistingMeasureOnSelectedDate(): boolean {
    return this.measures.filter(measure => measure.date.isSame(this.measure.date, 'day') && measure.id != this.measure.id).length > 0;
  }

  shouldDisableAddMeasureButton(): boolean {
    return this.isInvalidWeight(this.measure.weigth) || this.isExistingMeasureOnSelectedDate();
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

  getDiffWithPreviousMeasure(): IMeasureDiff {
    const previousMeasure = this.measures.reduce((previousMeasure, measure) => {
      if (measure.date.isBefore(this.measure.date, 'd')) {
        if (!previousMeasure) {
          previousMeasure = measure;
        } else if (measure.date.isAfter(previousMeasure.date, 'd')) {
          previousMeasure = measure;
        }
      }
      return previousMeasure;
    });

    let weightDiff = (this.measure.weigth - previousMeasure.weigth);

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

    // Wait dom rendering before init flatpickr
    setTimeout(() => {
      flatpickr(`#measureDateInput_${this.measure.id}`, {
        enableTime: true,
        dateFormat: 'Y-m-d H:i',
        defaultDate: this.measure.date.toDate(),
        onChange: (_selectedDates: Object, date: string) => {
          this.measure.date = moment(date);

          this.measureDiff = this.getDiffWithPreviousMeasure();
        }
      });
    }, 100);
  }

  saveMeasure() {
    // TODO handle validations
    this.editMode = false;
    this.measure.updatedAt = moment();
    this.measureDiff = this.getDiffWithPreviousMeasure();
    this.updateMeasureEvent.emit({ measure: this.measure })
  }

  deleteMeasure() {
    this.deleteMeasureEvent.emit({ measure: this.measure });
  }

}
