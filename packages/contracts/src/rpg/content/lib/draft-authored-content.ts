import { z } from 'zod'

/** Display name applied when a draft save omits or blanks the name field. */
export function formatUntitledContentName(typeLabel: string): string {
  return `Untitled ${typeLabel}`
}

/** Alias for dashboard and API normalization helpers. */
export const untitledContentName = formatUntitledContentName

/** Draft-authored body fields — allows empty name, then applies an untitled fallback. */
export function draftAuthoredContentBodySchema(typeLabel: string) {
  return z.object({
    imageKey: z.string().optional(),
    name: z
      .string()
      .transform((value) => (value.trim() ? value : formatUntitledContentName(typeLabel)))
      .pipe(z.string().min(1)),
    description: z.string().optional(),
  })
}
