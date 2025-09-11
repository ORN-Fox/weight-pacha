import { Component, EventEmitter, Input, Output } from '@angular/core';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { Measure } from '../../models/measure/measure.model';

@Component({
    selector: 'app-measure',
    templateUrl: './measure.component.html',
    styleUrls: ['./measure.component.scss'],
    standalone: false
})
export class MeasureComponent {

  @Input() measures: Measure[];
  @Input() measure: Measure;
  @Input() measureUnitLabel: string;

  @Output() updateMeasureEvent: EventEmitter<{ measure: Measure }> = new EventEmitter();
  @Output() deleteMeasureEvent: EventEmitter<{ measure: Measure }> = new EventEmitter();

  editMode: boolean;

  constructor() {
    this.editMode = false;
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

  getDiffWithPreviousMeasure() {
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

    let weightDiff = this.measure.weigth - previousMeasure.weigth;
    // TODO compute diff percentage + display data with arrow icon and color
    return weightDiff.toFixed(3);
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
        }
      });
    }, 100);
  }

  saveMeasure() {
    // TODO handle validations
    this.editMode = false;
    this.measure.updatedAt = moment();
    this.updateMeasureEvent.emit({ measure: this.measure })
  }

  deleteMeasure() {
    this.deleteMeasureEvent.emit({ measure: this.measure });
  }

}
