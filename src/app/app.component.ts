import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
import * as moment from 'moment';

import { Measure } from './core/models/measure/measure.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  chart: any;
  data;

  measures: Measure[];

  weight: number;

  constructor() {
    this.weight = 0;

    this.measures = [
      new Measure(moment('2021-06-27'), .220),
      new Measure(moment('2021-12-27'), .832),
      new Measure(moment('2022-06-27'), 1.678),
      new Measure(moment('2022-12-27'), 2.234),
      new Measure(moment('2023-06-27'), 3.021),
      new Measure(moment('2023-12-27'), 3.894),
      new Measure(moment('2024-06-27'), 4.153)
    ];

    const DATA_COUNT = 16;
    const labels = [];
    for (let i = 0; i < DATA_COUNT; i += .5) {
      labels.push(i.toString());
    }

    const skipped = (ctx: { p0: { skip: any; }; p1: { skip: any; }; }, value: string | number[]) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
    const down = (ctx: { p0: { parsed: { y: number; }; }; p1: { parsed: { y: number; }; }; }, value: string) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;

    const datapoints = this.measures.map(measure => measure.weigth);
    this.data = {
      labels: labels,
      datasets: [
        {
          label: 'Poids (Kg)',
          data: datapoints,
          fill: false,
          cubicInterpolationMode: 'monotone',
          tension: .4,
          segment: {
            borderColor: (ctx: any) => skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(192,75,75)'),
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

    this.chart.data.datasets[0].data.push(weight);
    this.chart.update();
    this.weight = 0;
  }

  deleteMeasure(measureToDelete: Measure) {
    this.measures.forEach(measure => {
      if (measure.date.isSame(measureToDelete.date)) {
        measure.weigth = null;
        this.chart.data.datasets[0].data = this.measures.map(measure => measure.weigth);
        this.chart.update();
        return;
      }
    });
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
            display: true,
            title: {
              display: true,
              text: 'Année'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Poids (Kg)'
            },
            suggestedMin: 0,
            suggestedMax: 6
          }
        }
      },
    };
    return config;
  }

}
