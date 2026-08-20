'use client'

import { useNavigate } from 'react-router-dom'

import type {
  Location,
  OrganizationLocationConnectionEdgeAtLocation,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'

import { ENTITY_REPLACEMENT_UNAVAILABLE_LOCATION_HEADING } from '../../../lib/entity-replacement/entity-replacement-current-entity'
import { RelationshipList } from '../../../lib/relationship/list/relationship-list.client'
import {
  isRelationshipMutationActionVisible,
  resolveRelationshipAlternatives,
  type RelationshipCandidateSet,
} from '../../../lib/relationship/list/relationship-alternatives'
import {
  buildRelationshipOverflowActions,
  type RelationshipOverflowActionId,
} from '../../../lib/relationship/list/resolve-relationship-overflow-actions'
import { buildLocationEntityContextPresentation } from '../../../locations/lib/location-display'
import type { OrganizationLocationConnectionPreviewItem } from '../../lib/organization-display'
import { resolveOrganizationForwardOverflowLabels } from '../../lib/location-connections/organization-location-connection-surface-copy'

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
    view: () => {
      const href = input.item.target?.href
      if (href) {
        input.navigate(href)
      }
    },
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

export type OrganizationLocationConnectionListRowProps = {
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

export function OrganizationLocationConnectionListRow({
  item,
  canManage,
  isMutationPending = false,
  mutationContext,
  onChangeKindConnection,
  onChangeTargetConnection,
  onRemoveConnection,
}: OrganizationLocationConnectionListRowProps) {
  const navigate = useNavigate()
  const presentation = item.target
    ? buildLocationEntityContextPresentation(item.target)
    : { heading: ENTITY_REPLACEMENT_UNAVAILABLE_LOCATION_HEADING }

  const actions = buildOrganizationLocationConnectionOverflowActions({
    item,
    canManage,
    isMutationPending,
    mutationContext,
    navigate,
    onChangeKindConnection,
    onChangeTargetConnection,
    onRemoveConnection,
  })

  return (
    <RelationshipList.Row
      title={presentation.heading}
      href={item.target?.href}
      headingSuffix={presentation.headingSuffix}
      description={presentation.supportingText}
      status={
        item.target == null ? [{ kind: 'badge', label: 'Unavailable', tone: 'warning' }] : undefined
      }
      menu={
        actions.length > 0
          ? {
              label: `Actions for ${presentation.heading}`,
              items: actions.map((action) => ({
                id: action.id,
                label: action.label,
                destructive: action.destructive,
                disabled: action.disabled,
                onSelect: action.onSelect,
              })),
            }
          : undefined
      }
    />
  )
}
