'use client'

import type { ReactNode } from 'react'
import {
  CollapsibleListItem,
  type CollapsibleListItemDragHandleConfig,
  type ContentCardDensity,
} from '@rpg/ui'

import { EntityItemAnatomy } from './entity-item.client'
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
  leading?: ReactNode
  action?: ReactNode
  href?: string
  children: ReactNode
  density?: ContentCardDensity
  collapsed?: boolean
  onToggleCollapse?: () => void
  defaultCollapsed?: boolean
  disabled?: boolean
  /** Enables the drag-grip leading column — shell-owned geometry via CollapsibleListItem. */
  dragHandleProps?: CollapsibleListItemDragHandleConfig
}

export function DisclosureEntityCard({
  entity,
  itemId,
  toolbarAriaLabel,
  leading,
  action,
  href,
  children,
  density = 'comfortable',
  collapsed,
  onToggleCollapse,
  defaultCollapsed = true,
  disabled = false,
  dragHandleProps,
}: DisclosureEntityCardProps) {
  const showDragHandle = Boolean(dragHandleProps)

  return (
    <article
      className={disclosureEntityCardShellVariants({ disabled })}
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
        className={disclosureEntityCardListItemVariants({ density })}
        bodyClassName={disclosureEntityCardBodyWashVariants({ density })}
        header={
          <div className={disclosureEntityCardHeaderPaddingVariants({ density })}>
            <EntityItemAnatomy
              entity={entity}
              href={href}
              leading={leading}
              action={action}
              density={density}
            />
          </div>
        }
        body={children}
      />
    </article>
  )
}
