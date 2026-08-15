import {
  DEFAULT_STANDARD_ARRAY,
  sameStandardArray,
  standardArraySchema,
  type StandardArray,
} from '@rpg/contracts'
import { z } from 'zod'

export const standardArrayFormSchema = z.array(z.coerce.number().int()).length(6)

export function mapStandardArrayToFormValues(standardArray: readonly number[]): number[] {
  return [...standardArray]
}

export function standardArrayDefaultFormValues(): number[] {
  return mapStandardArrayToFormValues(DEFAULT_STANDARD_ARRAY)
}

export function parseStandardArrayFormValues(values: readonly number[]): StandardArray {
  return standardArraySchema.parse(values)
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
