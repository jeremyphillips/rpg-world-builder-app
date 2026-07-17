import { extractFormatTokens } from '@rpg/contracts/name-generator'

// ---------------------------------------------------------------------------
// Interpolate a structure format string with generated part values.
// ---------------------------------------------------------------------------

export function interpolateFormat(format: string, parts: Readonly<Record<string, string>>): string {
  return format.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (match, token: string) => {
    const value = parts[token]
    return value ?? match
  })
}

export function getRequiredPartKeys(
  parts: ReadonlyArray<{ key: string; required?: boolean }>,
  format: string,
): string[] {
  const formatTokens = new Set(extractFormatTokens(format))
  return parts
    .filter((part) => part.required !== false || formatTokens.has(part.key))
    .map((part) => part.key)
}
