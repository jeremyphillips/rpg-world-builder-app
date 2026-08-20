'use client'

import type { ReactNode } from 'react'
import type { CollapsibleListItemDragHandleConfig, ContentCardDensity } from '@rpg/ui'

import { EntityItemAnatomy } from '../entity-item.client'
import type { EntityItemTrailing } from '../entity-item-trailing.types'
import type { EntitySummaryModel } from '../entity-summary.types'
import { resolveEntityDisclosureLeadingUtilities } from './entity-disclosure-header-anatomy.lib'

export type EntityDisclosureHeaderAnatomyProps = {
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
export function EntityDisclosureHeaderAnatomy({
  entity,
  trailing,
  headingHref,
  density = 'comfortable',
  dragHandle,
  dragHandleProps,
}: EntityDisclosureHeaderAnatomyProps) {
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
