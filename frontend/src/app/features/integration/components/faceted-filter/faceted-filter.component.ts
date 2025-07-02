import { Component, Input, OnInit } from '@angular/core';
import { FacetedFilterService } from '../../services/faceted-filter.service';
import { FilterDrawerService } from '../../services/filter-drawer.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'integration-faceted-filter',
  standalone: false,
  templateUrl: './faceted-filter.component.html',
  styleUrls: ['./faceted-filter.component.scss'],
})
export class FacetedFilterComponent implements OnInit {
  loading: boolean = false;
  filterKeys: string[] = [];
  filterData: Record<
    string,
    {
      name: string;
      type: 'single' | 'multi';
      options: string[];
    }
  > = {};
  selectedFilters: Record<string, string[]> = {};
  filterControls: Record<string, FormControl> = {};

  constructor(
    private facetedSvc: FacetedFilterService,
    private drawerSvc: FilterDrawerService,
  ) {}

  ngOnInit(): void {
    this.facetedSvc.loading$.subscribe((loading) => {
      this.loading = loading;
    });
    this.facetedSvc.filters$.subscribe((data) => {
      if (!data) return;

      this.filterKeys = data.filter_key;
      this.filterData = data.filter_data;
      this.selectedFilters = data.selected
        ? Object.entries(data.selected).reduce(
            (acc, [, obj]) => {
              for (const key in obj) {
                acc[key] = obj[key].$in;
              }
              return acc;
            },
            {} as Record<string, string[]>,
          )
        : {};

      this.filterKeys.forEach((key) => {
        if (!this.selectedFilters[key]) {
          this.selectedFilters[key] = [];
        }
        this.filterControls[key] = new FormControl(this.selectedFilters[key]);
      });
    });
  }

  apply(): void {
    const result: Record<string, { $in: string[] }>[] = [];

    this.filterKeys.forEach((key) => {
      if (
        this.filterControls[key] &&
        this.filterData[key].type === 'multi' &&
        this.filterControls[key].value.length > 0
      ) {
        result.push({
          [key]: {
            $in: this.filterControls[key].value,
          },
        });
      }

      if (
        this.filterControls[key] &&
        this.filterData[key].type === 'single' &&
        typeof this.filterControls[key].value !== 'object'
      ) {
        result.push({
          [key]: this.filterControls[key].value,
        });
      }
    });

    //new service method may be needed
    this.facetedSvc.setFilters(result);

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
    if (this.filterData[key].type === 'single') {
      return this.filterControls[key]?.value.toString() ?? '';
    }
    const values = this.filterControls[key]?.value ?? [];
    if (!values.length) return '';

    const first = values[0];
    const count = values.length;
    return count > 1
      ? `${first} (+${count - 1} ${count === 2 ? 'other' : 'others'})`
      : first;
  }
}
