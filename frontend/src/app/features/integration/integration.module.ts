import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';

import { IntegrationRoutingModule } from './integration-routing.module';
import { IntegrationComponent } from './integration.component';
import { ResultComponent } from './result/result.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { IntegrationHeaderComponent } from './components/integration-header/integration-header.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FacetedFilterComponent } from './components/faceted-filter/faceted-filter.component';
import { CustomFilterDialog } from './components/custom-filter-dialog/custom-filter-dialog.component';
import { CustomFilterList } from './components/custom-filter-list/custom-filter-list.component';
import { PageNotFoundComponent } from './error-pages/page-not-found/page-not-found.component';
import { IntegrationLandingComponent } from './integration-landing/integration-landing.component';

@NgModule({
  declarations: [
    IntegrationComponent,
    IntegrationHeaderComponent,
    IntegrationLandingComponent,
    ResultComponent,
    SearchResultComponent,
    PageNotFoundComponent,
    CustomFilterDialog,
    CustomFilterList,
    FacetedFilterComponent
  ],
  imports: [
    CommonModule,
    AgGridModule,
    IntegrationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatCheckboxModule,
    MatListModule,
    MatChipsModule,
    MatSidenavModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class IntegrationModule { }
