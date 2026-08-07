import { z } from 'zod'

import {
  INTERIOR_TYPE_DEFINITIONS,
  type InteriorClassificationType,
  type InteriorSubtype,
} from '../../vocab/location/interior-type-definitions'

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

export function getInteriorClassificationTypeEntry(
  interiorType: InteriorClassificationType,
  classificationType: string,
) {
  return INTERIOR_TYPE_DEFINITIONS[interiorType].subtypes[
    classificationType as keyof (typeof INTERIOR_TYPE_DEFINITIONS)[typeof interiorType]['subtypes']
  ]
}
