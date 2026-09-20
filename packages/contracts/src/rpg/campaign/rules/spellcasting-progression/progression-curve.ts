import { z } from 'zod'

import { defineMessage } from '../../../../validation/define-message'
import { absoluteLevelSchema } from '../../../primitives/level'

// ---------------------------------------------------------------------------
// Progression curve — sparse level/count rows shared by choice progressions.
// ---------------------------------------------------------------------------

export const progressionCurveRowSchema = z.object({
  level: absoluteLevelSchema,
  count: z.number().int().min(0),
})

export type ProgressionCurveRow = z.infer<typeof progressionCurveRowSchema>

export const progressionCurveSchema = z
  .object({
    rows: z.array(progressionCurveRowSchema).default([]),
  })
  .superRefine((curve, ctx) => {
    const seen = new Set<number>()
    curve.rows.forEach((row, index) => {
      if (seen.has(row.level)) {
        ctx.addIssue({
          code: 'custom',
          message: progressionCurveValidationMessages.duplicateLevel({ level: row.level }),
          path: ['rows', index, 'level'],
        })
      }
      seen.add(row.level)
    })
  })

export type ProgressionCurve = z.infer<typeof progressionCurveSchema>

export const progressionCurveValidationMessages = {
  duplicateLevel: defineMessage<{ level: number }>(
    'validation.progressionCurve.duplicateLevel',
    ({ level }) => `Level ${level} appears more than once in the progression curve.`,
  ),
}

/** Highest level with an authored row, or 0 when empty. */
export function resolveMaxAuthoredCurveLevel(rows: readonly ProgressionCurveRow[]): number {
  return rows.reduce((max, row) => Math.max(max, row.level), 0)
}

/** Map of level → count for authored rows only. */
export function progressionCurveRowMap(
  rows: readonly ProgressionCurveRow[],
): ReadonlyMap<number, number> {
  return new Map(rows.map((row) => [row.level, row.count]))
}
