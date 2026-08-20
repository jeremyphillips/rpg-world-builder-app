'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ContentCardHeadingAction, type ContentCardDensity } from '@rpg/ui'

import { EntityCardFrame } from './entity/entity-card-frame.client'
import { EntityItemAnatomy } from './entity/entity-item.client'
import type { EntityItemTrailing } from './entity/entity-item-trailing.types'
import type { EntitySummaryModel } from './entity/entity-summary.types'

export type { EntitySummaryModel } from './entity/entity-summary.types'
export type { EntitySummaryStatusItem } from './entity/entity-summary-status.types'
export type {
  EntityItemTrailing,
  EntityItemTrailingSecondary,
} from './entity/entity-item-trailing.types'
export { EntitySummary } from './entity/entity-summary.client'
export { EntityItem } from './entity/entity-item.client'
export { DisclosureEntityCard } from './entity/disclosure/disclosure-entity-card.client'
export type { DisclosureEntityCardProps } from './entity/disclosure/disclosure-entity-card.client'
export { CatalogEntityRow } from './entity/catalog/catalog-entity-row.client'
export type { CatalogEntityRowProps } from './entity/catalog/catalog-entity-row.client'
export { CatalogEntityPickerSheet } from './entity/catalog/catalog-entity-picker-sheet.client'
export type { CatalogEntityPickerSheetProps } from './entity/catalog/catalog-entity-picker-sheet.client'
export { createCatalogEntityRowRenderer } from './entity/catalog/catalog-entity-row-renderer.client'

export type ContentEntityCardProps = {
  entity: EntitySummaryModel
  /** Exactly one leading utility when set — never a multi-control fragment. */
  leading?: ReactNode
  trailing?: EntityItemTrailing
  /** Links the entity heading only — not whole-row/card navigation. */
  headingHref?: string
  density?: ContentCardDensity
  disabled?: boolean
  /** Numeric-only passive scalar aligned with the entity heading row. */
  headingEndValue?: number
}

export function ContentEntityCard({
  entity,
  leading,
  trailing,
  headingHref,
  density,
  disabled = false,
  headingEndValue,
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
        headingEndValue={headingEndValue}
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
