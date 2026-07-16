import { z } from 'zod'

import { modelingGapEntrySchema } from './gap-entry'
import { EXPLICIT_MODELING_STATUSES } from './status'

export const modelingValidationMessages = {
  emptyGapsArray:
    'modeling.gaps must be omitted when there are no known gaps; an empty array implies a reviewed-no-gaps claim',
} as const

/** Optional root-level modeling metadata on catalog content records. */
export const contentModelingSchema = z
  .object({
    /** ISO datetime certifying a human reviewed this item's modeling posture. */
    reviewedAt: z.iso.datetime(),
    status: z.enum(EXPLICIT_MODELING_STATUSES).optional(),
    /** Omit when no known gaps; never persist an empty array. */
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
  })

export type ContentModeling = z.infer<typeof contentModelingSchema>

export function isSpellModelingReviewed(modeling: ContentModeling | undefined | null): boolean {
  return modeling?.reviewedAt !== undefined
}
