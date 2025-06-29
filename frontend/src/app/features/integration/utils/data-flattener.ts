import { ColDef } from "ag-grid-community";

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
  result: FlattenedObject = {}
): FlattenedObject {
  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const arrayKey = `${fullKey}[${index}]`;
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          flattenObject(item, arrayKey, result); // handle object inside array
        } else {
          result[arrayKey] = item; // handle primitive in array
        }
      });
    } else if (value !== null && typeof value === 'object') {
      flattenObject(value, fullKey, result); // nested object
    } else {
      result[fullKey] = value; // primitive
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

export function generateFlatColumnDefs(data: any[]): ColDef[] {
  if (!data?.length) return [];

  const sample = flattenObject(
    data.reduce((a, b) =>
      Object.keys(flattenObject(b)).length > Object.keys(flattenObject(a)).length ? b : a
    )
  );

  return Object.keys(sample).map((key) => {
    const value = sample[key];

    const isImage = typeof value === 'string' && value.includes('avatar');
    const isUrl = typeof value === 'string' && /^https?:\/\//.test(value) && !isImage;
    const isEnabledField = typeof value === 'string' && (String(value).toLowerCase() === 'enabled' || String(value).toLowerCase() === 'disabled');
    const isBoolean = typeof value === 'boolean';

    return {
      field: key,
      headerName: formatHeaderName(key),
      resizable: true,
      sortable: true,
      filter: true,
      tooltipField: key,
      valueGetter: (params) => params.data[key],
      cellRenderer: (params: any) => {
        const val = params.value;

        // Handle undefined or null values
        if (val === undefined || val === null) return '';

        // For 'enabled' or 'disabled' string values
        if (isEnabledField) {
          const isEnabled = String(val).toLowerCase() === 'enabled';
          const color = isEnabled ? '#89ad8b' : '#dd7f79';
          const label = isEnabled ? 'Enabled' : 'Disabled';

          return `
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <span style="width:12px; height:12px; border-radius:50%; background-color:${color}; display:inline-block;"></span>
              <span>${label}</span>
            </span>
          `;
        }

        // Booleans
        if (isBoolean) {
          return `<input type="checkbox" disabled ${val ? 'checked' : ''} style="accent-color: #4caf50;"  />`;
        }

        // Image (avatar)
        if (isImage) {
          return `<img src="${val}" alt="avatar" style="width: 32px; height: 32px; border-radius: 50%;" />`;
        }

        // URL
        if (isUrl) {
          return `<a href="${val}" target="_blank" style="text-decoration: none; color: #1976d2;">${val}</a>`;
        }

        return val;
      }
    };
  });
}


