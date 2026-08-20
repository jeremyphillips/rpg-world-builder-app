'use client'

import type { ReactNode } from 'react'
import {
  CollapsibleListItem,
  type CollapsibleListItemDragHandleConfig,
  type ContentCardDensity,
} from '@rpg/ui'

import {
  buildEntityContentOffsetStyle,
  resolveEntityLeadingUtilityCount,
} from '../entity-leading-rail.lib'
import { EntityDisclosureHeaderAnatomy } from './entity-disclosure-header-anatomy.client'
import type { EntityItemTrailing } from '../entity-item-trailing.types'
import type { EntitySummaryModel } from '../entity-summary.types'
import {
  disclosureEntityCardArticleVariants,
  disclosureEntityCardBodyWashVariants,
  disclosureEntityCardHeaderPaddingVariants,
  disclosureEntityCardListItemVariants,
} from './disclosure-entity-card.variants'

export type DisclosureEntityCardProps = {
  entity: EntitySummaryModel
  itemId: string
  toolbarAriaLabel: string
  /** Optional consumer drag grip — rendered in the entity leading rail. */
  dragHandle?: ReactNode
  trailing?: EntityItemTrailing
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
    <article
      className={disclosureEntityCardArticleVariants({ density, disabled })}
      style={leadingOffsetStyle}
      data-disabled={disabled ? true : undefined}
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
        actionsAlign="center"
        toolbarCompact
        toolbarLeadingChrome="none"
        className={disclosureEntityCardListItemVariants()}
        bodyClassName={disclosureEntityCardBodyWashVariants({ density })}
        header={
          <div className={disclosureEntityCardHeaderPaddingVariants({ density })}>
            <EntityDisclosureHeaderAnatomy
              entity={entity}
              headingHref={headingHref}
              trailing={trailing}
              density={density}
              dragHandle={dragHandle}
              dragHandleProps={dragHandleProps}
            />
          </div>
        }
        body={children}
      />
    </article>
  )
}
