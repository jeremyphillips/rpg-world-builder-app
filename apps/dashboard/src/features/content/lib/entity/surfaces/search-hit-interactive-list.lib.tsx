import type { ReactNode } from 'react'

import type { EntitySurfaceIdentity } from '../summary/entity-surface-identity.types'
import { EntitySummaryStatusItemView } from '../summary/entity-summary-status'
import { EntitySummarySupportingMetadata } from '../summary/entity-summary'
import {
  buildEntitySurfaceLeadingMediaNode,
  projectEntitySurfaceIdentityToSummaryModel,
} from './entity-surface-projection.lib'

export type SearchHitInteractiveListPresentation = {
  startSlot: ReactNode
  heading: ReactNode
  classification?: ReactNode
  supporting?: ReactNode
  status?: ReactNode
}

/** Projects entity surface identity into interactive list slots for passive search hits. */
export function projectSearchHitToInteractiveListPresentation(
  identity: EntitySurfaceIdentity,
): SearchHitInteractiveListPresentation {
  const entity = projectEntitySurfaceIdentityToSummaryModel(identity, 'compact')
  const startSlot = buildEntitySurfaceLeadingMediaNode(identity, 'compact')

  const status =
    entity.status && entity.status.length > 0 ? (
      <>
        {entity.status.map((item, index) => (
          <EntitySummaryStatusItemView key={index} item={item} density="compact" />
        ))}
      </>
    ) : undefined

  const supporting =
    entity.supportingMetadata && entity.supportingMetadata.length > 0 ? (
      <EntitySummarySupportingMetadata segments={entity.supportingMetadata} density="compact" />
    ) : (
      entity.description
    )

  return {
    startSlot,
    heading: entity.heading,
    classification: entity.classification,
    supporting,
    status,
  }
}
