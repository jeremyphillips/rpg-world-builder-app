'use client'

import type { ReactNode } from 'react'
import type { CollapsibleListItemDragHandleConfig, ContentCardDensity } from '@rpg/ui'

import { EntityItemAnatomy } from '../../../item/entity-item.client'
import type { EntityItemTrailing } from '../../../item/entity-item-trailing.types'
import type { EntitySummaryModel } from '../../../summary/entity-summary.types'
import { resolveEntityDisclosureLeadingUtilities } from './disclosure-entity-card-header.lib'

export type DisclosureEntityCardHeaderProps = {
  entity: EntitySummaryModel
  trailing?: EntityItemTrailing
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
    <EntityItemAnatomy
      entity={entity}
      headingHref={headingHref}
      leadingUtilities={leadingUtilities}
      trailing={trailing}
      density={density}
    />
  )
}
