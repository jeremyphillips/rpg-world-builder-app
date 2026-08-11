'use client'

import type { ReactNode } from 'react'
import {
  CollapsibleListItem,
  CollapsibleListItemDisclosureTrigger,
  CollapsibleListItemDragHandleTrigger,
  type CollapsibleListItemDragHandleConfig,
  type ContentCardDensity,
} from '@rpg/ui'

import { EntityLeadingRail } from './entity-leading-rail.client'
import {
  buildEntityLeadingOffsetStyle,
  resolveEntityLeadingUtilityCount,
} from './entity-leading-rail.lib'
import { EntityItemAnatomy } from './entity-item.client'
import type { EntityItemTrailing } from './entity-item-trailing.types'
import type { EntitySummaryModel } from './entity-summary.types'
import {
  disclosureEntityCardBodyWashVariants,
  disclosureEntityCardHeaderPaddingVariants,
  disclosureEntityCardListItemVariants,
  disclosureEntityCardShellVariants,
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

function DisclosureEntityCardLeadingRail({
  dragHandle,
  dragHandleProps,
}: Pick<DisclosureEntityCardProps, 'dragHandle' | 'dragHandleProps'>) {
  const showDragHandle = Boolean(dragHandleProps)

  return (
    <EntityLeadingRail>
      {showDragHandle ? (dragHandle ?? <CollapsibleListItemDragHandleTrigger />) : null}
      <CollapsibleListItemDisclosureTrigger />
    </EntityLeadingRail>
  )
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
  const leadingOffsetStyle = buildEntityLeadingOffsetStyle(leadingUtilityCount)

  return (
    <article
      className={disclosureEntityCardShellVariants({ disabled })}
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
        className={disclosureEntityCardListItemVariants({ density })}
        bodyClassName={disclosureEntityCardBodyWashVariants({ density })}
        header={
          <div className={disclosureEntityCardHeaderPaddingVariants({ density })}>
            <EntityItemAnatomy
              entity={entity}
              headingHref={headingHref}
              leading={
                <DisclosureEntityCardLeadingRail
                  dragHandle={dragHandle}
                  dragHandleProps={dragHandleProps}
                />
              }
              trailing={trailing}
              density={density}
            />
          </div>
        }
        body={children}
      />
    </article>
  )
}
