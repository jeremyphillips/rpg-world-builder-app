import { z } from 'zod'

/** Object keys that must not be used as overlay ids. Rows are stored in arrays, and these are still rejected. */
export const UNSAFE_OVERLAY_IDS = new Set(['__proto__', 'constructor', 'prototype'])

export const overlayIdSchema = z
  .string()
  .min(1)
  .refine((id) => !UNSAFE_OVERLAY_IDS.has(id), 'Unsafe overlay id')

export function duplicateIds(ids: readonly string[]): string[] {
  const seen = new Set<string>()
  const duplicates: string[] = []
  for (const id of ids) {
    if (seen.has(id)) duplicates.push(id)
    seen.add(id)
  }
  return duplicates
}
