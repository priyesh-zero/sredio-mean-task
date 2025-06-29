import { Component, OnInit } from '@angular/core';
import { FacetedFilterService } from '../../services/faceted-filter.service';
import { FilterDrawerService } from '../../services/filter-drawer.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'integration-faceted-filter',
  standalone: false,
  templateUrl: './faceted-filter.component.html',
  styleUrls: ['./faceted-filter.component.scss']
})
export class FacetedFilterComponent implements OnInit {
  filterKeys: string[] = [];
  filterData: Record<string, string[]> = {};
  selectedFilters: Record<string, string[]> = {};
  filterControls: Record<string, FormControl> = {};

  constructor(
    private facetedSvc: FacetedFilterService,
    private drawerSvc: FilterDrawerService
  ) { }

  ngOnInit(): void {
    this.facetedSvc.filters$.subscribe((data) => {
      if (!data) return;

      this.filterKeys = data.filter_key;
      this.filterData = data.filter_data;
      this.selectedFilters = data.selected ?? {};

      this.filterKeys.forEach((key) => {
        if (!this.selectedFilters[key]) {
          this.selectedFilters[key] = [];
        }
        this.filterControls[key] = new FormControl(this.selectedFilters[key]);
      });
    });
  }

  apply(): void {
    const result: Record<string, string[]> = {};

    this.filterKeys.forEach((key) => {
      result[key] = this.filterControls[key]?.value || [];
    });

    this.facetedSvc.setFilters({
      filter_key: this.filterKeys,
      filter_data: this.filterData,
      selected: result,
    });

    this.drawerSvc.closeDrawer();
  }

  clear(): void {
    this.filterKeys.forEach((key) => {
      this.filterControls[key]?.setValue([]);
    });

    this.facetedSvc.clearFilters();
    this.drawerSvc.closeDrawer();
  }

  getSummaryText(key: string): string {
    const values = this.filterControls[key]?.value ?? [];
    if (!values.length) return '';

    const first = values[0];
    const count = values.length;
    return count > 1 ? `${first} (+${count - 1} ${count === 2 ? 'other' : 'others'})` : first;
  }
}
