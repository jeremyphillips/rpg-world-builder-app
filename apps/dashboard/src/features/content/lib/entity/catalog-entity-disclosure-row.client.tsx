'use client'

import type { ReactNode } from 'react'
import { CollapsibleListItem } from '@rpg/ui'

import { EntityDisclosureHeaderAnatomy } from './entity-disclosure-header-anatomy.client'
import type { EntityItemTrailing } from './entity-item-trailing.types'
import { buildEntityContentOffsetStyle } from './entity-leading-rail.lib'
import type { EntitySummaryModel } from './entity-summary.types'
import {
  catalogEntityDisclosureRowBodyWashVariants,
  catalogEntityDisclosureRowHeaderPaddingVariants,
  catalogEntityDisclosureRowSurfaceVariants,
} from './catalog-entity-disclosure-row.variants'

export type CatalogEntityDisclosureRowProps = {
  toolbarLabel: string
  domIds: { itemId: string; titleId: string; bodyId: string }
  collapsible: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
  summary?: ReactNode
  details?: ReactNode
  entity: EntitySummaryModel
  trailing?: EntityItemTrailing
  headingHref?: string
}

const CATALOG_ENTITY_DISCLOSURE_DENSITY = 'compact' as const

/** Entity-aware catalog picker row — owns surface inset and canonical disclosure header anatomy. */
export function CatalogEntityDisclosureRow({
  toolbarLabel,
  domIds,
  collapsible,
  collapsed,
  onToggleCollapse,
  summary,
  details,
  entity,
  trailing,
  headingHref,
}: CatalogEntityDisclosureRowProps) {
  const contentOffsetStyle = buildEntityContentOffsetStyle({
    count: 1,
    density: CATALOG_ENTITY_DISCLOSURE_DENSITY,
  })

  return (
    <div className={catalogEntityDisclosureRowSurfaceVariants()} style={contentOffsetStyle}>
      <CollapsibleListItem
        itemId={domIds.itemId}
        titleId={domIds.titleId}
        bodyId={domIds.bodyId}
        toolbarAriaLabel={toolbarLabel}
        preset="catalog"
        rowLayout="entity-card"
        toolbarCompact
        toolbarLeadingChrome="none"
        actionsAlign="center"
        collapsible={collapsible}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        showDragHandle={false}
        bodyClassName={catalogEntityDisclosureRowBodyWashVariants()}
        header={
          <div className={catalogEntityDisclosureRowHeaderPaddingVariants()}>
            <EntityDisclosureHeaderAnatomy
              entity={entity}
              trailing={trailing}
              headingHref={headingHref}
              density={CATALOG_ENTITY_DISCLOSURE_DENSITY}
            />
          </div>
        }
        summary={summary}
        body={details}
      />
    </div>
  )
}
