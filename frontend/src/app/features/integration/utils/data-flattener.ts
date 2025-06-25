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

