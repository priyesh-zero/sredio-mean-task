import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EntityType } from '../constants/entity.constants';
import { IntegrationService } from './integration.service';

export interface FacetedFilterPayload {
  entity: EntityType;
  filter_key: string[];
  filter_data: {
    [key: string]: {
      name: string;
      type: 'single' | 'multi';
      options: string[];
    };
  };
  selected?: {
    [key: string]: {
      $in: string[];
    };
  }[]; // Optional: to track selected filters
}

@Injectable({ providedIn: 'root' })
export class FacetedFilterService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private filtersSubject = new BehaviorSubject<FacetedFilterPayload | null>(
    null,
  );
  filters$ = this.filtersSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(private integrationSvc: IntegrationService) {}

  fetchFilters(entity: EntityType) {
    const currentFilters = this.getCurrentFilters();
    if (currentFilters && currentFilters.entity === entity) {
      return;
    }
    this.loadingSubject.next(true);
    this.integrationSvc.getFacetSearchOptions(entity).subscribe((response) => {
      if (!response.success) {
        return;
      }
      this.filtersSubject.next({
        entity,
        filter_key: Object.keys(response.data),
        filter_data: response.data,
      });
      this.loadingSubject.next(false);
    });
  }

  setFilters(values: FacetedFilterPayload['selected']) {
    this.filtersSubject.next({
      ...this.filtersSubject.value!,
      selected: values,
    });
  }

  clearFilters() {
    const current = this.filtersSubject.value;
    if (!current) return;

    const cleared = {
      ...current,
      selected: undefined,
    };

    this.filtersSubject.next(cleared);
  }

  getCurrentFilters(): FacetedFilterPayload | null {
    return this.filtersSubject.value;
  }
}
