import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WeightMonitoringComponent } from './pages/weight-monitoring/weight-monitoring.component';

const routes: Routes = [
  { path: 'weigth', component: WeightMonitoringComponent },
  { path: '', redirectTo: '/weigth', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
