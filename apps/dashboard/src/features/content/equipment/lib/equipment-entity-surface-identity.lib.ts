import type { ContentDisplayImage } from '@rpg/contracts'
import { resolveContentDisplayFallback } from '@rpg/contracts'

import type { EntitySurfaceIdentity } from '../../lib/entity/summary/entity-surface-identity.types'
import { entitySurfaceMetadataLine } from '../../lib/entity/summary/entity-surface-metadata.lib'

export function buildEquipmentEntitySurfaceIdentity(input: {
  heading: string
  metadataSegments: readonly string[]
  displayImage?: ContentDisplayImage
}): EntitySurfaceIdentity {
  const metadata = entitySurfaceMetadataLine(input.metadataSegments)

  return {
    heading: input.heading,
    fallback: resolveContentDisplayFallback({
      domain: 'equipment',
      surface: 'compact',
    }),
    ...(input.displayImage ? { displayImage: input.displayImage } : {}),
    ...(metadata ? { metadata } : {}),
  }
}
