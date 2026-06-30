import { ABSOLUTE_MAX_CHARACTER_LEVEL } from '../primitives/level'

export type ExtendedMaxValidationResult = { valid: true } | { valid: false; message: string }

/** Validates extended max against standard max for campaign settings. */
export function validateExtendedMaxLevel(
  standardMax: number,
  extendedMax: number,
): ExtendedMaxValidationResult {
  if (extendedMax <= standardMax) {
    if (extendedMax === standardMax) {
      return {
        valid: false,
        message: 'Extended maximum level must be higher than the standard maximum level.',
      }
    }
    const minimum = standardMax + 1
    if (minimum <= ABSOLUTE_MAX_CHARACTER_LEVEL) {
      return {
        valid: false,
        message: `Extended maximum must be at least ${minimum} because the standard maximum is ${standardMax}.`,
      }
    }
    return {
      valid: false,
      message: 'Extended maximum must be higher than the standard maximum.',
    }
  }
  return { valid: true }
}
