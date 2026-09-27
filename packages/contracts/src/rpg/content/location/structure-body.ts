import { z } from 'zod'
import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'

import { structureTypeSchema } from '../../vocab/location/building/structure-type'
import { locationBaseSchema } from './base'
import { buildingClassificationSchema } from './building-classification'

const structureLocationFields = {
  kind: z.literal('structure'),
  structureType: structureTypeSchema.optional(),
  classification: buildingClassificationSchema.optional(),
} as const

const structureLocationBaseSchema = locationBaseSchema.extend(structureLocationFields)

function refineStructureClassification(
  data: z.infer<typeof structureLocationBaseSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.classification && data.structureType !== 'building') {
    addCustomRefinementIssue(
      ctx,
      'Building classification is only valid when structureType is building.',
      ['classification'],
    )
  }
}

/** Publish-complete structure body with explicit unclassified and building branches. */
export const structureBodySchema = structureLocationBaseSchema.superRefine(
  refineStructureClassification,
)

export const structureLocationKindFields = structureLocationFields

export type StructureLocationKindFields = z.infer<typeof structureLocationBaseSchema>

export { refineStructureClassification as refineStructureBodyClassification }
