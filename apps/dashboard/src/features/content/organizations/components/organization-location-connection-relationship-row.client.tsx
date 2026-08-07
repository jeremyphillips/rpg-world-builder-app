'use client'

import { useNavigate } from 'react-router-dom'

import type {
  Location,
  OrganizationLocationConnectionEdgeAtLocation,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import { Badge } from '@rpg/ui'

import { CrossContentRelationshipRow } from '../../lib/relationship/cross-content-relationship-row.client'
import {
  isRelationshipMutationActionVisible,
  resolveRelationshipAlternatives,
  type RelationshipCandidateSet,
} from '../../lib/relationship/relationship-alternatives'
import {
  buildRelationshipOverflowActions,
  type RelationshipOverflowActionId,
} from '../../lib/relationship/resolve-relationship-overflow-actions'
import type { OrganizationLocationConnectionPreviewItem } from '../lib/organization-display'
import { resolveOrganizationForwardOverflowLabels } from '../lib/organization-location-connection-surface-copy'

export type OrganizationLocationConnectionMutationContext = {
  subjectOrganizationId: string
  locationCandidates: RelationshipCandidateSet<Location>
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>
  edgesByLocationId?: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >
  occupancyLoaded?: boolean
}

export function buildOrganizationLocationConnectionOverflowActions(input: {
  item: OrganizationLocationConnectionPreviewItem
  canManage: boolean
  isMutationPending?: boolean
  mutationContext: OrganizationLocationConnectionMutationContext
  navigate: (path: string) => void
  onChangeKindConnection?: (connection: {
    connectionId: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }) => void
  onChangeTargetConnection?: (connection: {
    connectionId: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }) => void
  onRemoveConnection?: (input: { connectionId: string; locationId: string }) => Promise<void>
}) {
  const resolved = resolveRelationshipAlternatives({
    surface: 'organization_forward',
    canManage: input.canManage,
    occupancyLoaded: input.mutationContext.occupancyLoaded,
    relationship: {
      connectionId: input.item.connectionId,
      locationId: input.item.locationId,
      kind: input.item.kind,
      subjectOrganizationId: input.mutationContext.subjectOrganizationId,
    },
    locationCandidates: input.mutationContext.locationCandidates,
    connections: input.mutationContext.connections,
    edgesByLocationId: input.mutationContext.edgesByLocationId,
  })

  const labels = resolveOrganizationForwardOverflowLabels(input.item.family)
  const connectionTarget = {
    connectionId: input.item.connectionId,
    locationId: input.item.locationId,
    kind: input.item.kind,
  }

  const handlers: Partial<Record<RelationshipOverflowActionId, () => void>> = {
    view: () => input.navigate(input.item.detailHref),
  }

  if (
    isRelationshipMutationActionVisible(resolved.capabilities, 'changeKind') &&
    input.onChangeKindConnection
  ) {
    handlers.changeKind = () => input.onChangeKindConnection?.(connectionTarget)
  }

  if (
    isRelationshipMutationActionVisible(resolved.capabilities, 'changeTarget') &&
    input.onChangeTargetConnection
  ) {
    handlers.changeTarget = () => input.onChangeTargetConnection?.(connectionTarget)
  }

  if (resolved.capabilities.remove?.supported && input.onRemoveConnection) {
    handlers.remove = () => {
      if (input.isMutationPending) return
      void input.onRemoveConnection?.({
        connectionId: input.item.connectionId,
        locationId: input.item.locationId,
      })
    }
  }

  return buildRelationshipOverflowActions({
    capabilities: resolved.capabilities,
    labels: {
      view: labels.viewLocation,
      changeKind: labels.changeKind,
      changeTarget: labels.changeTarget,
      remove: labels.remove,
    },
    handlers,
  })
}

export type OrganizationLocationConnectionRelationshipRowProps = {
  item: OrganizationLocationConnectionPreviewItem
  canManage: boolean
  isMutationPending?: boolean
  mutationContext: OrganizationLocationConnectionMutationContext
  onChangeKindConnection?: (connection: {
    connectionId: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }) => void
  onChangeTargetConnection?: (connection: {
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
  mutationContext,
  onChangeKindConnection,
  onChangeTargetConnection,
  onRemoveConnection,
}: OrganizationLocationConnectionRelationshipRowProps) {
  const navigate = useNavigate()

  return (
    <CrossContentRelationshipRow
      heading={item.card.name}
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
        mutationContext,
        navigate,
        onChangeKindConnection,
        onChangeTargetConnection,
        onRemoveConnection,
      })}
      overflowTriggerLabel={`Actions for ${item.card.name}`}
    />
  )
}
