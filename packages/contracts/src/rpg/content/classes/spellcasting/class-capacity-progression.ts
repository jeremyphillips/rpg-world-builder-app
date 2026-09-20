import { z } from 'zod'

import { defineMessage } from '../../../../validation/define-message'
import { absoluteLevelSchema } from '../../../primitives/level'
import { progressionExtensionSchema } from '../../../vocab/spell/progression-extension'

const classCapacityCurveRowSchema = z.object({
  level: absoluteLevelSchema,
  count: z.number().int().min(0),
})

const classCapacityCurveSchema = z
  .object({
    rows: z.array(classCapacityCurveRowSchema).default([]),
  })
  .superRefine((curve, ctx) => {
    const seen = new Set<number>()
    curve.rows.forEach((row, index) => {
      if (seen.has(row.level)) {
        ctx.addIssue({
          code: 'custom',
          message: `Level ${row.level} appears more than once in the progression curve.`,
          path: ['rows', index, 'level'],
        })
      }
      seen.add(row.level)
    })
  })

// ---------------------------------------------------------------------------
// Class capacity progression — sparse level/count curves owned on the class
// (cantrips, future repertoire/prepared capacity). Not for spellbook gain.
// ---------------------------------------------------------------------------

export const classCapacityProgressionValidationMessages = {
  emptyCurve: defineMessage(
    'validation.classCapacityProgression.emptyCurve',
    () => 'Capacity progression must include at least one level breakpoint.',
  ),
  countMustIncrease: defineMessage<{ level: number; previous: number; next: number }>(
    'validation.classCapacityProgression.countMustIncrease',
    ({ level, previous, next }) =>
      `Level ${level} · Cantrips — count must be greater than the previous breakpoint (${previous}); got ${next}.`,
  ),
}

function refineStrictlyIncreasingCapacityRows(
  rows: readonly { level: number; count: number }[],
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  const sorted = [...rows].sort((left, right) => left.level - right.level)
  let previousCount: number | undefined

  sorted.forEach((row, index) => {
    if (previousCount !== undefined && row.count <= previousCount) {
      ctx.addIssue({
        code: 'custom',
        message: classCapacityProgressionValidationMessages.countMustIncrease({
          level: row.level,
          previous: previousCount,
          next: row.count,
        }),
        path: [...pathPrefix, index, 'count'],
      })
    }
    previousCount = row.count
  })
}

export const classCapacityProgressionSchema = z
  .object({
    curve: classCapacityCurveSchema,
    extension: progressionExtensionSchema.default('carryForward'),
  })
  .superRefine((progression, ctx) => {
    const rows = progression.curve.rows
    if (rows.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: classCapacityProgressionValidationMessages.emptyCurve(),
        path: ['curve', 'rows'],
      })
      return
    }

    refineStrictlyIncreasingCapacityRows(rows, ctx, ['curve', 'rows'])
  })

export type ClassCapacityProgression = z.infer<typeof classCapacityProgressionSchema>
