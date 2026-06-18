/** Capitalizes the first character of a string (e.g. `"martial"` → `"Martial"`). */
export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
