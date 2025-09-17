import { Component } from '@angular/core';
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

import { UnitType } from 'src/app/core/enums/unit-type/unit-type.enum';

import { ISerializedMeasure, Measure } from 'src/app/core/models/measure/measure.model';

export interface IChatDataSetPoint {
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

  APP_STORAGE_KEY: string;

  chart: any;
  data: any;

  sourceMeasures: Measure[];
  measures: Measure[];
  measureUnit: UnitType;
  healthWeight: number;

  rangeDateInputInstance: Instance;

  date: moment.Moment;
  weight: number;

  constructor(
    private localStorageService: LocalStorageService,
    private translateService: TranslateService
  ) {
    this.APP_STORAGE_KEY = 'weight-pacha-data-measures';

    this.sourceMeasures = [];
    this.measures = [];
    this.measureUnit = UnitType.Kg;
    this.healthWeight = 4;

    this.rangeDateInputInstance = new Object() as Instance;

    this.date = moment();
    this.weight = 4;

    Chart.register(annotationPlugin);

    this.loadMeasures();
  }

  ngAfterViewInit() {
    this.rangeDateInputInstance = flatpickr('#rangeDatesInput', {
      mode: "range",
      dateFormat: this.translateService.instant('commons.dateFormats.flatpickrDateFormat'),
      defaultDate: this.getRangeDates(),
      onChange: (selectedDates: Date[]) => {
        this.onChangeRangeDates(selectedDates);
      }
    }) as Instance;

    flatpickr('#measureDateInput', {
      dateFormat: this.translateService.instant('commons.dateFormats.flatpickrDateFormat'),
      defaultDate: this.date.toDate(),
      onChange: (selectedDates: Date[]) => {
        this.date = moment(selectedDates[0]);
      }
    });

    this.chart = new Chart(
      document.getElementById('weightChart') as HTMLCanvasElement,
      this.getChartConfig()
    );
  }

  onChangeRangeDates(selectedDates: Date[]) {
    if (selectedDates.length > 1) {
      this.measures = this.sourceMeasures.filter((measure) => measure.date.isBetween(selectedDates[0], selectedDates[1], 'day', '[]'));
      this.chart.data.datasets[0].data = this.computeDataPoints();
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

  isInvalidDate(): boolean {
    return DateService.isInvalidDate(this.date);
  }

  isInvalidWeight(weight: number): boolean {
    return weight <= 0;
  }

  isExistingMeasureOnSelectedDate(): boolean {
    return this.measures.filter(measure => measure.date.isSame(this.date, 'day')).length > 0;
  }

  shouldDisableAddMeasureButton(): boolean {
    return this.isInvalidWeight(this.weight) || this.isExistingMeasureOnSelectedDate();
  }

  addMeasure() {
    let measure = new Measure(this.date, this.weight);
    this.sourceMeasures.push(measure);
    this.measures.push(measure);
    this.saveMeasures();

    let dataPoint: IChatDataSetPoint = {
      x: measure.date,
      y: measure.weigth
    };

    this.chart.data.datasets[0].data.push(dataPoint);
    this.updateRangeDates();
    
  }

  onUpdateMeasure(event: { measure: Measure }) {
    let rangeDates = this.getRangeDates();

    const index = this.sourceMeasures.findIndex(measure => measure.id === event.measure.id);
    if (index !== -1) {
      this.sourceMeasures[index] = event.measure;
    }

    this.measures = this.sourceMeasures.filter((measure) => measure.date.isBetween(rangeDates[0], rangeDates[1], 'day', '[]'))
    this.saveMeasures();

    this.chart.data.datasets[0].data = this.chart.data.datasets[0].data.filter((dataPoint: IChatDataSetPoint) => !moment(dataPoint.x).isSame(event.measure.date, 'day'));
    this.updateRangeDates();
  }

  onDeleteMeasure(event: { measure: Measure }) {
    let rangeDates = this.getRangeDates();

    this.sourceMeasures = this.sourceMeasures.filter(measure => !measure.date.isSame(event.measure.date, 'day'));
    this.measures = this.sourceMeasures.filter((measure) => measure.date.isBetween(rangeDates[0], rangeDates[1], 'day', '[]'))
    this.saveMeasures();

    this.chart.data.datasets[0].data = this.chart.data.datasets[0].data.filter((dataPoint: IChatDataSetPoint) => !moment(dataPoint.x).isSame(event.measure.date, 'day'));
    this.updateRangeDates();
  }

  updateMeasureUnit() {
    const healthWeightLabel = this.chart.options.plugins.annotation.annotations.label;
    healthWeightLabel.content = this.computeWeightHealthLabel();

    this.saveMeasures();
    this.updateChart();
  }

  updateHealthWeigth() {
    if (this.isInvalidWeight(this.healthWeight)) {
      return;
    }

    const healthWeightLine = this.chart.options.plugins.annotation.annotations.healthWeightLine;
    healthWeightLine.yMin = this.healthWeight;
    healthWeightLine.yMax = this.healthWeight;

    const healthWeightLabel = this.chart.options.plugins.annotation.annotations.label;
    healthWeightLabel.content = this.computeWeightHealthLabel();

    this.saveMeasures();
    this.updateChart();
  }

  private computeWeightHealthLabel(): string {
    return `${this.translateService.instant('pages.weight.healthyWeight')} : ${this.healthWeight} ${this.getMeasureUnitLabel()}`;
  }

  private loadMeasures() {
    if (this.localStorageService.isItemExist(this.APP_STORAGE_KEY)) {
      let measuresJSON = this.localStorageService.getItem(this.APP_STORAGE_KEY);

      this.healthWeight = measuresJSON.healthWeight;
      this.measureUnit = measuresJSON.measureUnit;

      measuresJSON.measures.forEach((measureJSON: ISerializedMeasure) => {
        let measure = new Measure();
        measure.deserilizeFromSave(measureJSON);
        this.sourceMeasures.push(measure);
      });
      this.measures = cloneDeep(this.sourceMeasures);
    } else {
      this.localStorageService.setItem(this.APP_STORAGE_KEY, { healthWeight: this.healthWeight, measureUnit: this.measureUnit, measures: this.sourceMeasures });
    }

    this.initChartData();
  }

  private saveMeasures() {
    let serializedMeasures: ISerializedMeasure[] = [];
    this.sourceMeasures.forEach(measure => {
      serializedMeasures.push(measure.serializeForSave());
    });

    this.localStorageService.setItem(this.APP_STORAGE_KEY, { healthWeight: this.healthWeight, measureUnit: this.measureUnit, measures: serializedMeasures });
  }

  private initChartData() {
    const down = (ctx: { p0: { parsed: { y: number; }; }; p1: { parsed: { y: number; }; }; }, value: string): string | undefined => {
      if (ctx.p0.parsed.y > ctx.p1.parsed.y) {
        return value;
      }
      return undefined;
    }

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
            borderColor: (ctx: any) => down(ctx, 'rgb(192,75,75)')
          },
          spanGaps: true
        }
      ]
    };
  }

  private computeDataPoints(): any[] {
    let dataPoints: IChatDataSetPoint[] = [];
    this.measures.forEach(measure => {
      let dataPoint = {
        x: measure.date,
        y: measure.weigth
      }
      dataPoints.push(dataPoint);
    });

    return dataPoints;
  };

  private getSuggestedMin(): number {
    let min = 999999;
    if (this.data) {
      let suggestedMinGap = .25;
      this.data.datasets[0].data.forEach((dataPoint: IChatDataSetPoint) => {
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
      this.data.datasets[0].data.forEach((dataPoint: IChatDataSetPoint) => {
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
    this.chart.update();
  }

}

