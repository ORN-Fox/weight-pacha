import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { WeightMonitoringComponent } from './pages/weight-monitoring/weight-monitoring.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'weigth', component: WeightMonitoringComponent },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
