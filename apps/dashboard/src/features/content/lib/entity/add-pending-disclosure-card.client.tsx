'use client'

import type { ReactNode } from 'react'
import { Button, type ContentCardDensity } from '@rpg/ui'

import { useAddPendingDisclosure } from '@/lib/create-flow'

import { ContentEntityCard } from '../content-entity-card.client'
import { DisclosureEntityCard } from './disclosure-entity-card.client'
import type { EntityItemTrailing } from './entity-item-trailing.types'
import type { EntitySummaryModel } from './entity-summary.types'
import type { EntitySummaryStatusItem } from './entity-summary-status.types'

export const ADD_PENDING_DISCLOSURE_ADD_LABEL = 'Add'

export type AddPendingDisclosureCardProps = {
  itemId: string
  entity: EntitySummaryModel
  addLabel?: string
  addDisabled?: boolean
  addDisabledReason?: string
  expanded?: boolean
  onAdd?: () => void
  onCollapse?: () => void
  trailing?: EntityItemTrailing
  density?: ContentCardDensity
  children?: ReactNode
}

function headingAriaLabel(entity: EntitySummaryModel, fallback: string): string {
  return typeof entity.heading === 'string' ? entity.heading : fallback
}

function withDisabledReason(
  entity: EntitySummaryModel,
  addDisabledReason: string | undefined,
): EntitySummaryModel {
  if (!addDisabledReason) return entity
  const status: EntitySummaryStatusItem[] = [
    ...(entity.status ?? []),
    { kind: 'text', label: addDisabledReason, variant: 'muted' },
  ]
  return { ...entity, status }
}

export function AddPendingDisclosureCard({
  itemId,
  entity,
  addLabel = ADD_PENDING_DISCLOSURE_ADD_LABEL,
  addDisabled = false,
  addDisabledReason,
  expanded: expandedOverride,
  onAdd,
  onCollapse,
  trailing,
  density = 'compact',
  children,
}: AddPendingDisclosureCardProps) {
  const disclosure = useAddPendingDisclosure()
  const expanded = expandedOverride ?? disclosure?.expandedItemId === itemId
  const resolvedEntity = addDisabled ? withDisabledReason(entity, addDisabledReason) : entity

  const expand = () => {
    if (addDisabled) return
    onAdd?.()
    disclosure?.expandItem(itemId)
  }

  const collapse = () => {
    onCollapse?.()
    disclosure?.collapseItem()
  }

  const resolvedTrailing =
    trailing ??
    ({
      kind: 'action',
      content: (
        <Button
          type="button"
          variant="outline"
          size="sm"
          density="compact"
          disabled={addDisabled}
          aria-label={
            addDisabled && addDisabledReason ? `${addLabel}. ${addDisabledReason}` : addLabel
          }
          onClick={expand}
        >
          {addLabel}
        </Button>
      ),
    } satisfies EntityItemTrailing)

  if (!expanded) {
    return (
      <ContentEntityCard entity={resolvedEntity} trailing={resolvedTrailing} density={density} />
    )
  }

  return (
    <DisclosureEntityCard
      itemId={itemId}
      toolbarAriaLabel={headingAriaLabel(entity, itemId)}
      entity={resolvedEntity}
      trailing={resolvedTrailing}
      density={density}
      collapsed={false}
      onToggleCollapse={collapse}
    >
      {children}
    </DisclosureEntityCard>
  )
}
