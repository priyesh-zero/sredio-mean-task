export const LSKeys = {
  USER: 'user',
  CUSTOM_FILTERS: 'customFilters'
  // Add more keys here as needed
} as const;


export function getFromLS<T>(key: string): T | null {
  const item = localStorage.getItem(key);
  if (!item) return null;

  try {
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error parsing localStorage item "${key}":`, error);
    return null;
  }
}

export function setToLS<T>(key: string, value: T): void {
  try {
    const jsonString = JSON.stringify(value);
    localStorage.setItem(key, jsonString);
  } catch (error) {
    console.error(`Error stringifying localStorage item "${key}":`, error);
  }
}

export function removeFromLS(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage item "${key}":`, error);
  }
}