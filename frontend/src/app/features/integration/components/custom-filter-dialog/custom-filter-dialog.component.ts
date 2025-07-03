import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatChipInputEvent } from '@angular/material/chips';
import { getCustomFilters, setCustomFilters } from '../../utils/custom-filter';
import { ICustomFilter } from '../../models/integration.model';

@Component({
  selector: 'integration-custom-filter-dialog.component',
  templateUrl: './custom-filter-dialog.component.html',
  styleUrls: ['./custom-filter-dialog.component.scss'],
  standalone: false,
})
export class CustomFilterDialog implements OnInit {
  filters: ICustomFilter[] = [];

  selectedField = '';
  selectedLabel = '';
  selectedType: 'string' | 'boolean' | 'date' | 'dateRange' | 'select' = 'string';
  selectOptions: string[] = [];
  selectOptionInput = '';
  editIndex: number | null = null; //  Added for edit tracking

  fieldOptions: { value: string; label: string }[] = [];

  // Added for autocomplete support
  fieldSearch = '';
  filteredFieldOptions: { value: string; label: string }[] = [];

  fieldError: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<CustomFilterDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { columnDefs: any[] }
  ) { }

  ngOnInit(): void {
    this.filters = getCustomFilters();
    if (this.data?.columnDefs?.length) {
      this.fieldOptions = this.data.columnDefs.map(c => ({
        value: c.field,
        label: c.label,
      }));
      this.filteredFieldOptions = [...this.fieldOptions];
    }
  }

  filterFieldOptions(search: string): void {
    const lower = search.toLowerCase();
    this.filteredFieldOptions = this.fieldOptions.filter(opt =>
      opt.label.toLowerCase().includes(lower)
    );
  }

  onFieldSelected(label: string): void {
    const selected = this.fieldOptions.find(f => f.label === label);
    if (selected) {
      this.selectedField = selected.value;
      this.selectedLabel = selected.label;
    }
    if (this.isDuplicateField(selected?.value ?? '')) {
      this.fieldError = 'This field is already added as a filter.';
    } else {
      this.fieldError = '';
    }
  }

  onFieldChange(field: string) {
    const match = this.fieldOptions.find(f => f.value === field);
    this.selectedLabel = match?.label ?? '';

    if (this.isDuplicateField(field)) {
      this.fieldError = 'This field is already added as a filter.';
    } else {
      this.fieldError = '';
    }
  }

  // Updated method to support chip input behavior
  addSelectOptionFromEvent(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.selectOptions.includes(value)) {
      this.selectOptions.push(value);
    }
    event.chipInput?.clear();
  }

  removeSelectOption(option: string): void {
    const index = this.selectOptions.indexOf(option);
    if (index >= 0) {
      this.selectOptions.splice(index, 1);
    }
  }

  addFilter() {
    this.fieldError = null; // Clear previous error

    if (!this.selectedField || !this.selectedType) return;

    if (this.isDuplicateField(this.selectedField)) {
      this.fieldError = 'This field is already added as a filter.';
      return;
    }

    const filter: ICustomFilter = {
      field: this.selectedField,
      label: this.selectedLabel,
      type: this.selectedType,
      value: '',
      options: this.selectedType === 'select' ? [...this.selectOptions] : undefined,
    };

    if (this.editIndex !== null) {
      this.filters[this.editIndex] = filter;
      this.editIndex = null;
    } else {
      this.filters.push(filter);
    }

    this.resetInputs();
  }


  editFilter(filter: ICustomFilter, index: number) {
    this.selectedField = filter.field;
    this.selectedLabel = filter.label;
    this.selectedType = filter.type;
    this.fieldSearch = filter.label;
    this.selectOptions = filter.type === 'select' ? [...(filter.options ?? [])] : [];
    this.editIndex = index;
  }

  isDuplicateField(field: string): boolean {
    return this.editIndex === null && this.filters.some(f => f.field === field);
  }


  resetInputs() {
    this.selectedField = '';
    this.selectedLabel = '';
    this.selectedType = 'string';
    this.selectOptions = [];
    this.selectOptionInput = '';
    this.editIndex = null;
    this.fieldSearch = '';
    this.filteredFieldOptions = [...this.fieldOptions];
  }

  remove(index: number) {
    this.filters.splice(index, 1);
    if (this.editIndex === index) {
      this.resetInputs();
    }
  }

  apply() {
    setCustomFilters(this.filters)
    this.dialogRef.close(this.filters);
  }

  close() {
    this.dialogRef.close();
  }
}
