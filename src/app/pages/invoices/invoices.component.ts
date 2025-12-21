import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';
import { catchError, Subscription, tap, throwError } from 'rxjs';
import Chart from 'chart.js/auto';

import { ApiService } from 'src/app/core/services/api/api.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { LocalStorageService } from 'src/app/core/services/local-storage/local-storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SerializerService } from 'src/app/core/services/serializer/serializer.service';
import { SettingsService } from 'src/app/core/services/settings/settings.service';

import { DialogAction } from 'src/app/core/enums/dialog-action/dialog.action.enum';

import { IChartDataSetPoint } from 'src/app/core/interfaces/IChartDataSetPoint';
import { ITableHeader } from 'src/app/core/interfaces/ITableHeader';

import { ISerializedInvoice, Invoice } from 'src/app/core/models/invoice/invoice.model';

import { InvoiceDialogComponent, InvoiceDialogData } from './invoice-dialog/invoice-dialog.component';

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
export class InvoicesComponent implements AfterViewInit, OnDestroy {

  readonly dialog = inject(MatDialog);
  readonly apiService = inject(ApiService);
  readonly authService = inject(AuthService);
  readonly localStorageService = inject(LocalStorageService);
  readonly toastService = inject(ToastService);
  readonly translateService = inject(TranslateService);
  readonly serializerService = inject(SerializerService);
  readonly settingsService = inject(SettingsService);

  chart: any;

  tableHeaders: ITableHeader[];
  invoices: Invoice[];

  deleteInvoiceSub: Subscription;
  loadInvoicesSub: Subscription;

  page: number;
  itemsPerPage: number;

  totalInvoicedPerYears: ITotalInvoicedPerYear[];

  dateFormat: string;
  displaySignPosition: string;

  constructor() {
    this.setupTableHeaders();
    this.loadInvoices();

    this.settingsService.settings$.subscribe(() => {
      this.dateFormat = this.translateService.instant('commons.dateFormats.date');
      this.displaySignPosition = this.translateService.currentLang == 'en-US' ? 'left' : 'right';

      this.updateChartLocale();
    });
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() {
    this.deleteInvoiceSub?.unsubscribe();
    this.loadInvoicesSub?.unsubscribe();
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
    invoice.petRecordId = this.authService.selectedPetRecordValue.id;
    this.openInvoiceDialog(false, invoice);
  }

  updateInvoice(invoice: Invoice) {
    this.openInvoiceDialog(true, invoice);
  }

  deleteInvoice(id: string) {
    this.toastService.showConfirm().then((result: { isConfirmed: boolean; }) => {
      if (result.isConfirmed) {
        this.deleteInvoiceSub = this.apiService.delete(`/pet-record/${ this.authService.selectedPetRecordValue.id }/invoice/${ id }`).pipe(
          tap(() => this.loadInvoices()),
          catchError((error) => {
            this.toastService.showToast('error', this.translateService.instant('commons.toast.error.delete'));
            console.error('Unable to delete invoice', error);
            return throwError(() => error);
          })
        ).subscribe();
      }
    });
  }

  private computeTotalInvoicedPerYears() {
    let invoiceYears: ITotalInvoicedPerYear[] = [];
    let indexYear = -1;
    this.invoices.forEach(invoice => {
      let targetYear = invoice.billingDate.year();
      let amount = invoice.amount ?? 0;

      if (invoiceYears.filter(invoiceYear => invoiceYear.year == targetYear).length == 0) {
        const newInvoiceYear = { year: targetYear, totalAmount: amount };
        invoiceYears.push(newInvoiceYear);
        indexYear++;
      } else {
        invoiceYears[indexYear].totalAmount += amount;
      }
    });

    this.totalInvoicedPerYears = invoiceYears.reverse();
  }

  private computeYearsLabelFromTotalInvoicedPerYears() {
    return this.totalInvoicedPerYears.map(totalInvoicedPerYear => totalInvoicedPerYear.year);
  }

  private loadInvoices() {
    this.invoices = [];

    this.loadInvoicesSub = this.apiService.get<ISerializedInvoice[]>(`/pet-record/${ this.authService.selectedPetRecordValue.id }/invoices`).pipe(
      tap((serializedInvoices: ISerializedInvoice[]) => {
        let invoices: Invoice[] = [];
        serializedInvoices.forEach((serializedInvoice: ISerializedInvoice) => {
          let invoice = new Invoice();
          invoice.deserilizeFromSave(serializedInvoice);
          invoices.push(invoice);
        });
        this.invoices = invoices;

        this.computeTotalInvoicedPerYears();
        this.updateChart();
      }),
      catchError((error) => {
        this.toastService.showToast('error', this.translateService.instant('commons.toast.error.load'));
        console.error('Unable to load invoices', error);
        return throwError(() => error);
      })
    ).subscribe();
  }

  private openInvoiceDialog(editMode: boolean = false, invoice: Invoice) {
    const action = editMode ? DialogAction.UPDATE : DialogAction.ADD;
    const dialogRef = this.dialog.open(InvoiceDialogComponent, {
      data: { action: action, invoice: cloneDeep(invoice) },
      autoFocus: false,
      disableClose: true,
      width: '40rem'
    });

    dialogRef.afterClosed().subscribe((result: InvoiceDialogData) => {
      if (result) {
        this.loadInvoices();
      }
    });
  }

  //#region Chart related

  private initChart() {
    this.chart = new Chart(
      document.getElementById('totalInvoicedPerYearsChart') as HTMLCanvasElement,
      this.getChartConfig()
    );
  }
  
  private getChartData() {
    let data = [];
    let years: number[] = [];
    
    if (this.invoices.length > 0) {
      data = this.computeDataPoints();
      years = this.computeYearsLabelFromTotalInvoicedPerYears();
    }

    return {
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
      data: this.getChartData(),
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
