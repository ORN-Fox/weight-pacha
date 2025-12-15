import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ngxProtectedGuard, ngxPublicGuard } from 'ngx-auth';

import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AccountComponent } from './pages/account/account.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { InformationsComponent } from './pages/informations/informations.component';
import { NotesComponent } from './pages/notes/notes.component';
import { VaccinesComponent } from './pages/vaccines/vaccines.component';
import { WeightMonitoringComponent } from './pages/weight-monitoring/weight-monitoring.component';
import { WormablesComponent } from './pages/wormables/wormables.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [ngxPublicGuard] },
  { path: 'home', component: HomeComponent, canActivate: [ngxProtectedGuard] },
  { path: 'account', component: AccountComponent, canActivate: [ngxProtectedGuard] },
  { path: 'calendar', component: CalendarComponent, canActivate: [ngxProtectedGuard] },
  { path: 'informations', component: InformationsComponent, canActivate: [ngxProtectedGuard] },
  { path: 'notes', component: NotesComponent, canActivate: [ngxProtectedGuard] },
  { path: 'vaccines', component: VaccinesComponent, canActivate: [ngxProtectedGuard] },
  { path: 'weight', component: WeightMonitoringComponent, canActivate: [ngxProtectedGuard] },
  { path: 'wormables', component: WormablesComponent, canActivate: [ngxProtectedGuard] },
  { path: 'invoices', component: InvoicesComponent, canActivate: [ngxProtectedGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [ngxProtectedGuard] },
  { path: '**', redirectTo: '/login' }
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
