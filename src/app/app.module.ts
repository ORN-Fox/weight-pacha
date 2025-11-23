import { NgModule } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { makeEnvironmentProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';
import { FullCalendarModule } from '@fullcalendar/angular';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Services
import { SettingsService } from './core/services/settings/settings.service';

// Components
import { NoVaccineRageAlertComponent } from './core/components/no-vaccine-rage-alert/no-vaccine-rage-alert.component';
import { MeasureComponent } from './core/components/measure/measure.component';
import { PageTitleComponent } from './core/components/page-title/page-title.component';
import { PaginationComponent } from './core/components/pagination/pagination.component';

// Pages
import { CalendarComponent } from './pages/calendar/calendar.component';
import { HomeComponent } from './pages/home/home.component';
import { InformationsComponent } from './pages/informations/informations.component';
import { NotesComponent } from './pages/notes/notes.component';
import { VaccinesComponent } from './pages/vaccines/vaccines.component';
import { WeightMonitoringComponent } from './pages/weight-monitoring/weight-monitoring.component';
import { WormablesComponent } from './pages/wormables/wormables.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { SettingsComponent } from './pages/settings/settings.component';

// Dialogs
import { CalendarEventDialogComponent } from './pages/calendar/calendar-event-dialog/calendar-event-dialog.component';
import { InvoiceDialogComponent } from './pages/invoices/invoice-dialog/invoice-dialog.component';
import { VaccineDialogComponent } from './pages/vaccines/vaccine-dialog/vaccine-dialog.component';
import { WormableDialogComponent } from './pages/wormables/wormable-dialog/wormable-dialog.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

function initializeApp(translate: TranslateService, settings: SettingsService): Promise<void> {
    const locale = settings.currentSettings.locale || 'en-US';
    translate.setDefaultLang(locale);
    return translate.use(locale).toPromise();
}

@NgModule({ 
    declarations: [
        AppComponent,

        // Components
        NoVaccineRageAlertComponent,
        MeasureComponent,
        PageTitleComponent,
        PaginationComponent,

        // Pages
        CalendarComponent,
        HomeComponent,
        InformationsComponent,
        NotesComponent,
        VaccinesComponent,
        WeightMonitoringComponent,
        WormablesComponent,
        InvoicesComponent,
        SettingsComponent,
        
        // Dialogs
        CalendarEventDialogComponent,
        InvoiceDialogComponent,
        VaccineDialogComponent,
        WormableDialogComponent
    ],
    bootstrap: [AppComponent], 
    imports: [
        BrowserModule,
        MatDialogModule,
        NgxPaginationModule,
        FullCalendarModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        AppRoutingModule
    ],
    providers: [
        provideHttpClient(withInterceptorsFromDi()),
        makeEnvironmentProviders([
            {
                provide: TranslateService,
                useClass: TranslateService
            },
            {
                provide: 'INITIALIZE_APP',
                useFactory: (translate: TranslateService, settings: SettingsService) => {
                    return initializeApp(translate, settings);
                },
                deps: [TranslateService, SettingsService]
            }
        ])
    ]
})
export class AppModule { }
