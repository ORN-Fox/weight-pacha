import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-moment';
import flatpickr from 'flatpickr';
import * as moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';

import { ISerializedMeasure, Measure } from 'src/app/core/models/measure/measure.model';

@Component({
  selector: 'app-weight-monitoring',
  templateUrl: './weight-monitoring.component.html',
  styleUrls: ['./weight-monitoring.component.scss']
})
export class WeightMonitoringComponent {

  chart: any;
  data: any;

  measures: Measure[];

  date: moment.Moment;
  weight: number;

  constructor(
    private localStorageService: LocalStorageService
  ) {
    this.measures = [];

    this.date = moment();
    this.weight = 0;

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

  isInvalidDate(): boolean {
    if (this.date) {
      return !moment(this.date).isValid();
    }
    return false;
  }

  isInvalidWeight(): boolean {
    return this.weight < 0;
  }

  isExistingMeasureOnSelectedDate(): boolean {
    return this.measures.filter(measure => measure.date.isSame(this.date, 'day')).length > 0;
  }

  shouldDisableAddMeasureButton(): boolean {
    return this.isInvalidWeight() || this.isExistingMeasureOnSelectedDate();
  }

  addMeasure() {
    let weight: number | null = this.weight;
    if (weight == 0) {
      weight = null;
    }

    let measure = new Measure(this.date, weight);
    this.measures.push(measure);

    let dataPoint = {
      x: measure.date,
      y: measure.weigth
    };

    this.chart.data.datasets[0].data.push(dataPoint);
    this.chart.update();
    this.weight = 0;

    let serializedMeasures: ISerializedMeasure[] = [];
    this.measures.forEach(measure => {
      serializedMeasures.push(measure.serializeForSave());
    });

    this.localStorageService.setItem('weight-pacha-data', { measures: serializedMeasures });
  }

  deleteMeasure(measureToDelete: Measure) {
    this.measures = this.measures.filter(measure => !measure.date.isSame(measureToDelete.date, 'day'));

    this.chart.data.datasets[0].data = this.chart.data.datasets[0].data.filter((dataPoint: { x: moment.MomentInput, y: number }) => !moment(dataPoint.x).isSame(measureToDelete.date, 'day'));
    this.chart.update();

    let serializedMeasures: ISerializedMeasure[] = [];
    this.measures.forEach(measure => {
      serializedMeasures.push(measure.serializeForSave());
    });

    this.localStorageService.setItem('weight-pacha-data', { measures: serializedMeasures });
  }

  private loadMeasures() {
    if (this.localStorageService.isItemExist('weight-pacha-data')) {
      let measuresJSON = this.localStorageService.getItem('weight-pacha-data');
      measuresJSON.measures.forEach((measureJSON: ISerializedMeasure) => {
        let measure = new Measure(moment(), null);
        measure.deserilizeFromSave(measureJSON);
        this.measures.push(measure);
      });
    } else {
      this.localStorageService.setItem('weight-pacha-data', []);
    }

    this.initChartData();
  }

  private initChartData() {
    const down = (ctx: { p0: { parsed: { y: number; }; }; p1: { parsed: { y: number; }; }; }, value: string): string | undefined => {
      if (ctx.p0.parsed.y > ctx.p1.parsed.y) {
        return value;
      }
      return undefined;
    }

    const skipped = (ctx: { p0: { skip: any; }; p1: { skip: any; }; }, value: string | number[]): string | number[] | undefined => {
      if (ctx.p0.skip || ctx.p1.skip) {
        return value;
      }
      return undefined;
    }

    this.data = {
      datasets: [
        {
          label: 'Poids (Kg)',
          data: this.computeDataPoints(),
          cubicInterpolationMode: 'monotone',
          pointStyle: 'circle',
          pointRadius: 5,
          pointHoverRadius: 10,
          borderColor: 'rgb(75, 192, 192)',
          segment: {
            borderColor: (ctx: any) => down(ctx, 'rgb(192,75,75)') || skipped(ctx, 'rgb(0,0,0,.2)'),
            borderDash: (ctx: any) => skipped(ctx, [6, 6]),
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
        }
      },
    };
    return config;
  }

}
