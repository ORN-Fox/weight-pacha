import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { InformationsComponent } from './pages/informations/informations.component';
import { NotesComponent } from './pages/notes/notes.component';
import { VaccinesComponent } from './pages/vaccines/vaccines.component';
import { WeightMonitoringComponent } from './pages/weight-monitoring/weight-monitoring.component';
import { WormablesComponent } from './pages/wormables/wormables.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'informations', component: InformationsComponent },
  { path: 'notes', component: NotesComponent },
  { path: 'vaccines', component: VaccinesComponent },
  { path: 'weight', component: WeightMonitoringComponent },
  { path: 'wormables', component: WormablesComponent },
  { path: 'invoices', component: InvoicesComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
