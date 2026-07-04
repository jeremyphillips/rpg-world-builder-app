import { ABSOLUTE_MAX_CHARACTER_LEVEL } from '../primitives/level'
import { levelValidationMessages } from '../primitives/level-messages'

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
        message: levelValidationMessages.extendedMaxMustExceedStandard(),
      }
    }
    const minimum = standardMax + 1
    if (minimum <= ABSOLUTE_MAX_CHARACTER_LEVEL) {
      return {
        valid: false,
        message: levelValidationMessages.extendedMaxMinimum({ minimum, standardMax }),
      }
    }
    return {
      valid: false,
      message: levelValidationMessages.extendedMaxTooLow(),
    }
  }
  return { valid: true }
}
