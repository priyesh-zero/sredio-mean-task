import { ColDef } from "ag-grid-community";
import { ENTITY, EntityType } from "../constants/entity.constants";
import { ENTITY_GROUPING_FIELDS } from "../constants/entity-grouping.config";

export interface FlattenedObject {
  [key: string]: any;
}

/**
 * Recursively flattens a nested object including arrays.
 * Example:
 * {
 *   a: { b: { c: 1 } },
 *   d: [{ e: 2 }]
 * }
 * becomes:
 * {
 *   'a.b.c': 1,
 *   'd[0].e': 2
 * }
 */
export function flattenObject(
  obj: Record<string, any>,
  parentKey = '',
  result: FlattenedObject = {},
  keysToSkip: string[] = []
): FlattenedObject {
  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (keysToSkip.includes(key)) {
      // ✅ Don't flatten this key — just assign it directly to top level or parent level
      result[fullKey] = value;
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const arrayKey = `${fullKey}[${index}]`;
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          flattenObject(item, arrayKey, result, keysToSkip);
        } else {
          result[arrayKey] = item;
        }
      });
    } else if (value !== null && typeof value === 'object') {
      flattenObject(value, fullKey, result, keysToSkip);
    } else {
      result[fullKey] = value;
    }
  });

  return result;
}

/**
 * Converts a flattened path to a user-friendly header.
 * Example: "commit.author.name" → "Commit Author Name"
 */
export function formatHeaderName(path: string): string {
  return path
    .replace(/\[(\d+)\]/g, ' $1') // e.g. "parents[0]" → "parents 0"
    .split(/[.\s]/) // split by dots and spaces
    .flatMap(segment =>
      segment
        .split(/[-_]/) // further split hyphen and underscore
        .filter(Boolean) // remove empty
    )
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function generateFlatColumnDefs(
  data: any[],
  keysToExclude: string[] = [],
  entity: string = '',
  grouping: boolean = false
): ColDef[] {
  if (!data?.length) return [];

  // Pick the widest object for flattening
  const flattenedSample = flattenObject(
    data.reduce((a, b) =>
      Object.keys(flattenObject(b)).length > Object.keys(flattenObject(a)).length ? b : a
    )
  );

  const groupFields = grouping ? ENTITY_GROUPING_FIELDS[entity.toLowerCase()] || [] : [];

  // Special column(s) for specific entity
  const specialColumns: ColDef[] = [];

  if (entity === ENTITY.ISSUES) {
    specialColumns.push({
      headerName: 'Action',
      field: 'action',
      pinned: 'left',
      cellRenderer: (params: any) => {
        const id = params.data?.id;
        return id
          ? `<a href="integration/find-user?ticketId=${id}" target="_blank" style="color: #1976d2;">Find User</a>`
          : '';
      },
      suppressMovable: true,
      width: 140,
      sortable: false,
      filter: false,
    });
  }

  const dynamicColumns: ColDef[] = Object.keys(flattenedSample)
    .filter((key) => {
      const baseKey = key.split('.')[0].split('[')[0]; // handles nested keys
      return !keysToExclude.includes(baseKey);
    })
    .map((key) => {
      const value = flattenedSample[key];

      const isImage = typeof value === 'string' && value.includes('avatar');
      const isUrl = typeof value === 'string' && /^https?:\/\//.test(value) && !isImage;
      const isEnabledField =
        typeof value === 'string' &&
        (value.toLowerCase() === 'enabled' || value.toLowerCase() === 'disabled');
      const isBoolean = typeof value === 'boolean';

      const isGroupField = groupFields.includes(key);

      return {
        field: key,
        headerName: formatHeaderName(key),
        resizable: true,
        sortable: true,
        filter: true,
        tooltipField: key,
        rowGroup: isGroupField,
        // hide: groupFields.includes(key), // hide group columns from visible columns
        valueGetter: (params: any) => params.data?.[key],
        cellRenderer: (params: any) => {
          const val = params.value;
          if (val === undefined || val === null) return '';

          if (isEnabledField) {
            const isEnabled = val.toLowerCase() === 'enabled';
            const color = isEnabled ? '#89ad8b' : '#dd7f79';
            const label = isEnabled ? 'Enabled' : 'Disabled';
            return `
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span style="width:12px; height:12px; border-radius:50%; background-color:${color}; display:inline-block;"></span>
                <span>${label}</span>
              </span>
            `;
          }

          if (isBoolean) {
            return `<input type="checkbox" disabled ${val ? 'checked' : ''} style="accent-color: #4caf50;" />`;
          }

          if (isImage) {
            return `<img src="${val}" alt="avatar" style="width: 32px; height: 32px; border-radius: 50%;" />`;
          }

          if (isUrl) {
            return `<a href="${val}" target="_blank" style="text-decoration: none; color: #1976d2;">${val}</a>`;
          }

          return val;
        }
      };
    });

  return [...specialColumns, ...dynamicColumns];
}


