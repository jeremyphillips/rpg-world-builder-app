import { z } from 'zod'

import { modelingBlockerSchema, modelingGapEntrySchema } from './gap-entry'
import { EXPLICIT_MODELING_STATUSES } from './status'

export const modelingValidationMessages = {
  emptyGapsArray:
    'modeling.gaps must be omitted when there are no known gaps; an empty array implies a reviewed-no-gaps claim',
  duplicateBlockerInGaps: 'modeling.gaps must not repeat the blocker code',
} as const

/** Optional root-level modeling metadata on catalog content records. */
export const contentModelingSchema = z
  .object({
    /** ISO datetime certifying a human reviewed this item's modeling posture. */
    reviewedAt: z.iso.datetime().optional(),
    status: z.enum(EXPLICIT_MODELING_STATUSES).optional(),
    /** Single limitation preventing promotion to the next status rung. */
    blocker: modelingBlockerSchema.optional(),
    /** Residual limitations — omit when none; never persist an empty array. */
    gaps: z.array(modelingGapEntrySchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.gaps !== undefined && data.gaps.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: modelingValidationMessages.emptyGapsArray,
        path: ['gaps'],
      })
    }

    if (data.blocker && data.gaps?.some((gap) => gap.code === data.blocker?.code)) {
      ctx.addIssue({
        code: 'custom',
        message: modelingValidationMessages.duplicateBlockerInGaps,
        path: ['gaps'],
      })
    }
  })

export type ContentModeling = z.infer<typeof contentModelingSchema>

export function isSpellModelingReviewed(modeling: ContentModeling | undefined | null): boolean {
  if (!modeling) return false
  return (
    modeling.reviewedAt !== undefined ||
    modeling.status !== undefined ||
    modeling.blocker !== undefined ||
    modeling.gaps !== undefined
  )
}
