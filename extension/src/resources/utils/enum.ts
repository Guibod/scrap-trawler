export function resolveEnumValue<T extends Record<string, string>>(enumObj: T, value: string): T[keyof T] | undefined {
  return Object.values(enumObj).includes(value as T[keyof T]) ? (value as T[keyof T]) : undefined;
}

export function sortByEnumOrder<T>(arr: T[], enumObj: Record<string, T>): T[] {
  const order = Object.values(enumObj)
  return [...arr].sort((a, b) => order.indexOf(a) - order.indexOf(b))
}