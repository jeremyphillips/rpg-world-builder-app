import type { ReactNode } from 'react'
import {
  CollapsibleListItem,
  type CollapsibleListItemDragHandleConfig,
  type ContentCardDensity,
} from '@rpg/ui'

import { resolveEntityLeadingUtilityCount } from '../../../anatomy/entity-leading-rail.lib'
import type { EntityAnatomyTrailing } from '../../../anatomy/entity-anatomy-trailing.types'
import { resolveEntitySurfaceEdges } from '../../../anatomy/entity-surface-edges.lib'
import type { EntitySummaryModel } from '../../../summary/entity-summary.types'
import { EntityCardContent } from '../content/entity-card-content'
import { EntityCardFrame } from '../content/entity-card-frame'
import { DASH_ENTITY_CARD_DISCLOSURE_BODY_WASH_CLASSES } from '../../dash-entity-surface.variants'
import { DisclosureEntityCardHeader } from './disclosure-entity-card-header'

export type EntityCardDisclosureRendererProps = {
  entity: EntitySummaryModel
  itemId: string
  toolbarAriaLabel: string
  trailing?: EntityAnatomyTrailing
  /** Links the entity heading only — not whole-row/card navigation. */
  headingHref?: string
  children: ReactNode
  density?: ContentCardDensity
  collapsed?: boolean
  onToggleCollapse?: () => void
  defaultCollapsed?: boolean
  disabled?: boolean
  /** Enables sortable drag grip — shell wires behavior via CollapsibleListItem. */
  dragHandleProps?: CollapsibleListItemDragHandleConfig
}

export function EntityCardDisclosureRenderer({
  entity,
  itemId,
  toolbarAriaLabel,
  trailing,
  headingHref,
  children,
  density = 'comfortable',
  collapsed,
  onToggleCollapse,
  defaultCollapsed = true,
  disabled = false,
  dragHandleProps,
}: EntityCardDisclosureRendererProps) {
  const showDragHandle = Boolean(dragHandleProps)
  const leadingUtilityCount = resolveEntityLeadingUtilityCount({
    dragHandle: showDragHandle,
    disclosure: true,
  })

  return (
    <EntityCardFrame
      density={density}
      disabled={disabled}
      edges={resolveEntitySurfaceEdges({ leadingUtilityCount, trailing })}
      leadingUtilityCount={leadingUtilityCount}
    >
      <CollapsibleListItem
        itemId={itemId}
        toolbarAriaLabel={toolbarAriaLabel}
        collapsible
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        defaultCollapsed={defaultCollapsed}
        showDragHandle={showDragHandle}
        dragHandleProps={dragHandleProps}
        rowLayout="entity-card"
        density={density}
        toolbarCompact
        toolbarLeadingChrome="none"
        bodyClassName={DASH_ENTITY_CARD_DISCLOSURE_BODY_WASH_CLASSES}
        header={
          <EntityCardContent>
            <DisclosureEntityCardHeader
              entity={entity}
              headingHref={headingHref}
              trailing={trailing}
              density={density}
              dragHandleProps={dragHandleProps}
            />
          </EntityCardContent>
        }
        body={children}
      />
    </EntityCardFrame>
  )
}
