import {
  DEFAULT_STANDARD_ARRAY,
  sameStandardArray,
  STANDARD_ARRAY_LENGTH,
  standardArraySchema,
  type StandardArray,
} from '@rpg/contracts'
import { z } from 'zod'

/** Coerces form input, then validates with the contract Standard Array schema. */
export const standardArrayFormSchema = z
  .array(z.coerce.number())
  .length(STANDARD_ARRAY_LENGTH)
  .pipe(standardArraySchema)

export function mapStandardArrayToFormValues(standardArray: readonly number[]): number[] {
  return [...standardArray]
}

export function standardArrayDefaultFormValues(): number[] {
  return mapStandardArrayToFormValues(DEFAULT_STANDARD_ARRAY)
}

export function parseStandardArrayFormValues(values: readonly number[]): StandardArray {
  return standardArrayFormSchema.parse(values)
}

/** Returns a copied sparse patch value when the form diverges from the resolved default. */
export function buildStandardArrayPatchInput(
  values: readonly number[],
  resolvedDefault: readonly number[] = DEFAULT_STANDARD_ARRAY,
): StandardArray | undefined {
  const parsed = parseStandardArrayFormValues(values)
  if (sameStandardArray(parsed, resolvedDefault)) return undefined
  return [...parsed]
}
