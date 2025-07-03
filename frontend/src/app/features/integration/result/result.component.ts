import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { IntegrationService } from '../services/integration.service';
import { flattenObject, generateFlatColumnDefs } from '../utils/data-flattener';
import { MatDialog } from '@angular/material/dialog';
import { getCustomFilters, setCustomFilters } from '../utils/custom-filter';
import { FilterDrawerService } from '../services/filter-drawer.service';
import {
  FacetedFilterPayload,
  FacetedFilterService,
} from '../services/faceted-filter.service';
import { ICustomFilter } from '../models/integration.model';
import { CustomFilterDialog } from '../components/custom-filter-dialog/custom-filter-dialog.component';
import {
  ENTITIES,
  ENTITY,
  ENTITY_HIERARCHY,
  EntityOption,
  EntityType,
} from '../constants/entity.constants';
import {
  INTEGRATION,
  IntegrationOption,
  INTEGRATIONS,
  IntegrationType,
} from '../constants/integration.constants';
import { ENTITY_FIELDS } from '../constants/entity-fields';
import { DetailRendererComponent } from '../components/detail-renderer/detail-renderer.component';

@Component({
  selector: 'integration-result',
  standalone: false,
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit, OnDestroy {
  integrations: IntegrationOption[] = INTEGRATIONS;
  selectedIntegration: IntegrationType = INTEGRATION.GITHUB;
  facetSearchQuery: FacetedFilterPayload['selected'];

  entities: EntityOption[] = ENTITIES;
  selectedEntity: EntityType = ENTITY.REPOS;

  searchText = '';

  columnDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    minWidth: 250,
    flex: 1,
  };

  rowData: any[] = [];
  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;
  totalPages = 0;

  customFilters: ICustomFilter[] = [];
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  gridOptions: GridOptions = {
    masterDetail: true,
    components: {
      detailRenderer: DetailRendererComponent,
    },
    detailCellRenderer: 'detailRenderer',
  };


  constructor(
    private dialog: MatDialog,
    private integrationSvc: IntegrationService,
    private drawerSvc: FilterDrawerService,
    private facetedFilterService: FacetedFilterService,
  ) {
    this.facetedFilterService.filters$.subscribe((updatedFilters) => {
      this.facetSearchQuery = updatedFilters?.selected;
      this.fetchCollectionData(updatedFilters?.selected, this.customFilters);
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
    this.facetedFilterService.clearFilters();
    this.fetchCollectionData([]);
    setCustomFilters([]);
    this.customFilters = [];
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

  fetchCollectionData(
    facetSearchQuery = this.facetSearchQuery,
    customFilter = this.customFilters,
  ): void {
    this.integrationSvc
      .getCollectionData(
        this.selectedEntity,
        this.currentPage,
        this.pageSize,
        this.searchText,
        facetSearchQuery,
        customFilter,
      )
      .subscribe({
        next: (res) => {
          const flattenedData = res.data.map((item) => flattenObject(item, '', {}, res.relations));
          const generatedCols = generateFlatColumnDefs(flattenedData, res.relations);
          if (generatedCols.length > 0) {
            generatedCols[0] = {
              ...generatedCols[0],
              cellRenderer: 'agGroupCellRenderer', // This adds the expand icon
            };
          }
          this.columnDefs = generatedCols;
          // this.rowData = res.data; // Keep full unflattened data for detail view
          this.rowData = flattenedData;
          this.totalRecords = res.total;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        },
        error: (err) => {
          console.error(`Failed to fetch data for ${this.selectedEntity}`, err);
          this.rowData = [];
          this.totalRecords = 0;
          this.totalPages = 0;
        },
      });
  }

  openFilterPopup() {
    const dialogRef = this.dialog.open(CustomFilterDialog, {
      width: '500px',
      disableClose: true,
      autoFocus: false,
      data: { columnDefs: ENTITY_FIELDS[this.selectedEntity] },
    });

    dialogRef.afterClosed().subscribe((result: ICustomFilter[]) => {
      if (result !== undefined && result !== null) {
        const merged = result.map(newFilter => {
          const existing = this.customFilters.find(f => f.field === newFilter.field);
          return {
            ...newFilter,
            value: existing?.value ?? ''
          };
        });

        this.customFilters = merged;
        this.fetchCollectionData(this.facetSearchQuery, merged);
      }
    });

  }

  onFilterValueChange(updatedFilters: ICustomFilter[]) {
    this.customFilters = updatedFilters;
    console.log('----da', updatedFilters)
    this.fetchCollectionData(this.facetSearchQuery, updatedFilters);
  }

  openFilterDrawer(): void {
    this.facetedFilterService.fetchFilters(this.selectedEntity);
    this.drawerSvc.openDrawer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
