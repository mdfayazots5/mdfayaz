export function nextNumericId(items: { id: number }[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
}

export function prefixedId(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}
