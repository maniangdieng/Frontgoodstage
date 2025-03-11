import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardPerComponent } from './page/dashboard-per/dashboard-per.component';
import { DashboardDrcComponent } from './page/dashboard-drc/dashboard-drc.component';
import { DashboardDrhComponent } from './page/dashboard-drh/dashboard-drh.component';
import { DashboardDfcComponent } from './page/dashboard-dfc/dashboard-dfc.component';
import { CandidatureDetailsComponent } from './page/candidature-details/candidature-details.component';
import { CandidatureDetailsViewComponent } from './page/candidature-details-view/candidature-details-view.component';

const routes: Routes = [
  { path: 'dashboard-enseignant', component: DashboardPerComponent }, // Pas de slash ici
  { path: 'dashboard-drc', component: DashboardDrcComponent }, // Pas de slash ici
  { path: 'dashboard-drh', component: DashboardDrhComponent }, // Pas de slash ici
  { path: 'dashboard-dfc', component: DashboardDfcComponent }, // Pas de slash ici
  { path: 'candidature-details/:id', component: CandidatureDetailsComponent }, // Nouvelle route
  { path: 'candidature-details-view/:id', component: CandidatureDetailsViewComponent },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
imports: [RouterModule.forRoot(routes, { useHash: true })]
