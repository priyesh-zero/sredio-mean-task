import { ICustomFilter } from '../models/integration.model';
import {
  getFromLS,
  setToLS,
  removeFromLS,
  LSKeys
} from './storage';

export function getCustomFilters(): ICustomFilter[] {
  return getFromLS<ICustomFilter[]>(LSKeys.CUSTOM_FILTERS) ?? [];
}

export function setCustomFilters(filters: ICustomFilter[]): void {
  setToLS(LSKeys.CUSTOM_FILTERS, filters);
}

export function clearCustomFilters(): void {
  removeFromLS(LSKeys.CUSTOM_FILTERS);
}
