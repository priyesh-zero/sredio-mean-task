import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { IntegrationService } from '../services/integration.service';
import { flattenObject, generateFlatColumnDefs } from '../utils/data-flattener';
import { MatDialog } from '@angular/material/dialog';
import { getCustomFilters } from '../utils/custom-filter';
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
    detailCellRendererParams: {
      detailGridOptions: {
        defaultColDef: {
          resizable: true,
          sortable: true,
          filter: true,
          flex: 1,
          minWidth: 250,
        },
        columnDefs: [],
      },
      getDetailRowData: (detailParams: any) => {
        // const rowData = detailParams.data;
        // const rowId = rowData.sha || rowData.id || rowData.number;
        this.integrationSvc
          .getCollectionData(
            ENTITY_HIERARCHY[this.selectedEntity] || ENTITY.CHANGELOG,
          )
          .subscribe({
            next: (res: any) => {
              const detailData = res?.data || [];

              if (!Array.isArray(detailData) || detailData.length === 0) {
                detailParams.successCallback([]);
                return;
              }

              const flattened = detailData.map((d: any) => flattenObject(d));
              const generatedCols = generateFlatColumnDefs(flattened);

              // Set dynamic columns using internal Grid API
              const detailGridApi = detailParams.node.detailGridInfo?.api;
              if (detailGridApi && generatedCols.length > 0) {
                detailGridApi.setGridOption('columnDefs', generatedCols);
              }

              detailParams.successCallback(flattened);
            },
            error: () => {
              detailParams.successCallback([]);
            },
          });
      },
    },
  };

  constructor(
    private dialog: MatDialog,
    private integrationSvc: IntegrationService,
    private drawerSvc: FilterDrawerService,
    private facetedFilterService: FacetedFilterService,
  ) {
    this.facetedFilterService.filters$.subscribe((updatedFilters) => {
      this.facetSearchQuery = updatedFilters?.selected;
      this.fetchCollectionData(updatedFilters?.selected);
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

  fetchCollectionData(facetSearchQuery = this.facetSearchQuery): void {
    this.integrationSvc
      .getCollectionData(
        this.selectedEntity,
        this.currentPage,
        this.pageSize,
        this.searchText,
        facetSearchQuery,
      )
      .subscribe({
        next: (res) => {
          const flattenedData = res.data.map((item) => flattenObject(item));
          const generatedCols = generateFlatColumnDefs(flattenedData);
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
      data: { columnDefs: this.columnDefs },
    });

    dialogRef.afterClosed().subscribe((result: ICustomFilter[]) => {
      if (result !== undefined && result !== null) {
        this.customFilters = result;
      }
    });
  }

  onFilterValueChange(updatedFilters: ICustomFilter[]) {
    console.log('-----dddd', updatedFilters);
    // TODO: Apply filters to the grid data
  }

  openFilterDrawer(): void {
    const filters = {
      filter_key: ['org', 'user', 'repo'],
      filter_data: {
        org: ['openai', 'google', 'microsoft', 'facebook', 'amazon'],
        user: ['alice', 'bob', 'charlie', 'diana', 'eve'],
        repo: ['chatgpt-ui', 'tensorflow', 'vscode', 'react', 'angular'],
      },
    };
    this.facetedFilterService.fetchFilters(this.selectedEntity);
    this.drawerSvc.openDrawer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
