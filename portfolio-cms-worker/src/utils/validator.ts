export function isNonEmptyString(v: unknown): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

export function isPositiveNumber(v: unknown): boolean {
  return typeof v === 'number' && Number.isFinite(v) && v > 0;
}

export function validateRequired(obj: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    const value = obj[field];
    if (value === undefined || value === null || value === '') {
      return field;
    }
  }
  return null;
}
