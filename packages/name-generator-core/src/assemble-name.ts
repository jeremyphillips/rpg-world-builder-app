import { NameGeneratorError, type NameStructureDefinition } from '@rpg/contracts/name-generator'

import { enforceNameLength, isWithinNameLength } from './lib/enforce-length'
import { getRequiredPartKeys, interpolateFormat } from './lib/interpolate-format'

// ---------------------------------------------------------------------------
// Assemble a final name string from structure format and part values.
// ---------------------------------------------------------------------------

export function assembleName(
  structure: NameStructureDefinition,
  parts: Readonly<Record<string, string>>,
): string {
  const requiredKeys = getRequiredPartKeys(structure.parts, structure.format)

  for (const key of requiredKeys) {
    const value = parts[key]
    if (value === undefined || value.length === 0) {
      throw new NameGeneratorError(
        'missing-required-part',
        `Missing required part "${key}" for structure "${structure.id}"`,
      )
    }
  }

  const value = enforceNameLength(interpolateFormat(structure.format, parts).trim())

  if (!isWithinNameLength(value)) {
    throw new NameGeneratorError('generation-exhausted', 'Assembled name exceeds length limits')
  }

  return value
}
