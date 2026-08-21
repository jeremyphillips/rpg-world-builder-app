import { z } from 'zod'

import { interiorTypeSchema } from '../../vocab/location/building/interior-type'
import { locationBaseSchema } from './base'
import {
  interiorClassificationSchema,
  isInteriorClassificationTypeValid,
  type InteriorClassification,
} from './interior-classification'
import type { InteriorClassificationType } from '../../vocab/location/building/interior-type-definitions'

const interiorLocationFields = {
  kind: z.literal('interior'),
  interiorType: interiorTypeSchema.optional(),
  classification: interiorClassificationSchema.optional(),
} as const

const interiorLocationBaseSchema = locationBaseSchema.extend(interiorLocationFields)

function refineInteriorClassification(
  data: z.infer<typeof interiorLocationBaseSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.classification && !data.interiorType) {
    ctx.addIssue({
      code: 'custom',
      message: 'Interior classification requires interiorType.',
      path: ['classification'],
    })
  }

  if (data.classification && data.interiorType) {
    const interiorType = data.interiorType as InteriorClassificationType
    const classification = data.classification as InteriorClassification
    if (!isInteriorClassificationTypeValid(interiorType, classification.type)) {
      ctx.addIssue({
        code: 'custom',
        message: `Invalid interior classification type "${classification.type}" for interiorType "${interiorType}".`,
        path: ['classification', 'type'],
      })
    }
  }
}

/** Publish-complete interior body with explicit unclassified and classified branches. */
export const interiorBodySchema = interiorLocationBaseSchema.superRefine(
  refineInteriorClassification,
)

export const interiorLocationKindFields = interiorLocationFields

export type InteriorLocationKindFields = z.infer<typeof interiorLocationBaseSchema>

export { refineInteriorClassification as refineInteriorBodyClassification }
