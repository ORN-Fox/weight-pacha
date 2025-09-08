import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { InformationsComponent } from './pages/informations/informations.component';
import { NotesComponent } from './pages/notes/notes.component';
import { VaccinesComponent } from './pages/vaccines/vaccines.component';
import { WeightMonitoringComponent } from './pages/weight-monitoring/weight-monitoring.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'informations', component: InformationsComponent },
  { path: 'notes', component: NotesComponent },
  { path: 'vaccines', component: VaccinesComponent },
  { path: 'weigth', component: WeightMonitoringComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
