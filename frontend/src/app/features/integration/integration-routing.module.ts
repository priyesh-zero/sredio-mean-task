import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntegrationComponent } from './integration.component';
import { ResultComponent } from './result/result.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { IntegrationAuthGuard } from './services/integration-auth.guard';
import { PageNotFoundComponent } from './error-pages/page-not-found/page-not-found.component';
import { IntegrationLandingComponent } from './integration-landing/integration-landing.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { FindUserComponent } from './find-user/find-user.component';

const routes: Routes = [
  {
    path: '',
    component: IntegrationComponent,
    children: [
      { path: '', component: IntegrationLandingComponent },
      { path: 'result', component: ResultComponent, canActivate: [IntegrationAuthGuard] },
      { path: 'search-result', component: SearchResultComponent, canActivate: [IntegrationAuthGuard] },
      { path: 'timesheet', component: TimesheetComponent, canActivate: [IntegrationAuthGuard] },
      { path: 'find-user', component: FindUserComponent, canActivate: [IntegrationAuthGuard] },
      { path: '**', component: PageNotFoundComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IntegrationRoutingModule { }
