import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICustomFilter } from '../../models/integration.model';

@Component({
  selector: 'integration-custom-filter-list',
  templateUrl: './custom-filter-list.component.html',
  styleUrls: ['./custom-filter-list.component.scss'],
  standalone: false,
})
export class CustomFilterList {
  @Input() filters: ICustomFilter[] = [];
  @Output() filtersChange = new EventEmitter<ICustomFilter[]>();

  onValueChange(filter: ICustomFilter, value: any): void {
    filter.value = value;
    this.filtersChange.emit(this.filters); // emit the entire updated array
  }

  onDateRangeChange(filter: ICustomFilter, key: 'from' | 'to', value: Date | null): void {
    filter.value = {
      ...filter.value,
      [key]: value,
    };

    const from = filter.value?.from;
    const to = filter.value?.to;

    // Only emit when both are selected
    if (from && to) {
      this.filtersChange.emit(this.filters);
    }
  }

}
