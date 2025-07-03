import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Router } from '@angular/router';
import { IntegrationService } from '../services/integration.service';
import { ENTITY } from '../constants/entity.constants';
import { flattenObject, generateFlatColumnDefs } from '../utils/data-flattener';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'integration-timesheet',
  standalone: false,
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent {
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  searchTerm = '';

  columnDefs: ColDef[] = [];

  defaultColDef: ColDef = {
    resizable: true
  };

  rowData: any[] = [];
  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;
  totalPages = 0;

  isInitialLoad: boolean = true;

  constructor(private integrationSvc: IntegrationService) { }

  ngOnInit(): void {
    this.isInitialLoad = true;
    this.fetchCollectionData();
    this.searchSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((text) => {
        this.searchTerm = text;
        this.currentPage = 1;
        this.fetchCollectionData();
      });
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  fetchCollectionData(): void {
    this.integrationSvc
      .getCollectionData(
        ENTITY.ISSUES,
        this.currentPage,
        this.pageSize,
        this.searchTerm
      )
      .subscribe({
        next: (res) => {
          const flattenedData = res.data.map((item) => flattenObject(item, '', {}, res.relations));
          const generatedCols = generateFlatColumnDefs(flattenedData, res.relations, ENTITY.ISSUES);
          this.columnDefs = generatedCols;
          this.rowData = flattenedData;
          this.totalRecords = res.total;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        },
        error: (err) => {
          console.error(`Failed to fetch data for tickets`, err);
          this.rowData = [];
          this.totalRecords = 0;
          this.totalPages = 0;
        },
        complete: () => {
          this.isInitialLoad = false;
        }
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchCollectionData();
  }

}
