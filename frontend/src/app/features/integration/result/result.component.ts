import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  IServerSideDatasource,
} from 'ag-grid-community';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { IntegrationService } from '../services/integration.service';
import { FilterDrawerService } from '../services/filter-drawer.service';
import {
  FacetedFilterPayload,
  FacetedFilterService,
} from '../services/faceted-filter.service';

import { flattenObject, generateFlatColumnDefs } from '../utils/data-flattener';
import { getCustomFilters, setCustomFilters } from '../utils/custom-filter';

import { CustomFilterDialog } from '../components/custom-filter-dialog/custom-filter-dialog.component';
import { DetailRendererComponent } from '../components/detail-renderer/detail-renderer.component';

import {
  ENTITIES,
  ENTITY,
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

import { ICustomFilter } from '../models/integration.model';

@Component({
  selector: 'integration-result',
  standalone: false,
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit, OnDestroy {
  integrations: IntegrationOption[] = INTEGRATIONS;
  selectedIntegration: IntegrationType = INTEGRATION.GITHUB;

  entities: EntityOption[] = ENTITIES;
  selectedEntity: EntityType = ENTITY.REPOS;

  searchText = '';
  customFilters: ICustomFilter[] = [];
  facetSearchQuery: FacetedFilterPayload['selected'];

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private gridApi!: GridApi;

  gridOptions: GridOptions = {
    columnDefs: [],
    rowModelType: 'serverSide',
    paginationPageSize: 10,
    cacheBlockSize: 10,
    paginationPageSizeSelector: [10, 25, 50, 100],
    masterDetail: true,
    components: { detailRenderer: DetailRendererComponent },
    detailCellRenderer: 'detailRenderer'
  };

  constructor(
    private dialog: MatDialog,
    private integrationSvc: IntegrationService,
    private drawerSvc: FilterDrawerService,
    private facetedFilterService: FacetedFilterService
  ) {
    this.facetedFilterService.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(updatedFilters => {
        this.facetSearchQuery = updatedFilters?.selected;
        this.refreshGridData();
      });
  }

  ngOnInit(): void {
    this.customFilters = getCustomFilters();

    this.searchSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(text => {
        this.searchText = text;
        this.refreshGridData();
      });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    params.api.setGridOption('serverSideDatasource', this.getServerSideDatasource());
  }


  private getServerSideDatasource(): IServerSideDatasource {
    return {
      getRows: serverParams => {
        const startRow = serverParams.request?.startRow ?? 0;
        const pageSize = this.gridOptions.paginationPageSize || 5;
        const page = Math.floor(startRow / pageSize) + 1;

        const columnSorts = serverParams.request.sortModel;
        const columnFilters = serverParams.request.filterModel;

        console.log('------sort', columnSorts)
        console.log('------filter', columnSorts)

        this.integrationSvc
          .getCollectionData(
            this.selectedEntity,
            page,
            pageSize,
            this.searchText,
            this.facetSearchQuery,
            this.customFilters,
            columnSorts,
            columnFilters
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: res => {
              const flattenedData = res.data.map(item =>
                flattenObject(item, '', {}, res.relations)
              );

              const generatedCols = generateFlatColumnDefs(
                flattenedData,
                res.relations,
                this.selectedEntity
              );

              if (generatedCols.length > 0 && res.relations.length > 0) {
                const colIndex = this.selectedEntity === ENTITY.ISSUES ? 1 : 0;
                generatedCols[colIndex] = {
                  ...generatedCols[colIndex],
                  cellRenderer: 'agGroupCellRenderer',
                };
              }

              this.gridApi.setGridOption('columnDefs', generatedCols);


              serverParams.success({
                rowData: flattenedData,
                rowCount: res.total,
              });
            },
            error: () => serverParams.fail(),
          });
      },
    };
  }

  onIntegrationChange(): void {
    this.refreshGridData();
  }

  onEntityChange(): void {
    this.facetedFilterService.clearFilters();
    setCustomFilters([]);
    this.customFilters = [];
    this.refreshGridData();
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchSubject.next('');
  }

  refreshGridData(purge = true): void {
    this.gridApi?.refreshServerSide({ purge });
  }

  openFilterPopup(): void {
    const dialogRef = this.dialog.open(CustomFilterDialog, {
      width: '500px',
      disableClose: true,
      autoFocus: false,
      data: { columnDefs: ENTITY_FIELDS[this.selectedEntity] },
    });

    dialogRef.afterClosed().subscribe((result: ICustomFilter[]) => {
      if (!result) return;
      const merged = result.map(newFilter => {
        const existing = this.customFilters.find(f => f.field === newFilter.field);
        return {
          ...newFilter,
          value: existing?.value ?? '',
        };
      });
      this.customFilters = merged;
      this.refreshGridData();
    });
  }

  onFilterValueChange(updatedFilters: ICustomFilter[]): void {
    this.customFilters = updatedFilters;
    this.refreshGridData();
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
