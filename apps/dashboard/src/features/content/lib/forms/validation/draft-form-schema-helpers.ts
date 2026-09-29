import { z, type ZodType } from 'zod'

/** Blank sentinel seeded by `select` and single `chips` controls in `@rpg/ui/form`. */
const EMPTY_SELECT_VALUE = ''

function normalizeEmptySelectValue(value: unknown): unknown {
  if (value === EMPTY_SELECT_VALUE || value === undefined || value === null) {
    return undefined
  }
  return value
}

/**
 * Optional closed-vocab field for **draft** form schemas bound to `select` or
 * single `chips` controls.
 *
 * RHF seeds unselected values as `''`. Plain `.optional()` on a `z.enum` still
 * validates that sentinel and fails — use this helper instead of
 * `someVocabSchema.optional()` on draft paths.
 *
 * See `apps/dashboard/docs/form-lib-conventions.md` (draft form schemas).
 */
export function draftOptionalSelect<T extends ZodType>(schema: T) {
  return z.preprocess(normalizeEmptySelectValue, schema.optional())
}

/**
 * Numeric contract field bound to `select` or single `chips` controls.
 *
 * RHF stores option values as strings. Preprocess non-empty numeric strings
 * before the contract number schema runs. Unlike `z.coerce.number()`, `''` is
 * left unchanged so optional draft fields do not become `0`.
 */
export function formSelectNumberSchema<T extends ZodType<number>>(schema: T) {
  return z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return Number(value)
    }
    return value
  }, schema)
}
