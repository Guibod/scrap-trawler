
export function countDiff(
  a: object | null,
  b: object | null
): number {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b ?? {})]);
  let diff = 0;

  for (const key of allKeys) {
    const aEntry = a?.[key];
    const bEntry = b?.[key];

    if (!aEntry || !bEntry) {
      diff++;
    } else if (
      aEntry.rowId !== bEntry.rowId ||
      aEntry.mode !== bEntry.mode
    ) {
      diff++;
    }
  }

  return diff;
}