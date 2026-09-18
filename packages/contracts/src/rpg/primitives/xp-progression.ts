import { z } from 'zod'

import { absoluteLevelSchema } from './level'

// ---------------------------------------------------------------------------
// XP progression entry — level threshold pair shared by catalog seeds,
// campaign rules overrides, and runtime resolution.
// ---------------------------------------------------------------------------

export const xpProgressionEntrySchema = z.object({
  level: absoluteLevelSchema,
  xpRequired: z.number().int().min(0),
})

export type XpProgressionEntry = z.infer<typeof xpProgressionEntrySchema>

export function xpRequiredForLevel(
  progression: { entries: readonly XpProgressionEntry[] },
  level: number,
): number | undefined {
  return progression.entries.find((entry) => entry.level === level)?.xpRequired
}
