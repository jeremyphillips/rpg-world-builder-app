import { MAX_NAME_LENGTH } from '@rpg/contracts/name-generator'

// ---------------------------------------------------------------------------
// Enforce generated name length limits.
// ---------------------------------------------------------------------------

export function enforceNameLength(value: string, maxLength: number = MAX_NAME_LENGTH): string {
  if (value.length <= maxLength) {
    return value
  }
  return value.slice(0, maxLength)
}

export function isWithinNameLength(value: string, maxLength: number = MAX_NAME_LENGTH): boolean {
  return value.length > 0 && value.length <= maxLength
}
