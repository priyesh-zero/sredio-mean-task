import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'integration', pathMatch: 'full' },
  {
    path: 'integration',
    loadChildren: () =>
      import('./features/integration/integration.module').then((m) => m.IntegrationModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
