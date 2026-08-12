'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ContentCardHeadingAction, type ContentCardDensity } from '@rpg/ui'

import { EntityCardFrame } from './entity/entity-card-frame.client'
import { EntityItemAnatomy } from './entity/entity-item.client'
import type { EntityItemTrailing } from './entity/entity-item-trailing.types'
import type { EntitySummaryModel } from './entity/entity-summary.types'

export type { EntitySummaryModel } from './entity/entity-summary.types'
export type { EntityItemTrailing } from './entity/entity-item-trailing.types'
export { EntitySummary } from './entity/entity-summary.client'
export { EntityItem } from './entity/entity-item.client'
export { DisclosureEntityCard } from './entity/disclosure-entity-card.client'
export type { DisclosureEntityCardProps } from './entity/disclosure-entity-card.client'
export { CatalogEntityDisclosureRow } from './entity/catalog-entity-disclosure-row.client'
export type { CatalogEntityDisclosureRowProps } from './entity/catalog-entity-disclosure-row.client'
export { createCatalogEntityDisclosureRowRenderer } from './entity/catalog-entity-disclosure-row-renderer.client'

export type ContentEntityCardProps = {
  entity: EntitySummaryModel
  /** Exactly one leading utility when set — never a multi-control fragment. */
  leading?: ReactNode
  trailing?: EntityItemTrailing
  /** Links the entity heading only — not whole-row/card navigation. */
  headingHref?: string
  density?: ContentCardDensity
  disabled?: boolean
}

export function ContentEntityCard({
  entity,
  leading,
  trailing,
  headingHref,
  density,
  disabled = false,
}: ContentEntityCardProps) {
  const resolvedDensity = density ?? 'comfortable'

  return (
    <EntityCardFrame
      density={resolvedDensity}
      disabled={disabled}
      leadingUtilityCount={leading ? 1 : 0}
    >
      <EntityItemAnatomy
        entity={entity}
        headingHref={headingHref}
        leadingUtilities={leading != null ? [leading] : undefined}
        trailing={trailing}
        density={resolvedDensity}
      />
    </EntityCardFrame>
  )
}

export function ContentEntityCardViewLink({ href }: { href: string }) {
  return (
    <ContentCardHeadingAction asChild>
      <Link to={href}>View</Link>
    </ContentCardHeadingAction>
  )
}
