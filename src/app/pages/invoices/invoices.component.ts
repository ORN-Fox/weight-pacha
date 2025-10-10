import { AfterViewInit, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Chart from 'chart.js/auto';
import flatpickr from 'flatpickr';
import moment from 'moment';

import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { IChartDataSetPoint } from 'src/app/core/interfaces/IChartDataSetPoint';
import { IInputElementWithFlatpickr } from 'src/app/core/interfaces/IInputElementWithFlatpickr';
import { ITableHeader } from 'src/app/core/interfaces/ITableHeader';

import { ISerializedInvoice, Invoice } from 'src/app/core/models/invoice/invoice.model';

interface IInvoiceChartDataSetPoint extends IChartDataSetPoint {
  x: number;
  y: number;
}

export interface ITotalInvoicedPerYear {
  year: number,
  totalAmount: number
}

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss',
  standalone: false
})
export class InvoicesComponent implements AfterViewInit {

  APP_STORAGE_KEY: string = 'weight-pacha-invoices';

  chart: any;
  data: any;

  tableHeaders: ITableHeader[];
  invoices: Invoice[];

  page: number;
  itemsPerPage: number;

  totalInvoicedPerYears: ITotalInvoicedPerYear[];

  dateFormat: string;
  displaySignPosition: string;

  constructor(
    private localStorageService: LocalStorageService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private serializerService: SerializerService,
    private settingsService: SettingsService
  ) {
    this.dateFormat = this.translateService.instant('commons.dateFormats.date');
    this.displaySignPosition = this.translateService.currentLang == 'en-US' ? 'left' : 'right';

    this.setupTableHeaders();
    this.loadInvoices();

    this.settingsService.settings$.subscribe(() => {
      this.updateFlatpickrLocales();
      this.updateChartLocale();
    });
  }

  ngAfterViewInit() {
    this.chart = new Chart(
      document.getElementById('totalInvoicedPerYearsChart') as HTMLCanvasElement,
      this.getChartConfig()
    );
  }

  private setupTableHeaders() {
    this.tableHeaders = [
      { title: 'date', align: 'center', width: '12%' },
      { title: 'amount', align: 'center', width: '15%' },
      { title: 'description', align: 'left', width: '' },
      { title: 'actions', align: 'center', width: '15%' }
    ];
  }

  addInvoice() {
    let invoice = new Invoice();
    invoice.editMode = true;
    this.invoices.push(invoice);

    this.initDatePickers(invoice);
  }

  updateInvoice(invoice: Invoice) {
    invoice.editMode = !invoice.editMode;
    this.initDatePickers(invoice);
  }

  saveChanges(invoice: Invoice) {
    invoice.editMode = false;
    invoice.updatedAt = moment();
    this.saveInvoices();

    this.computeTotalInvoicedPerYears();
    this.updateChart();
  }

  deleteInvoice(id: string) {
    this.toastService.showConfirm().then((result: { isConfirmed: boolean; }) => {
      if (result.isConfirmed) {
        this.invoices = this.invoices.filter(invoice => invoice.id != id);
        this.saveInvoices();

        this.computeTotalInvoicedPerYears();
        this.updateChart();
      }
    });
  }

  private initDatePickers(invoice: Invoice) {
    setTimeout(() => {
      flatpickr(`#invoiceBillingDateInput_${invoice.id}`, {
        altInput: true,
        altFormat: this.translateService.instant('commons.dateFormats.flatpickr.date'),
        defaultDate: invoice.billingDate?.toDate(),
        onChange: (selectedDates: Date[]) => {
          invoice.billingDate = moment(selectedDates[0]);

          this.updateChart();
        }
      });
    }, 100);
  }

  private computeTotalInvoicedPerYears() {
    let invoiceYears: ITotalInvoicedPerYear[] = [];
    let indexYear = -1;
    this.invoices.forEach(invoice => {
      let targetYear = invoice.billingDate.year();

      if (invoiceYears.filter(invoiceYear => invoiceYear.year == targetYear).length == 0) {
        const newInvoiceYear = { year: targetYear, totalAmount: invoice.amount };
        invoiceYears.push(newInvoiceYear);
        indexYear++;
      } else {
        invoiceYears[indexYear].totalAmount += invoice.amount;
      }
    });

    this.totalInvoicedPerYears = invoiceYears;
  }

  private computeYearsLabelFromTotalInvoicedPerYears() {
    return this.totalInvoicedPerYears.map(totalInvoicedPerYear => totalInvoicedPerYear.year);
  }

  private sortInvoicesByBillingDate(invoices: Invoice[]) {
    return invoices.sort((firstInvoice, secondInvoice) => firstInvoice.billingDate.isAfter(secondInvoice.billingDate, 'day') ? 1 : -1);
  }

  private loadInvoices() {
    this.invoices = [];

    if (this.localStorageService.isItemExist(this.APP_STORAGE_KEY)) {
      let invoices: Invoice[] = [];
      const invoicesJSON = this.localStorageService.getItem(this.APP_STORAGE_KEY);

      invoicesJSON.invoices.forEach((invoiceJSON: ISerializedInvoice) => {
        let invoice = new Invoice();
        invoice.deserilizeFromSave(invoiceJSON);
        invoices.push(invoice);
      });

      this.invoices = this.sortInvoicesByBillingDate(invoices);
    } else {
      this.localStorageService.setItem(this.APP_STORAGE_KEY, { invoices: this.invoices });
    }

    this.computeTotalInvoicedPerYears();
    this.initChartData();
  }

  private saveInvoices() {
    this.invoices = this.sortInvoicesByBillingDate(this.invoices);
    const serializedInvoices = this.serializerService.serializeList(this.invoices);
    this.localStorageService.setItem(this.APP_STORAGE_KEY, { invoices: serializedInvoices });
  }
  
  private updateFlatpickrLocales() {
    const datePickersId = this.invoices.map((invoice) => `#invoiceBillingDateInput_${invoice.id}`);

    datePickersId.forEach(inputId => {
      const input = document.querySelector(inputId) as IInputElementWithFlatpickr;
      if (input?._flatpickr) {
        input._flatpickr.set('altFormat', this.translateService.instant('commons.dateFormats.flatpickr.date'));
        input._flatpickr.set('locale', this.settingsService.currentSettings.locale);
        input._flatpickr.redraw();
      }
    });
  }

  //#region Chart related
  
  private initChartData() {
    let data = [];
    let years: number[] = [];
    
    if (this.invoices.length > 0) {
      data = this.computeDataPoints();
      years = this.computeYearsLabelFromTotalInvoicedPerYears();
    }

    this.data = {
      labels: years,
      datasets: [
        {
          label: this.translateService.instant('pages.invoices.title'),
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1
        }
      ]
    };
  }

  private computeDataPoints(): any[] {
    let dataPoints: IInvoiceChartDataSetPoint[] = [];

    this.totalInvoicedPerYears.forEach(totalInvoicedPerYear => {
      const dataPoint = {
        x: totalInvoicedPerYear.year,
        y: totalInvoicedPerYear.totalAmount
      }
      dataPoints.push(dataPoint); 
    });

    return dataPoints;
  };

  private computeTotalInvoicesAmountTooltipLabel(totalAmount: number | bigint | null = 0) {
    return `${this.translateService.instant('pages.invoices.totalAmount')} : ${totalAmount} ${this.translateService.instant('commons.moneySymbol')}`;
  }

  private getChartConfig(): any {
    const config = {
      type: 'bar',
      data: this.data,
      locale: this.translateService.currentLang,
      options: {
        scales: {
          y: {
            title: {
              display: true,
              text: this.translateService.instant('pages.invoices.totalAmount'),
              beginAtZero: true
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: { dataset: { label: string; }; parsed: { y: number | bigint | null; }; }) => this.computeTotalInvoicesAmountTooltipLabel(context.parsed.y)
            }
          }
        }
      }
    };
    return config;
  }

  private updateChart() {
    this.chart.data.labels = this.computeYearsLabelFromTotalInvoicedPerYears();
    this.chart.data.datasets[0].data = this.computeDataPoints();
    this.chart.update();
  }

  private updateChartLocale() {
    if (this.chart) {
      this.chart.options.locale = this.translateService.currentLang;

      this.chart.data.datasets[0].label = this.translateService.instant('pages.invoices.title');
      this.chart.options.scales.y.title.text = this.translateService.instant('pages.invoices.totalAmount');

      this.chart.options.plugins.tooltip = {
        callbacks: {
          label: (context: { dataset: { label: string; }; parsed: { y: number | bigint | null; }; }) => this.computeTotalInvoicesAmountTooltipLabel(context.parsed.y)
        }
      };

      this.chart.update();
    }
  }

  //#endregion

}
