import { NgModule } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { MeasureComponent } from './core/components/measure/measure.component';
import { PageTitleComponent } from './core/components/page-title/page-title.component';
import { PaginationComponent } from './core/components/pagination/pagination.component';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { InformationsComponent } from './pages/informations/informations.component';
import { NotesComponent } from './pages/notes/notes.component';
import { VaccinesComponent } from './pages/vaccines/vaccines.component';
import { WeightMonitoringComponent } from './pages/weight-monitoring/weight-monitoring.component';
import { WormablesComponent } from './pages/wormables/wormables.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { SettingsComponent } from './pages/settings/settings.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({ 
    declarations: [
        AppComponent,
        // Components
        MeasureComponent,
        PageTitleComponent,
        PaginationComponent,
        // Pages
        HomeComponent,
        InformationsComponent,
        NotesComponent,
        VaccinesComponent,
        WeightMonitoringComponent,
        WormablesComponent,
        InvoicesComponent,
        SettingsComponent
    ],
    bootstrap: [AppComponent], 
    imports: [
        BrowserModule,
        NgxPaginationModule,
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
        provideHttpClient(withInterceptorsFromDi())
    ]
})
export class AppModule { }
