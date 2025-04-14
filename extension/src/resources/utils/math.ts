export function percentage(part: number, total: number, precision: number = 2): string {
  if (total === 0) return "0 %"
  return `${Number(((part / total) * 100).toFixed(precision))} %`
}