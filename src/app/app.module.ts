import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { MeasureComponent } from './core/components/measure/measure.component';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { InformationsComponent } from './pages/informations/informations.component';
import { NotesComponent } from './pages/notes/notes.component';
import { VaccinesComponent } from './pages/vaccines/vaccines.component';
import { WeightMonitoringComponent } from './pages/weight-monitoring/weight-monitoring.component';
import { SettingsComponent } from './pages/settings/settings.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function appInitializerFactory(translate: TranslateService) {
  return () => {
    translate.setDefaultLang('en-US');
    return translate.use('en-US').toPromise();
  };
}

@NgModule({ 
    declarations: [
        AppComponent,
        // Components
        MeasureComponent,
        // Pages
        HomeComponent,
        InformationsComponent,
        NotesComponent,
        VaccinesComponent,
        WeightMonitoringComponent,
        SettingsComponent
    ],
    bootstrap: [AppComponent], 
    imports: [
        BrowserModule,
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
        {
            provide: APP_INITIALIZER,
            useFactory: appInitializerFactory,
            deps: [TranslateService],
            multi: true
        }
    ]
})
export class AppModule { }
