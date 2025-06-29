import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColDef, ModuleRegistry } from 'ag-grid-community';
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule
} from "ag-grid-enterprise";
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { IntegrationService } from '../services/integration.service';
import { flattenObject, generateFlatColumnDefs } from '../utils/data-flattener';
import { MatDialog } from '@angular/material/dialog';
import { getCustomFilters } from '../utils/custom-filter';
import { FilterDrawerService } from '../services/filter-drawer.service';
import { FacetedFilterService } from '../services/faceted-filter.service';
import { ICustomFilter } from '../models/integration.model';
import { CustomFilterDialog } from '../components/custom-filter-dialog/custom-filter-dialog.component';

ModuleRegistry.registerModules([
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule
]);

@Component({
  selector: 'app-result',
  standalone: false,
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {

  integrations: string[] = ['GitHub'];
  entities: string[] = ['Orgs', 'Repos', 'Users', 'Commits', 'Pulls', 'Issues'];

  selectedIntegration = 'GitHub';
  selectedEntity = 'Orgs';
  searchText = '';

  columnDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    minWidth: 250,
    flex: 1
  };

  rowData: any[] = [];
  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;
  totalPages = 0;

  customFilters: ICustomFilter[] = [];
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private dialog: MatDialog,
    private integrationSvc: IntegrationService,
    private drawerSvc: FilterDrawerService,
    private facetedFilterService: FacetedFilterService
  ) {
    this.facetedFilterService.filters$.subscribe((updatedFilters) => {
      console.log('Apply these filters to table', updatedFilters);
    });
  }

  ngOnInit(): void {
    this.fetchCollectionData();
    this.searchSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((text) => {
        this.searchText = text;
        this.currentPage = 1;
        this.fetchCollectionData();
      });
    this.customFilters = getCustomFilters();
  }

  onIntegrationChange(): void {
    this.currentPage = 1;
    this.fetchCollectionData();
  }

  onEntityChange(): void {
    this.currentPage = 1;
    this.fetchCollectionData();

  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchText = '';
    this.searchSubject.next('');
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchCollectionData();
  }

  fetchCollectionData(): void {
    this.integrationSvc
      .getCollectionData(this.selectedEntity, this.currentPage, this.pageSize, this.searchText)
      .subscribe({
        next: (res) => {
          // Flatten each row of the response
          const flattenedData = res.data.map(item => flattenObject(item));
          // Generate columns using flattened data
          this.columnDefs = generateFlatColumnDefs(flattenedData);
          console.log('Generated column definitions:', this.columnDefs);
          // Assign the flattened data to rowData
          this.rowData = flattenedData;
          this.totalRecords = res.total;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        },
        error: (err) => {
          console.error(`Failed to fetch data for ${this.selectedEntity}`, err);
          this.rowData = [];
          this.totalRecords = 0;
          this.totalPages = 0;
        }
      });
  }

  openFilterPopup() {
    const dialogRef = this.dialog.open(CustomFilterDialog, {
      width: '500px',
      disableClose: true,
      autoFocus: false,
      data: { columnDefs: this.columnDefs }
    });

    dialogRef.afterClosed().subscribe((result: ICustomFilter[]) => {
      if (result !== undefined && result !== null) {
        this.customFilters = result;
      }
    });
  }

  onFilterValueChange(updatedFilters: ICustomFilter[]) {
    console.log('-----dddd', updatedFilters)
    // Call your API here or debounce it
  }

  openFilterDrawer(): void {
    const filters = {
      "filter_key": ["org", "user", "repo"],
      "filter_data": {
        "org": ["openai", "google", "microsoft", "facebook", "amazon"],
        "user": ["alice", "bob", "charlie", "diana", "eve"],
        "repo": ["chatgpt-ui", "tensorflow", "vscode", "react", "angular"]
      }
    }
    // Set filters for the faceted filter component
    this.facetedFilterService.setFilters(filters);

    // Open the drawer with optional payload if needed
    this.drawerSvc.openDrawer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
