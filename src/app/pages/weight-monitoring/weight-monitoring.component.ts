import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import flatpickr from 'flatpickr';
import * as moment from 'moment';
import 'chartjs-adapter-moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';

import { UnitType } from 'src/app/core/enums/unit-type/unit-type.enum';

import { ISerializedMeasure, Measure } from 'src/app/core/models/measure/measure.model';

@Component({
  selector: 'app-weight-monitoring',
  templateUrl: './weight-monitoring.component.html',
  styleUrls: ['./weight-monitoring.component.scss']
})
export class WeightMonitoringComponent {

  APP_STORAGE_KEY: string;

  chart: any;
  data: any;

  measures: Measure[];
  measureUnit: UnitType;
  healthWeight: number;

  date: moment.Moment;
  weight: number;

  constructor(
    private localStorageService: LocalStorageService
  ) {
    this.APP_STORAGE_KEY = 'weight-pacha-data';

    this.measures = [];
    this.measureUnit = UnitType.Kg;
    this.healthWeight = 4;

    this.date = moment();
    this.weight = 4;

    Chart.register(annotationPlugin);

    this.loadMeasures();
  }

  ngAfterViewInit() {
    flatpickr('#measureDate', {
      enableTime: true,
      dateFormat: 'Y-m-d H:i',
      defaultDate: this.date.toDate(),
      onChange: (_selectedDates: Object, date: string) => {
        this.date = moment(date);
      }
    });

    this.chart = new Chart(
      document.getElementById('weightChart') as HTMLCanvasElement,
      this.getChartConfig()
    );
  }

  getMeasureUnitLabel(): string {
    switch(this.measureUnit) {
      case UnitType.Kg:
        return "Kg";
      case UnitType.Lbs:
        return "Lbs";
    }
  }

  isInvalidDate(): boolean {
    if (this.date) {
      return !moment(this.date).isValid();
    }
    return false;
  }

  isInvalidWeight(): boolean {
    return this.weight <= 0;
  }

  isInvalidHealthWeight(): boolean {
    return this.healthWeight <= 0;
  }

  isExistingMeasureOnSelectedDate(): boolean {
    return this.measures.filter(measure => measure.date.isSame(this.date, 'day')).length > 0;
  }

  shouldDisableAddMeasureButton(): boolean {
    return this.isInvalidWeight() || this.isExistingMeasureOnSelectedDate();
  }

  addMeasure() {
    let measure = new Measure(this.date,  this.weight);
    this.measures.push(measure);

    let dataPoint = {
      x: measure.date,
      y: measure.weigth
    };

    this.weight = 0;
    this.saveMeasures();

    this.chart.data.datasets[0].data.push(dataPoint);
    this.updateChart();
  }

  onDeleteMeasure(event: { measure: Measure }) {
    this.measures = this.measures.filter(measure => !measure.date.isSame(event.measure.date, 'day'));

    this.saveMeasures();

    this.chart.data.datasets[0].data = this.chart.data.datasets[0].data.filter((dataPoint: { x: moment.MomentInput, y: number }) => !moment(dataPoint.x).isSame(event.measure.date, 'day'));
    this.updateChart();
  }

  updateMeasureUnit() {
    const healthWeightLabel = this.chart.options.plugins.annotation.annotations.label;
    healthWeightLabel.content = this.computeWeightHealthLabel();

    this.saveMeasures();
    this.updateChart();
  }

  updateHealthWeigth() {
    if (this.isInvalidHealthWeight()) {
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
    return `Poids santé : ${this.healthWeight} ${this.getMeasureUnitLabel()}`;
  }

  private loadMeasures() {
    if (this.localStorageService.isItemExist(this.APP_STORAGE_KEY)) {
      let measuresJSON = this.localStorageService.getItem(this.APP_STORAGE_KEY);

      this.healthWeight = measuresJSON.healthWeight;
      this.measureUnit = measuresJSON.measureUnit;

      measuresJSON.measures.forEach((measureJSON: ISerializedMeasure) => {
        let measure = new Measure(moment(), null);
        measure.deserilizeFromSave(measureJSON);
        this.measures.push(measure);
      });
    } else {
      this.localStorageService.setItem(this.APP_STORAGE_KEY, { healthWeight: this.healthWeight, measureUnit: this.measureUnit, measures: [] });
    }

    this.initChartData();
  }

  private saveMeasures() {
    let serializedMeasures: ISerializedMeasure[] = [];
    this.measures.forEach(measure => {
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
          label: "Poids",
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
    let dataPoints: any[] = [];
    this.measures.forEach(measure => {
      let dataPoint = {
        x: measure.date,
        y: measure.weigth
      }
      dataPoints.push(dataPoint);
    });

    return dataPoints;
  };

  private getSuggestedMax(): number {
    if (this.data) {
      let max = 0;
      let suggestedMaxGap = .5;
      this.data.datasets[0].data.forEach((dataPoint: { x: moment.Moment, y: number }) => {
        if (dataPoint.y > max) {
          max = dataPoint.y;
        }
      });
      return max + suggestedMaxGap;
    }
    return 5;
  }

  private getChartConfig(): any {
    const config = {
      type: 'line',
      data: this.data,
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              tooltipFormat: 'L LT'
            },
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Poids'
            },
            suggestedMin: 0,
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
