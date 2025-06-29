import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FacetedFilterPayload {
  filter_key: string[];
  filter_data: { [key: string]: string[] };
  selected?: { [key: string]: string[] }; // Optional: to track selected filters
}

@Injectable({ providedIn: 'root' })
export class FacetedFilterService {
  private filtersSubject = new BehaviorSubject<FacetedFilterPayload | null>(null);
  filters$ = this.filtersSubject.asObservable();

  setFilters(filters: FacetedFilterPayload) {
    this.filtersSubject.next(filters);
  }

  clearFilters() {
    const current = this.filtersSubject.value;
    if (!current) return;

    const cleared = {
      ...current,
      selected: Object.fromEntries(current.filter_key.map(key => [key, []]))
    };

    this.filtersSubject.next(cleared);
  }

  getCurrentFilters(): FacetedFilterPayload | null {
    return this.filtersSubject.value;
  }
}
