export type SortDirection = 'asc' | 'desc';

export interface SortOption<T> {
  key: string;
  label: string;
  directionLabels?: {
    asc: string;
    desc: string;
  };
  getValue: (item: T) => string | number | boolean | Date | null | undefined;
  defaultDirection?: SortDirection;
}

/**
 * Universal safe stable sorting algorithm:
 * - Safe numeric comparison (numbers, not string coercions)
 * - Safe date parsing comparison (timestamps)
 * - Safe locale-aware comparison for text
 * - Nulls and undefined sorted safely to the bottom
 * - Stable sort preserving original order for equal values
 * - Non-mutating pure copy
 */
export function sortData<T>(
  data: T[],
  sortOption: SortOption<T>,
  direction: SortDirection
): T[] {
  if (!Array.isArray(data) || data.length <= 1) return Array.isArray(data) ? [...data] : [];

  const indexed = data.map((item, index) => ({ item, index }));

  indexed.sort((a, b) => {
    const valA = sortOption.getValue(a.item);
    const valB = sortOption.getValue(b.item);

    // Null / Undefined safety: always push nulls to the end regardless of direction
    const aIsNull = valA === null || valA === undefined || valA === '';
    const bIsNull = valB === null || valB === undefined || valB === '';

    if (aIsNull && bIsNull) return a.index - b.index;
    if (aIsNull) return 1;
    if (bIsNull) return -1;

    let comparison = 0;

    // Date comparison
    if (valA instanceof Date && valB instanceof Date) {
      comparison = valA.getTime() - valB.getTime();
    } else if (
      typeof valA === 'string' &&
      typeof valB === 'string' &&
      !isNaN(Date.parse(valA)) &&
      !isNaN(Date.parse(valB)) &&
      (valA.includes('T') || valA.includes('-') || valA.includes('/')) &&
      (valB.includes('T') || valB.includes('-') || valB.includes('/'))
    ) {
      // Valid ISO/Date string comparison
      comparison = new Date(valA).getTime() - new Date(valB).getTime();
    } else if (typeof valA === 'number' && typeof valB === 'number') {
      // Numeric comparison
      comparison = valA - valB;
    } else if (typeof valA === 'boolean' && typeof valB === 'boolean') {
      comparison = (valA ? 1 : 0) - (valB ? 1 : 0);
    } else {
      // Locale-aware string comparison
      const strA = String(valA);
      const strB = String(valB);
      comparison = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
    }

    if (comparison === 0) {
      // Stable sort fallback
      return a.index - b.index;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return indexed.map((entry) => entry.item);
}
