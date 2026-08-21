import type { ReactNode } from 'react'
import type { CollapsibleListItemDragHandleConfig, ContentCardDensity } from '@rpg/ui'

import { EntityAnatomy } from '../../../anatomy/entity-anatomy'
import type { EntityAnatomyTrailing } from '../../../anatomy/entity-anatomy-trailing.types'
import type { EntitySummaryModel } from '../../../summary/entity-summary.types'
import { resolveEntityDisclosureLeadingUtilities } from './disclosure-entity-card-header.lib'

export type DisclosureEntityCardHeaderProps = {
  entity: EntitySummaryModel
  trailing?: EntityAnatomyTrailing
  headingHref?: string
  density?: ContentCardDensity
  /** Optional consumer drag grip — rendered in the entity leading rail. */
  dragHandle?: ReactNode
  /** Enables sortable drag grip — requires CollapsibleListItem drag context. */
  dragHandleProps?: CollapsibleListItemDragHandleConfig
}

/** Canonical entity disclosure header — leading rail + summary + trailing only. */
export function DisclosureEntityCardHeader({
  entity,
  trailing,
  headingHref,
  density = 'comfortable',
  dragHandle,
  dragHandleProps,
}: DisclosureEntityCardHeaderProps) {
  const leadingUtilities = resolveEntityDisclosureLeadingUtilities({ dragHandle, dragHandleProps })

  return (
    <EntityAnatomy
      entity={entity}
      headingHref={headingHref}
      leadingUtilities={leadingUtilities}
      trailing={trailing}
      density={density}
    />
  )
}
