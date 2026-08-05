'use client'

import { useNavigate } from 'react-router-dom'

import type { OrganizationLocationConnectionKind } from '@rpg/contracts'
import { Badge } from '@rpg/ui'

import { CrossContentRelationshipRow } from '../../lib/relationship/cross-content-relationship-row.client'
import type { RelationshipOverflowAction } from '../../lib/relationship/relationship-overflow-menu.client'
import type { OrganizationLocationConnectionPreviewItem } from '../lib/organization-display'

export function buildOrganizationLocationConnectionOverflowActions(input: {
  item: OrganizationLocationConnectionPreviewItem
  canManage: boolean
  isMutationPending?: boolean
  navigate: (path: string) => void
  onEditConnection?: (connection: {
    connectionId: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }) => void
  onRemoveConnection?: (input: { connectionId: string; locationId: string }) => Promise<void>
}): RelationshipOverflowAction[] {
  const actions: RelationshipOverflowAction[] = [
    {
      id: 'view',
      label: 'View location',
      onSelect: () => input.navigate(input.item.detailHref),
    },
  ]

  if (input.canManage && input.onEditConnection) {
    actions.push({
      id: 'change-kind',
      label: 'Change connection type',
      onSelect: () =>
        input.onEditConnection?.({
          connectionId: input.item.connectionId,
          locationId: input.item.locationId,
          kind: input.item.kind,
        }),
    })
  }

  if (input.canManage && input.onRemoveConnection) {
    actions.push({
      id: 'remove',
      label: 'Remove connection',
      destructive: true,
      onSelect: () => {
        if (input.isMutationPending) return
        void input.onRemoveConnection?.({
          connectionId: input.item.connectionId,
          locationId: input.item.locationId,
        })
      },
    })
  }

  return actions
}

export type OrganizationLocationConnectionRelationshipRowProps = {
  item: OrganizationLocationConnectionPreviewItem
  canManage: boolean
  isMutationPending?: boolean
  onEditConnection?: (connection: {
    connectionId: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }) => void
  onRemoveConnection?: (input: { connectionId: string; locationId: string }) => Promise<void>
}

export function OrganizationLocationConnectionRelationshipRow({
  item,
  canManage,
  isMutationPending = false,
  onEditConnection,
  onRemoveConnection,
}: OrganizationLocationConnectionRelationshipRowProps) {
  const navigate = useNavigate()

  return (
    <CrossContentRelationshipRow
      relationshipEyebrow={item.relationshipLabel}
      heading={item.card.name}
      subheading={item.card.summary}
      href={item.detailHref}
      metadata={
        item.locationUnavailable ? (
          <Badge tone="warning" className="mt-1">
            Unavailable
          </Badge>
        ) : undefined
      }
      actions={buildOrganizationLocationConnectionOverflowActions({
        item,
        canManage,
        isMutationPending,
        navigate,
        onEditConnection,
        onRemoveConnection,
      })}
      overflowTriggerLabel={`Actions for ${item.card.name}`}
    />
  )
}
