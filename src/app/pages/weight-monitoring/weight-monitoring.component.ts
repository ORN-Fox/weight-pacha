import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-moment';
import * as moment from 'moment';

import { Measure } from 'src/app/core/models/measure/measure.model';

@Component({
  selector: 'app-weight-monitoring',
  templateUrl: './weight-monitoring.component.html',
  styleUrls: ['./weight-monitoring.component.scss']
})
export class WeightMonitoringComponent {

  chart: any;
  data;

  measures: Measure[];

  date: moment.Moment | string;
  weight: number;

  constructor() {
    this.date = moment();
    this.weight = 0;

    this.measures = [
    ];

    const DATA_COUNT = 16;
    const labels = [];
    for (let i = 0; i < DATA_COUNT; i += .5) {
      labels.push(i.toString());
    }

    const skipped = (ctx: { p0: { skip: any; }; p1: { skip: any; }; }, value: string | number[]) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
    const down = (ctx: { p0: { parsed: { y: number; }; }; p1: { parsed: { y: number; }; }; }, value: string) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;

    const dataPoints: any[] = [];
    this.measures.forEach(measure => {
      let dataPoint = {
        x: measure.date,
        y: measure.weigth
      }
      dataPoints.push(dataPoint);
    });

    this.data = {
      // labels: labels,
      datasets: [
        {
          label: 'Poids (Kg)',
          data: dataPoints,
          fill: false,
          cubicInterpolationMode: 'monotone',
          tension: .4,
          segment: {
            borderColor: (ctx: any) => skipped(ctx, 'rgb(0,0,0,.2)') || down(ctx, 'rgb(192,75,75)'),
            borderDash: (ctx: any) => skipped(ctx, [6, 6]),
          },
          spanGaps: true
        }
      ]
    };
  }

  ngAfterViewInit() {
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

  addValue() {
    let weight: number | null = this.weight;
    if (weight == 0) {
      weight = null;
    }

    let measure = new Measure(moment(), weight);
    this.measures.push(measure);

    let dataPoint = {
      x: measure.date,
      y: measure.weigth
    };

    this.chart.data.datasets[0].data.push(dataPoint);
    this.chart.update();
    this.weight = 0;
  }

  deleteMeasure(measureToDelete: Measure) {
    this.measures = this.measures.filter(measure => !measure.date.isSame(measureToDelete.date, 'day'));

    this.chart.data.datasets[0].data = this.chart.data.datasets[0].data.filter((dataPoint: { x: moment.MomentInput, y: number }) => !moment(dataPoint.x).isSame(measureToDelete.date, 'day'));
    this.chart.update();
  }

  private getChartConfig(): any {
    const config = {
      type: 'line',
      data: this.data,
      options: {
        responsive: true,
        interaction: {
          intersect: false
        },
        scales: {
          x: {
            type: 'time',
            time: {
              displayFormats: {
                quarter: 'DD-MM-YYYY'
              }
            },
            title: {
              text: 'Date'
            }
          },
          y: {
            title: {
              text: 'Poids (Kg)'
            }
          }
        }
      },
    };
    return config;
  }

}
