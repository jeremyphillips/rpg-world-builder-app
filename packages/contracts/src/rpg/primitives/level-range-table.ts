import { z } from 'zod'

import { absoluteLevelSchema, campaignLevelSchema, formatLevelRangeLabel } from './level'
import { levelValidationMessages } from './level-messages'

export type LevelRangeRow = { minLevel: number; maxLevel: number }

export type RefineLevelRangeTableOptions = {
  pathPrefix?: PropertyKey[]
  /** Campaign cap — validates each row min/max via `campaignLevelSchema`. */
  maxLevel?: number
  requireStartAt?: number
  /** Last row `maxLevel` must equal this value. */
  requireEndAt?: number
}

export type LevelRangeTiersSchemaOptions = RefineLevelRangeTableOptions & {
  min?: number
  max?: number
  length?: number
}

function issueCampaignLevelBounds(
  rows: LevelRangeRow[],
  ctx: z.RefinementCtx,
  pathPrefix: PropertyKey[],
  cap: number,
): void {
  const levelSchema = campaignLevelSchema(cap)

  rows.forEach((row, index) => {
    if (!levelSchema.safeParse(row.minLevel).success) {
      ctx.addIssue({
        code: 'custom',
        message: levelValidationMessages.outOfBounds({ maxLevel: cap }),
        path: [...pathPrefix, index, 'minLevel'],
      })
    }

    if (!levelSchema.safeParse(row.maxLevel).success) {
      ctx.addIssue({
        code: 'custom',
        message: levelValidationMessages.outOfBounds({ maxLevel: cap }),
        path: [...pathPrefix, index, 'maxLevel'],
      })
    }
  })
}

/** Validates contiguous, non-overlapping level range rows. */
export function refineLevelRangeTable(
  rows: LevelRangeRow[],
  ctx: z.RefinementCtx,
  options: RefineLevelRangeTableOptions = {},
): void {
  const pathPrefix = options.pathPrefix ?? []

  if (options.maxLevel !== undefined) {
    issueCampaignLevelBounds(rows, ctx, pathPrefix, options.maxLevel)
  }

  rows.forEach((row, index) => {
    if (row.minLevel > row.maxLevel) {
      ctx.addIssue({
        code: 'custom',
        message: levelValidationMessages.invertedRange(),
        path: [...pathPrefix, index, 'minLevel'],
      })
    }

    if (
      index === 0 &&
      options.requireStartAt !== undefined &&
      row.minLevel !== options.requireStartAt
    ) {
      ctx.addIssue({
        code: 'custom',
        message: levelValidationMessages.rangeStartAt({ expected: options.requireStartAt }),
        path: [...pathPrefix, 0, 'minLevel'],
      })
    }

    const previousRow = rows[index - 1]
    if (previousRow !== undefined) {
      if (row.minLevel <= previousRow.maxLevel) {
        ctx.addIssue({
          code: 'custom',
          message: levelValidationMessages.rangeOverlap({
            otherLabel: formatLevelRangeLabel(previousRow),
          }),
          path: [...pathPrefix, index, 'minLevel'],
        })
      }

      if (row.minLevel > previousRow.maxLevel + 1) {
        ctx.addIssue({
          code: 'custom',
          message: levelValidationMessages.rangeGap({ level: previousRow.maxLevel + 1 }),
          path: [...pathPrefix, index, 'minLevel'],
        })
      }
    }
  })

  if (options.requireEndAt !== undefined && rows.length > 0) {
    const lastIndex = rows.length - 1
    const lastRow = rows[lastIndex]!

    if (lastRow.maxLevel !== options.requireEndAt) {
      ctx.addIssue({
        code: 'custom',
        message: levelValidationMessages.rangeEndAt({ expected: options.requireEndAt }),
        path: [...pathPrefix, lastIndex, 'maxLevel'],
      })
    }
  }
}

/**
 * Builds a Zod array schema for tier rows with `minLevel` / `maxLevel`.
 * `rowShape` must not include level keys — the builder adds them.
 */
export function levelRangeTiersSchema<T extends z.ZodRawShape>(
  rowShape: T,
  options?: LevelRangeTiersSchemaOptions,
) {
  const { min, max, length, ...refineOptions } = options ?? {}
  const levelSchema =
    refineOptions.maxLevel !== undefined
      ? campaignLevelSchema(refineOptions.maxLevel)
      : absoluteLevelSchema

  let schema = z.array(
    z.object({
      minLevel: levelSchema,
      maxLevel: levelSchema,
      ...rowShape,
    }),
  )

  if (min !== undefined) schema = schema.min(min)
  if (max !== undefined) schema = schema.max(max)
  if (length !== undefined) schema = schema.length(length)

  return schema.superRefine((rows, ctx) =>
    refineLevelRangeTable(rows as LevelRangeRow[], ctx, refineOptions),
  )
}
