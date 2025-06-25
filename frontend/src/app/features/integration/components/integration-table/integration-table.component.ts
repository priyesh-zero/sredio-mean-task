import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { IntegrationService } from '../../services/integration.service';
import { flattenObject } from '../../utils/data-flattener';

@Component({
  selector: 'app-integration-table',
  standalone: false,
  templateUrl: './integration-table.component.html',
  styleUrls: ['./integration-table.component.scss']
})
export class IntegrationTableComponent implements OnInit, OnDestroy {

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

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private integrationSvc: IntegrationService) { }

  ngOnInit(): void {
    this.fetchCollectionData();
    this.searchSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((text) => {
        this.searchText = text;
        this.currentPage = 1;
        this.fetchCollectionData();
      });
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
          this.columnDefs = this.integrationSvc.generateColumnDefs(flattenedData);
          // Assign the flattened data to rowData
          this.rowData = flattenedData;
          console.log('Flattened row sample:', flattenedData[0]);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
