import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { ICustomFilter } from '../../models/integration.model';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'integration-custom-filter-list',
  templateUrl: './custom-filter-list.component.html',
  styleUrls: ['./custom-filter-list.component.scss'],
  standalone: false,
})
export class CustomFilterList implements OnChanges, OnDestroy {
  @Input() filters: ICustomFilter[] = [];
  @Output() filtersChange = new EventEmitter<ICustomFilter[]>();

  private destroy$ = new Subject<void>();
  private debounceSubjects = new Map<string, Subject<string>>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters']) {
      this.addDebounceSubjectsForNewFilters();
    }
  }

  private addDebounceSubjectsForNewFilters(): void {
    this.filters
      .filter(f => f.type === 'string')
      .forEach(filter => {
        const key = filter.field;

        if (!this.debounceSubjects.has(key)) {
          const subject = new Subject<string>();
          subject
            .pipe(debounceTime(300), takeUntil(this.destroy$))
            .subscribe(value => {
              const latestFilter = this.filters.find(f => f.field === key);
              if (latestFilter) {
                this.onValueChange(latestFilter, value);
              }
            });

          this.debounceSubjects.set(key, subject);
        }
      });
  }

  onStringValueChange(filter: ICustomFilter, value: string): void {
    const subject = this.debounceSubjects.get(filter.field);
    subject?.next(value);
  }

  onValueChange(filter: ICustomFilter, value: any): void {

    filter.value = value;

    this.filtersChange.emit([...this.filters]);
  }


  onDateRangeChange(filter: ICustomFilter, key: 'from' | 'to', value: Date | null): void {
    const formattedValue = value;

    filter.value = {
      ...filter.value,
      [key]: formattedValue,
    };

    const from = filter.value?.from;
    const to = filter.value?.to;

    if (from && to) {
      this.filtersChange.emit([...this.filters]);
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
