'use client'

import type { ReactNode } from 'react'
import { CollapsibleListItem } from '@rpg/ui'

import { EntityAnatomyHost } from '../../anatomy/entity-anatomy.client'
import type { EntityAnatomyTrailing } from '../../anatomy/entity-anatomy-trailing.types'
import { buildEntityContentOffsetStyle } from '../../anatomy/entity-leading-rail.lib'
import type { EntitySummaryModel } from '../../summary/entity-summary.types'
import { DisclosureEntityCardHeader } from '../cards/disclosure/disclosure-entity-card-header.client'
import {
  catalogEntityRowBodyWashVariants,
  catalogEntityRowHeaderPaddingVariants,
  catalogEntityRowInsetRootVariants,
} from './catalog-entity-row.variants'

export type CatalogEntityRowProps = {
  toolbarLabel: string
  domIds: { itemId: string; titleId: string; bodyId: string }
  collapsible?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
  summary?: ReactNode
  details?: ReactNode
  entity: EntitySummaryModel
  trailing?: EntityAnatomyTrailing
  headingHref?: string
}

const CATALOG_ENTITY_ROW_DENSITY = 'compact' as const

/** Entity-aware catalog picker row — owns inset tokens and header padding; CLI shell owns border/bg. */
export function CatalogEntityRow({
  toolbarLabel,
  domIds,
  collapsible = false,
  collapsed,
  onToggleCollapse,
  summary,
  details,
  entity,
  trailing,
  headingHref,
}: CatalogEntityRowProps) {
  const isDisclosure = details != null
  const contentOffsetStyle = isDisclosure
    ? buildEntityContentOffsetStyle({
        count: 1,
        density: CATALOG_ENTITY_ROW_DENSITY,
      })
    : undefined

  return (
    <div
      className={catalogEntityRowInsetRootVariants({ leading: isDisclosure })}
      style={contentOffsetStyle}
    >
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
        collapsible={isDisclosure && collapsible}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        showDragHandle={false}
        bodyClassName={isDisclosure ? catalogEntityRowBodyWashVariants() : undefined}
        header={
          <div className={catalogEntityRowHeaderPaddingVariants()}>
            {isDisclosure ? (
              <DisclosureEntityCardHeader
                entity={entity}
                trailing={trailing}
                headingHref={headingHref}
                density={CATALOG_ENTITY_ROW_DENSITY}
              />
            ) : (
              <EntityAnatomyHost
                entity={entity}
                trailing={trailing}
                headingHref={headingHref}
                density={CATALOG_ENTITY_ROW_DENSITY}
              />
            )}
          </div>
        }
        summary={summary}
        body={isDisclosure ? details : undefined}
      />
    </div>
  )
}
