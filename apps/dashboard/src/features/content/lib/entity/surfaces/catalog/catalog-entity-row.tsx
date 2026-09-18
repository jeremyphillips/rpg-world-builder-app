import type { ReactNode } from 'react'
import { CollapsibleListItem } from '@rpg/ui'

import { EntityAnatomyHost } from '../../anatomy/entity-anatomy'
import { buildEntityContentOffsetStyle } from '../../anatomy/entity-leading-rail.lib'
import type { EntityAnatomyTrailing } from '../../anatomy/entity-anatomy-trailing.types'
import type { EntitySummaryModel } from '../../summary/entity-summary.types'
import { EntityCardContent } from '../cards/content/entity-card-content'
import { EntityCardFrame } from '../cards/content/entity-card-frame'
import { DisclosureEntityCardHeader } from '../cards/disclosure/disclosure-entity-card-header'
import { disclosureEntityCardListItemVariants } from '../cards/disclosure/disclosure-entity-card.variants'
import { catalogEntityRowBodyWashVariants } from './catalog-entity-row.variants'

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

/** Entity-aware catalog picker row — EntityCardFrame owns perimeter; EntityCardContent owns inset. */
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
    <EntityCardFrame
      density={CATALOG_ENTITY_ROW_DENSITY}
      surface="catalogRow"
      leadingUtilityCount={isDisclosure ? 1 : 0}
      style={contentOffsetStyle}
    >
      <CollapsibleListItem
        itemId={domIds.itemId}
        titleId={domIds.titleId}
        bodyId={domIds.bodyId}
        toolbarAriaLabel={toolbarLabel}
        rowLayout="entity-card"
        density={CATALOG_ENTITY_ROW_DENSITY}
        toolbarCompact
        toolbarLeadingChrome="none"
        actionsAlign="center"
        collapsible={isDisclosure && collapsible}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        showDragHandle={false}
        className={disclosureEntityCardListItemVariants()}
        bodyClassName={isDisclosure ? catalogEntityRowBodyWashVariants() : undefined}
        header={
          <EntityCardContent density={CATALOG_ENTITY_ROW_DENSITY}>
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
          </EntityCardContent>
        }
        summary={summary}
        body={isDisclosure ? details : undefined}
      />
    </EntityCardFrame>
  )
}
