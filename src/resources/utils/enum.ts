export function resolveEnumValue<T extends Record<string, string>>(enumObj: T, value: string): T[keyof T] | undefined {
  return Object.values(enumObj).includes(value as T[keyof T]) ? (value as T[keyof T]) : undefined;
}