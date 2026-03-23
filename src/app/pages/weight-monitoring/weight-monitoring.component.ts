import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { catchError, tap } from 'rxjs/operators';
import { Subscription, throwError } from 'rxjs';
import { cloneDeep } from 'lodash';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-moment';
import flatpickr from 'flatpickr';
import { Instance } from 'flatpickr/dist/types/instance';
import moment from 'moment';

import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { DateService } from 'src/app/core/services/date/date.service';
import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { UnitType } from 'src/app/core/enums/unit-type/unit-type.enum';

import { IChartDataSetPoint } from 'src/app/core/interfaces/IChartDataSetPoint';
import { IInputElementWithFlatpickr } from 'src/app/core/interfaces/IInputElementWithFlatpickr';

import { ISerializedMeasure, Measure } from 'src/app/core/models/measure/measure.model';
import { PetRecord } from 'src/app/core/models/pet-record/pet-record.model';

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
export class WeightMonitoringComponent implements AfterViewInit, OnDestroy {

  readonly apiService = inject(ApiService);
  readonly authService = inject(AuthService);
  readonly formBuilder = inject(FormBuilder);
  readonly localStorageService = inject(LocalStorageService);
  readonly toastService = inject(ToastService);
  readonly translateService = inject(TranslateService);
  readonly serializerService = inject(SerializerService);
  readonly settingsService = inject(SettingsService);

  loadMeasuresSub: Subscription;
  addMeasureSub: Subscription;
  updateMeasureSub: Subscription;
  deleteMeasureSub: Subscription;

  chart: any;

  sourceMeasures: Measure[] = [];
  measures: Measure[] = [];
  healthWeight: number = 1;
  healthWeightOffset: number = .5;

  weightUnits: number[] = [UnitType.KiloGram, UnitType.Pounds, UnitType.Gram, UnitType.Ounce];
  weightUnitsLabels: string[] = ['Kg', 'Lbs', 'g', 'oz'];
  selectedWeightUnit: number;

  measureForm: FormGroup;
  
  isHealthWeightSaving: boolean = false;
  isLoading: boolean = false;
  isSubmitted: boolean = false;

  rangeDateInputInstance: Instance;

  constructor() {
    this.settingsService.settings$?.subscribe(() => {
      this.updateFlatpickrLocales();
      this.updateChartLocale();
    });

    this.authService.selectedPetRecord$?.subscribe((selectedPetRecord: PetRecord) => {
      this.healthWeight = selectedPetRecord.healthWeight ?? 1;
      this.selectedWeightUnit = selectedPetRecord.weightUnit ?? UnitType.KiloGram;
    });

    Chart.register(annotationPlugin);

    this.loadMeasures();
    this.initForm();
  }

  ngAfterViewInit() {
    this.initChart();
    
    this.rangeDateInputInstance = flatpickr('#rangeDatesInput', {
      mode: "range",
      altInput: true,
      altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
      defaultDate: this.getRangeDates(),
      position: 'below',
      onChange: (selectedDates: Date[]) => {
        this.onChangeRangeDates(selectedDates);
      }
    }) as Instance;

    // No date update in onChange here because petForm change event interfer with date format rendering
    flatpickr('#measureDateInput', {
      enableTime: true,
      altInput: true,
      altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
      position: 'below'
    });
  }

  ngOnDestroy() {
    this.addMeasureSub?.unsubscribe();
    this.deleteMeasureSub?.unsubscribe();
    this.loadMeasuresSub?.unsubscribe();
    this.updateMeasureSub?.unsubscribe();
  }

  onChangeRangeDates(selectedDates: Date[]) {
    if (selectedDates.length > 1) {
      this.measures = this.sourceMeasures.filter((measure) => measure.date.isBetween(selectedDates[0], selectedDates[1], 'day', '[]'));
      this.updateChart();
    }
  }

  getMeasureUnitLabel(): string {
    switch(this.selectedWeightUnit) {
      default:
      case UnitType.KiloGram:
        return "Kg";
      case UnitType.Pounds:
        return "Lbs";
      case UnitType.Gram:
        return "g";
      case UnitType.Ounce:
        return "oz";
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
    this.isLoading = true;
    this.isSubmitted = true;

    if (this.measureForm.invalid) {
      setTimeout(() => this.isLoading = false, 500);
      return
    }

    let measure = new Measure();
    Object.assign(measure, this.measureForm.value);
    measure.date = moment(measure.date);
    measure.petRecordId = this.authService.selectedPetRecordValue.id;

    const serializedMeasure = measure.serializeForSave();
    this.addMeasureSub = this.apiService.post<ISerializedMeasure>(`/pet-record/${this.authService.selectedPetRecordValue.id}/measure`, serializedMeasure).pipe(
      tap(async (serializedMeasure: ISerializedMeasure) => {
        this.isLoading = false;
        this.isSubmitted = false;
        this.initForm();

        measure.deserilizeFromSave(serializedMeasure);
        this.sourceMeasures.push(measure);
        this.sourceMeasures = this.sortMeasuresByDate(this.sourceMeasures);
        this.measures = this.filterMeasuresInRangeDates();

        let dataPoint: IWeightChartDataSetPoint = {
          x: measure.date,
          y: measure.weight
        };

        this.chart.data.datasets[0].data.push(dataPoint);
        this.updateRangeDates();
      }),
      catchError((error) => {
        this.isLoading = false;
        this.initForm();

        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.create'));
        console.error('Unable to create measure', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

  onUpdateMeasure(event: { measure: Measure }) {
    const serializedMeasure = event.measure.serializeForSave();
    this.updateMeasureSub = this.apiService.put<ISerializedMeasure>(`/pet-record/${this.authService.selectedPetRecordValue.id}/measure/${ serializedMeasure.id }`, serializedMeasure).pipe(
      tap(async (serializedMeasure: ISerializedMeasure) => {
        let updatedMeasure = new Measure();
        updatedMeasure.deserilizeFromSave(serializedMeasure);

        const index = this.sourceMeasures.findIndex(measure => measure.id === updatedMeasure.id);
        if (index !== -1) {
          this.sourceMeasures[index] = updatedMeasure;
          this.sourceMeasures = this.sortMeasuresByDate(this.sourceMeasures);
        }

        this.measures = this.filterMeasuresInRangeDates();
        this.updateRangeDates();
      }),
      catchError((error) => {
        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.update'));
        console.error('Unable to update measure', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

  onDeleteMeasure(event: { measure: Measure }) {
    this.toastService.showConfirm().then((result: { isConfirmed: boolean; }) => {
      if (result.isConfirmed) {
        this.deleteMeasureSub = this.apiService.delete(`/pet-record/${this.authService.selectedPetRecordValue.id}/measure/${ event.measure.id }`).pipe(
          tap(async () => {
            this.sourceMeasures = this.sourceMeasures.filter(measure => !measure.date.isSame(event.measure.date, 'day'));
            this.measures = this.filterMeasuresInRangeDates();

            this.chart.data.datasets[0].data = this.chart.data.datasets[0].data.filter((dataPoint: IWeightChartDataSetPoint) => !moment(dataPoint.x).isSame(event.measure.date, 'day'));
            this.updateRangeDates();
          }),
          catchError((error) => {
            this.toastService.showToast('error', this.translateService.instant('commons.toast.error.delete'));
            console.error('Unable to delete measure', error);
            return throwError(() => error);
          }),
        ).subscribe();
      }
    });
  }

  updateWeightUnit(selectedWeightUnit: number) {
    let updatedSelectedPetRecord = cloneDeep(this.authService.selectedPetRecordValue);
    updatedSelectedPetRecord.weightUnit = selectedWeightUnit;
    this.authService.selectedPetRecordValue = updatedSelectedPetRecord;

    const healthWeightLabel = this.chart.options.plugins.annotation.annotations.label;
    healthWeightLabel.content = this.computeWeightHealthLabel();
    this.updateChart();
  }

  updateChartOnHealthWeightChange() {
    const healthWeightLine = this.chart.options.plugins.annotation.annotations.healthWeightLine;
    healthWeightLine.yMin = this.healthWeight;
    healthWeightLine.yMax = this.healthWeight;

    const healthWeightZone = this.chart.options.plugins.annotation.annotations.healthWeightZone;
    healthWeightZone.yMin = this.healthWeight - this.healthWeightOffset;
    healthWeightZone.yMax = this.healthWeight + this.healthWeightOffset;

    const healthWeightLabel = this.chart.options.plugins.annotation.annotations.label;
    healthWeightLabel.content = this.computeWeightHealthLabel();

    this.updateChart();
  }

  saveHealthWeight() {
    this.isHealthWeightSaving = true;

    if (this.isInvalidWeight(this.healthWeight)) {
      setTimeout(() => this.isHealthWeightSaving = false, 500);
      return;
    }

    console.log('updateHealthWeight', this.healthWeight)

    let updatedSelectedPetRecord = cloneDeep(this.authService.selectedPetRecordValue);
    updatedSelectedPetRecord.healthWeight = this.healthWeight;
    this.authService.selectedPetRecordValue = updatedSelectedPetRecord;

    this.updateChartOnHealthWeightChange();

    this.isHealthWeightSaving = false;
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
    let measures: Measure[] = [];

    this.loadMeasuresSub = this.apiService.get<ISerializedMeasure[]>(`/pet-record/${ this.authService.selectedPetRecordValue.id }/measures`).pipe(
      tap(async (measuresJSON: ISerializedMeasure[]) => {
        measuresJSON.forEach((measureJSON) => {
          let measure = new Measure();
          measure.deserilizeFromSave(measureJSON);
          measures.push(measure);
        });

        this.sourceMeasures = measures;
        this.measures = cloneDeep(this.sourceMeasures);

        this.updateChart();
      }),
      catchError((error) => {        
        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.load'));
        console.error('Unable to load measures', error);
        return throwError(() => error);
      }),
    ).subscribe();
  }

  private filterMeasuresInRangeDates(): Measure[] {
    let rangeDates = this.getRangeDates();
    return this.sourceMeasures.filter((measure) => measure.date.isBetween(rangeDates[0], rangeDates[1], 'day', '[]'));
  }
  
  private sortMeasuresByDate(measures: Measure[]) {
    return measures.sort((firstMeasure, secondMeasure) => firstMeasure.date.isAfter(secondMeasure.date) ? 1 : -1);
  }

  private updateFlatpickrLocales() {
    if (this.rangeDateInputInstance) {
      this.rangeDateInputInstance.set('altFormat', this.translateService.instant('commons.dateFormats.flatpickr.date'));
      this.rangeDateInputInstance.set('locale', this.settingsService.currentSettings.locale);
      this.rangeDateInputInstance.redraw();
    }

    const dateInput = document.querySelector('#measureDateInput') as IInputElementWithFlatpickr;
    if (dateInput?._flatpickr) {
      dateInput._flatpickr.set('altFormat', this.translateService.instant('commons.dateFormats.flatpickr.dateTime'));
      dateInput._flatpickr.set('locale', this.settingsService.currentSettings.locale);
      dateInput._flatpickr.redraw();
    }
  }

  //#region Chart related

  private initChart() {
    this.chart = new Chart(
      document.getElementById('weightChart') as HTMLCanvasElement,
      this.getChartConfig()
    );
  }

  private getChartData(): any {
    return {
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
            borderColor: (ctx: any) => this.exceededValue(ctx, 'rgb(192,75,75)')
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

  private exceededValue = (
    ctx: { p0: { parsed: { y: number } }, p1: { parsed: { y: number } } },
    value: string
  ): string | undefined => {
    const minHealthWeight = this.healthWeight - this.healthWeightOffset;
    const maxHealthWeight = this.healthWeight + this.healthWeightOffset;

    const p0 = ctx.p0.parsed.y;
    const p1 = ctx.p1.parsed.y;
    const diff = p1 - p0;

    if (diff > 0 && p1 > maxHealthWeight) return value;
    if (diff < 0 && (p1 < minHealthWeight)) return value;
    if (diff === 0 && p1 > maxHealthWeight) return value;

    return;
  };

  private getSuggestedMin(): number {
    let chartData = this.getChartData();
    let min = 999999;

    if (chartData) {
      let suggestedMinGap = .25;
      chartData.datasets[0].data.forEach((dataPoint: IWeightChartDataSetPoint) => {
        if (dataPoint.y < min) {
          min = dataPoint.y;
        }
      });
      min -= suggestedMinGap;
    }
    return min;
  }

  private getSuggestedMax(): number {
    let chartData = this.getChartData();
    let max = 0;

    if (chartData) {
      let suggestedMaxGap = .25;
      chartData.datasets[0].data.forEach((dataPoint: IWeightChartDataSetPoint) => {
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
      data: this.getChartData(),
      locale: this.translateService.currentLang,
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              displayFormats: {
                'day': this.translateService.instant('commons.dateFormats.date'),
              },
              tooltipFormat: 'L LT'
            },
            title: {
              display: true,
              text: this.translateService.instant('commons.fields.date')
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
    this.chart.data.datasets[0].segment.borderColor = (ctx: any) => this.exceededValue(ctx, 'rgb(192,75,75)');

    this.chart.options.scales.y.suggestedMin = this.getSuggestedMin();
    this.chart.options.scales.y.suggestedMax = this.getSuggestedMax();
    
    this.chart.update();
  }

  private updateChartLocale() {
    if (this.chart) {
      this.chart.options.locale = this.translateService.currentLang;
      
      this.chart.options.scales.x.title.text = this.translateService.instant('pages.weight.date');
      this.chart.options.scales.y.title.text = this.translateService.instant('pages.weight.weight');
      
      this.chart.options.scales.x.time.tooltipFormat = this.translateService.instant('commons.dateFormats.dateTime');
      this.chart.options.scales.x.time.displayFormats.day = this.translateService.instant('commons.dateFormats.date');

      this.chart.data.datasets[0].label = this.translateService.instant('pages.weight.weight');
      
      this.chart.options.plugins.annotation.annotations.label.content = this.computeWeightHealthLabel();
      
      this.chart.update();
    }
  }

  //#endregion

}

