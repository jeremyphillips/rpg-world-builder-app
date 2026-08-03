import { z } from 'zod'

import {
  getInteriorSubtypeLabel,
  INTERIOR_TYPE_DEFINITIONS,
  type InteriorClassificationType,
  type InteriorSubtype,
} from '../../vocab/location/interior-type-definitions'
import { getInteriorTypeLabel } from '../../vocab/location/interior-type'

export const interiorClassificationSchema = z.object({
  type: z.string().min(1),
})

export type InteriorClassification = z.infer<typeof interiorClassificationSchema>

export function isInteriorClassificationTypeValid(
  interiorType: InteriorClassificationType,
  classificationType: string,
): classificationType is InteriorSubtype<typeof interiorType> {
  return (Object.keys(INTERIOR_TYPE_DEFINITIONS[interiorType].subtypes) as string[]).includes(
    classificationType,
  )
}

/** Composes a display label for interior classification from registry entries. */
export function getInteriorClassificationLabel(input: {
  interiorType?: string
  classification?: InteriorClassification
}): string | undefined {
  if (!input.interiorType) return undefined

  const coarseLabel = getInteriorTypeLabel(input.interiorType)
  if (!input.classification?.type) {
    return coarseLabel
  }

  const interiorType = input.interiorType as InteriorClassificationType
  const subtypeLabel = getInteriorSubtypeLabel(interiorType, input.classification.type)
  return `${coarseLabel} · ${subtypeLabel}`
}

export function getInteriorClassificationTypeEntry(
  interiorType: InteriorClassificationType,
  classificationType: string,
) {
  return INTERIOR_TYPE_DEFINITIONS[interiorType].subtypes[
    classificationType as keyof (typeof INTERIOR_TYPE_DEFINITIONS)[typeof interiorType]['subtypes']
  ]
}
