import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { MeasureComponent } from './core/components/measure/measure.component';

// Pages
import { WeightMonitoringComponent } from './pages/weight-monitoring/weight-monitoring.component';

@NgModule({
  declarations: [
    AppComponent,

    // Components
    MeasureComponent,

    // Pages
    WeightMonitoringComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
