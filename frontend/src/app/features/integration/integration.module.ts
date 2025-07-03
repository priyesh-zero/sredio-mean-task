import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AgGridModule } from 'ag-grid-angular';
import { ModuleRegistry } from 'ag-grid-community';
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  MasterDetailModule,
  RowGroupingModule
} from 'ag-grid-enterprise';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
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
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { FindUserComponent } from './find-user/find-user.component';
import { IntegrationToolbarComponent } from './components/integration-toolbar/integration-toolbar.component';
import { DetailRendererComponent } from './components/detail-renderer/detail-renderer.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { LoaderInterceptor } from './interceptors/loader.interceptor';
import { LoaderComponent } from './components/loader/loader.component';

// Register AG Grid modules
ModuleRegistry.registerModules([
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  MasterDetailModule,
  RowGroupingModule
]);

@NgModule({
  declarations: [
    IntegrationComponent,
    IntegrationHeaderComponent,
    IntegrationToolbarComponent,
    IntegrationLandingComponent,
    ResultComponent,
    SearchResultComponent,
    TimesheetComponent,
    FindUserComponent,
    PageNotFoundComponent,
    SearchBoxComponent,
    PaginationComponent,
    CustomFilterDialog,
    CustomFilterList,
    FacetedFilterComponent,
    DetailRendererComponent,
    LoaderComponent
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
    MatMenuModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatCheckboxModule,
    MatListModule,
    MatTabsModule,
    MatChipsModule,
    MatSidenavModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {
        appearance: 'outline',
        // subscriptSizing: 'dynamic',
      }
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    }
  ],
  exports: [DetailRendererComponent]
})
export class IntegrationModule { }
