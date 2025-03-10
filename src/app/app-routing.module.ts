import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardPerComponent } from './page/dashboard-per/dashboard-per.component';
import { DashboardDrcComponent } from './page/dashboard-drc/dashboard-drc.component';
import { DashboardDrhComponent } from './page/dashboard-drh/dashboard-drh.component';
import { DashboardDfcComponent } from './page/dashboard-dfc/dashboard-dfc.component';

const routes: Routes = [
  { path: 'dashboard-per', component: DashboardPerComponent }, // Pas de slash ici
  { path: 'dashboard-drc', component: DashboardDrcComponent }, // Pas de slash ici
  { path: 'dashboard-drh', component: DashboardDrhComponent }, // Pas de slash ici
  { path: 'dashboard-dfc', component: DashboardDfcComponent }, // Pas de slash ici
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
imports: [RouterModule.forRoot(routes, { useHash: true })]
