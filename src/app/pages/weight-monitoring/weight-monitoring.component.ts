import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-moment';
import flatpickr from 'flatpickr';
import { Instance } from 'flatpickr/dist/types/instance';
import moment from 'moment';
import { cloneDeep } from 'lodash';

import { DateService } from 'src/app/core/services/date/date.service';
import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { UnitType } from 'src/app/core/enums/unit-type/unit-type.enum';

import { IChartDataSetPoint } from 'src/app/core/interfaces/IChartDataSetPoint';

import { ISerializedMeasure, Measure } from 'src/app/core/models/measure/measure.model';
import { Settings } from 'src/app/core/models/settings/settings.model';

interface IWeightChartDataSetPoint extends IChartDataSetPoint {
  x: moment.Moment,
  y: number
}

@Component({
  selector: 'app-weight-monitoring',
  templateUrl: './weight-monitoring.component.html',
  styleUrls: ['./weight-monitoring.component.scss'],
  standalone: false
})
export class WeightMonitoringComponent {

  APP_STORAGE_KEY: string = 'weight-pacha-data-measures';

  settings!: Settings;

  chart: any;
  data: any;

  sourceMeasures: Measure[] = [];
  measures: Measure[] = [];
  measureUnit: UnitType;
  healthWeight: number = 4;
  healthWeightOffset: number = .5;

  measureForm: FormGroup;

  rangeDateInputInstance: Instance = new Object() as Instance;

  constructor(
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private serializerService: SerializerService,
    private settingsService: SettingsService
  ) {
    this.settings = this.settingsService.currentSettings;
    
    this.measureUnit = this.settings.weightUnit || UnitType.Kg;

    Chart.register(annotationPlugin);

    this.loadMeasures();
    this.initForm();
  }

  ngAfterViewInit() {
    this.rangeDateInputInstance = flatpickr('#rangeDatesInput', {
      mode: "range",
      altInput: true,
      altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
      defaultDate: this.getRangeDates(),
      onChange: (selectedDates: Date[]) => {
        this.onChangeRangeDates(selectedDates);
      }
    }) as Instance;

    // No date update in onChange here because petForm change event interfer with date format rendering
    flatpickr('#measureDateInput', {
      enableTime: true,
      altInput: true,
      altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
    });

    this.chart = new Chart(
      document.getElementById('weightChart') as HTMLCanvasElement,
      this.getChartConfig()
    );
  }

  onChangeRangeDates(selectedDates: Date[]) {
    if (selectedDates.length > 1) {
      this.measures = this.sourceMeasures.filter((measure) => measure.date.isBetween(selectedDates[0], selectedDates[1], 'day', '[]'));
      this.updateChart();
    }
  }

  getMeasureUnitLabel(): string {
    switch(this.measureUnit) {
      case UnitType.Kg:
        return "Kg";
      case UnitType.Lbs:
        return "Lbs";
    }
  }

  getRangeDates(): Date[] {
    let today = moment();
    let oldestDate = today.clone();
    let latestDate = today.clone();

    if (this.sourceMeasures.length > 0) {

      this.sourceMeasures.forEach((measure) => {
        if (measure.date.isBefore(oldestDate, 'day')) {
          oldestDate = measure.date.clone();
        }

        if (measure.date.isAfter(latestDate, 'day')) {
          latestDate = measure.date.clone();
        }
      });

      return [
        oldestDate.toDate(),
        latestDate.toDate()
      ];
    }

    return [
      oldestDate.subtract(1, 'month').toDate(),
      latestDate.add(1, 'month').toDate()
    ];
  }

  updateRangeDates() {
    let rangeDates = this.getRangeDates();
    this.rangeDateInputInstance.setDate(rangeDates);
    this.onChangeRangeDates(rangeDates);
  }

  invalidDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const targetDate = moment(control.value);
      if (DateService.isInvalidDate(targetDate)) {
        return { 'invalidDate': true };
      }
      return null;
    };
  }

  existingMeasureAtDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const targetDate = moment(control.value);
      if (this.isExistingMeasureOnSelectedDate(targetDate)) {
        return { 'existingMeasureAtDate': true };
      }
      return null;
    };
  }

  isInvalidWeight(weight: number): boolean {
    return weight <= 0;
  }

  isExistingMeasureOnSelectedDate(targetDate: moment.Moment): boolean {
    return this.measures.filter(measure => measure.date.isSame(targetDate, 'day')).length > 0;
  }

  addMeasure() {
    if (this.measureForm.valid) {
      let measure = new Measure();
      Object.assign(measure, this.measureForm.value);
      measure.date = moment(measure.date);

      this.sourceMeasures.push(measure);
      this.sourceMeasures = this.sortMeasuresByDate(this.sourceMeasures);
      this.measures = this.filterMeasuresInRangeDates();
      this.saveMeasures();

      let dataPoint: IWeightChartDataSetPoint = {
        x: measure.date,
        y: measure.weight
      };

      this.chart.data.datasets[0].data.push(dataPoint);
      this.updateRangeDates();
    }
  }

  onUpdateMeasure(event: { measure: Measure }) {
    const index = this.sourceMeasures.findIndex(measure => measure.id === event.measure.id);
    if (index !== -1) {
      this.sourceMeasures[index] = event.measure;
      this.sourceMeasures = this.sortMeasuresByDate(this.sourceMeasures);
    }

    this.measures = this.filterMeasuresInRangeDates();
    this.saveMeasures();

    this.updateRangeDates();
  }

  onDeleteMeasure(event: { measure: Measure }) {
    this.toastService.showConfirm().then((result: { isConfirmed: boolean; }) => {
      if (result.isConfirmed) {
        this.sourceMeasures = this.sourceMeasures.filter(measure => !measure.date.isSame(event.measure.date, 'day'));
        this.measures = this.filterMeasuresInRangeDates();
        this.saveMeasures();

        this.chart.data.datasets[0].data = this.chart.data.datasets[0].data.filter((dataPoint: IWeightChartDataSetPoint) => !moment(dataPoint.x).isSame(event.measure.date, 'day'));
        this.updateRangeDates();
      }
    });
  }

  updateMeasureUnit() {
    const healthWeightLabel = this.chart.options.plugins.annotation.annotations.label;
    healthWeightLabel.content = this.computeWeightHealthLabel();
    
    let weightUnit = this.measureUnit;
    this.settingsService.updateSettings({ weightUnit });
    this.settings = this.settingsService.currentSettings;

    this.saveMeasures();
    this.updateChart();
  }

  updateHealthWeight() {
    if (this.isInvalidWeight(this.healthWeight)) {
      return;
    }

    const healthWeightLine = this.chart.options.plugins.annotation.annotations.healthWeightLine;
    healthWeightLine.yMin = this.healthWeight;
    healthWeightLine.yMax = this.healthWeight;

    const healthWeightZone = this.chart.options.plugins.annotation.annotations.healthWeightZone;
    healthWeightZone.yMin = this.healthWeight - this.healthWeightOffset;
    healthWeightZone.yMax = this.healthWeight + this.healthWeightOffset;

    const healthWeightLabel = this.chart.options.plugins.annotation.annotations.label;
    healthWeightLabel.content = this.computeWeightHealthLabel();

    this.saveMeasures();
    this.updateChart();
  }

  private initForm() {
    this.measureForm = this.formBuilder.group({
      date: [null, [Validators.required, this.invalidDateValidator(), this.existingMeasureAtDateValidator()]],
      weight: [null, [Validators.required, Validators.min(0.001)]]
    });
  }

  private computeWeightHealthLabel(): string {
    return `${this.translateService.instant('pages.weight.healthyWeight')} : ${this.healthWeight} ${this.getMeasureUnitLabel()}`;
  }

  private loadMeasures() {
    if (this.localStorageService.isItemExist(this.APP_STORAGE_KEY)) {
      let measures: Measure[] = [];
      const measuresJSON = this.localStorageService.getItem(this.APP_STORAGE_KEY);

      this.healthWeight = measuresJSON.healthWeight;

      measuresJSON.measures.forEach((measureJSON: ISerializedMeasure) => {
        let measure = new Measure();
        measure.deserilizeFromSave(measureJSON);
        measures.push(measure);
      });
      this.sourceMeasures = measures;
      this.measures = cloneDeep(this.sourceMeasures);
    } else {
      this.localStorageService.setItem(this.APP_STORAGE_KEY, { healthWeight: this.healthWeight, measureUnit: this.measureUnit, measures: this.sourceMeasures });
    }

    this.initChartData();
  }

  private filterMeasuresInRangeDates(): Measure[] {
    let rangeDates = this.getRangeDates();
    return this.sourceMeasures.filter((measure) => measure.date.isBetween(rangeDates[0], rangeDates[1], 'day', '[]'));
  }
  
  private sortMeasuresByDate(measures: Measure[]) {
    return measures.sort((firstMeasure, secondMeasure) => firstMeasure.date.isAfter(secondMeasure.date) ? 1 : -1);
  }

  private saveMeasures() {
    const serializedMeasures = this.serializerService.serializeList(this.sourceMeasures);
    this.localStorageService.setItem(this.APP_STORAGE_KEY, { healthWeight: this.healthWeight, measureUnit: this.measureUnit, measures: serializedMeasures });
  }

  //#region Chart related

  private initChartData() {
    const minHealthWeight = this.healthWeight - this.healthWeightOffset;
    const maxHealthWeight = this.healthWeight + this.healthWeightOffset;
    
    const exceededValue = (
      ctx: { p0: { parsed: { y: number } }, p1: { parsed: { y: number } } },
      value: string
    ): string | undefined => {
      const p0 = ctx.p0.parsed.y;
      const p1 = ctx.p1.parsed.y;
      const diff = p1 - p0;

      if (diff > 0 && p1 > maxHealthWeight) return value;
      if (diff < 0 && (p1 < minHealthWeight || p1 > maxHealthWeight)) return value;
      if (diff === 0 && p1 > maxHealthWeight) return value;

      return;
    };

    this.data = {
      datasets: [
        {
          label: this.translateService.instant('pages.weight.weight'),
          data: this.computeDataPoints(),
          cubicInterpolationMode: 'monotone',
          pointStyle: 'circle',
          pointRadius: 5,
          pointHoverRadius: 10,
          borderColor: 'rgb(75, 192, 192)',
          segment: {
            borderColor: (ctx: any) => exceededValue(ctx, 'rgb(192,75,75)')
          },
          spanGaps: true
        }
      ]
    };
  }

  private computeDataPoints(): any[] {
    let dataPoints: IWeightChartDataSetPoint[] = [];
    this.measures.forEach(measure => {
      let dataPoint = {
        x: measure.date,
        y: measure.weight
      }
      dataPoints.push(dataPoint);
    });

    return dataPoints;
  };

  private getSuggestedMin(): number {
    let min = 999999;
    if (this.data) {
      let suggestedMinGap = .25;
      this.data.datasets[0].data.forEach((dataPoint: IWeightChartDataSetPoint) => {
        if (dataPoint.y < min) {
          min = dataPoint.y;
        }
      });
      min -= suggestedMinGap;
    }
    return min;
  }

  private getSuggestedMax(): number {
    let max = 0;
    if (this.data) {
      let suggestedMaxGap = .25;
      this.data.datasets[0].data.forEach((dataPoint: IWeightChartDataSetPoint) => {
        if (dataPoint.y > max) {
          max = dataPoint.y;
        }
      });
      max += suggestedMaxGap;
    }
    return max;
  }

  private getChartConfig(): any {
    const config = {
      type: 'line',
      data: this.data,
      locale: this.translateService.currentLang,
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              tooltipFormat: 'L LT'
            },
            title: {
              display: true,
              text: this.translateService.instant('pages.weight.date')
            }
          },
          y: {
            title: {
              display: true,
              text: this.translateService.instant('pages.weight.weight')
            },
            suggestedMin: this.getSuggestedMin(),
            suggestedMax: this.getSuggestedMax()
          }
        },
        plugins: {
          annotation: {
            annotations: {
              healthWeightLine: {
                type: 'line',
                yMin: this.healthWeight,
                yMax: this.healthWeight,
                borderColor: 'rgb(107, 201, 255)',
                borderWidth: 2
              },
              healthWeightZone: {
                type: 'box',
                yMin: this.healthWeight - this.healthWeightOffset,
                yMax: this.healthWeight + this.healthWeightOffset,
                backgroundColor: 'rgba(107, 201, 255, 0.1)',
                borderColor: 'transparent'
              },
              label: {
                backgroundColor: 'grey',
                content: this.computeWeightHealthLabel(),
                display: true
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context: { dataset: { label: string; }; parsed: { y: number | bigint | null; }; }) => {
                return `${context.dataset.label} : ${context.parsed.y} ${this.getMeasureUnitLabel()}`;
              }
            }
          }
        }
      }
    };
    return config;
  }

  private updateChart() {
    this.chart.data.datasets[0].data = this.computeDataPoints();
    this.chart.options.scales.y.suggestedMin = this.getSuggestedMin();
    this.chart.options.scales.y.suggestedMax = this.getSuggestedMax();
    
    this.chart.update();
  }

  //#endregion

}

