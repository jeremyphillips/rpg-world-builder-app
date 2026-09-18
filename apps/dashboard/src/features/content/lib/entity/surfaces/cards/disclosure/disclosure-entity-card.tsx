import type { ReactNode } from 'react'
import {
  CollapsibleListItem,
  type CollapsibleListItemDragHandleConfig,
  type ContentCardDensity,
} from '@rpg/ui'

import {
  buildEntityContentOffsetStyle,
  resolveEntityLeadingUtilityCount,
} from '../../../anatomy/entity-leading-rail.lib'
import type { EntityAnatomyTrailing } from '../../../anatomy/entity-anatomy-trailing.types'
import type { EntitySummaryModel } from '../../../summary/entity-summary.types'
import { EntityCardContent } from '../content/entity-card-content'
import { EntityCardFrame } from '../content/entity-card-frame'
import { DisclosureEntityCardHeader } from './disclosure-entity-card-header'
import {
  disclosureEntityCardBodyWashVariants,
  disclosureEntityCardListItemVariants,
} from './disclosure-entity-card.variants'

export type DisclosureEntityCardProps = {
  entity: EntitySummaryModel
  itemId: string
  toolbarAriaLabel: string
  /** Optional consumer drag grip — rendered in the entity leading rail. */
  dragHandle?: ReactNode
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

export function DisclosureEntityCard({
  entity,
  itemId,
  toolbarAriaLabel,
  dragHandle,
  trailing,
  headingHref,
  children,
  density = 'comfortable',
  collapsed,
  onToggleCollapse,
  defaultCollapsed = true,
  disabled = false,
  dragHandleProps,
}: DisclosureEntityCardProps) {
  const showDragHandle = Boolean(dragHandleProps)
  const leadingUtilityCount = resolveEntityLeadingUtilityCount({
    dragHandle: showDragHandle,
    disclosure: true,
  })
  const leadingOffsetStyle = buildEntityContentOffsetStyle({
    count: leadingUtilityCount,
    density,
  })

  return (
    <EntityCardFrame
      density={density}
      surface="subtle"
      disabled={disabled}
      leadingUtilityCount={leadingUtilityCount}
      style={leadingOffsetStyle}
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
        actionsAlign="center"
        toolbarCompact
        toolbarLeadingChrome="none"
        className={disclosureEntityCardListItemVariants()}
        bodyClassName={disclosureEntityCardBodyWashVariants()}
        header={
          <EntityCardContent density={density}>
            <DisclosureEntityCardHeader
              entity={entity}
              headingHref={headingHref}
              trailing={trailing}
              density={density}
              dragHandle={dragHandle}
              dragHandleProps={dragHandleProps}
            />
          </EntityCardContent>
        }
        body={children}
      />
    </EntityCardFrame>
  )
}
