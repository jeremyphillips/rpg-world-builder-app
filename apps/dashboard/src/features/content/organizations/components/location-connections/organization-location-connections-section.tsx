import * as React from 'react'

import type { OrganizationLocationConnectionFamily } from '@rpg/contracts'
import { SemanticText, Text } from '@rpg/ui'

import type { OrganizationLocationConnectionsViewModel } from '../../lib/organization-display'
import { groupOrganizationLocationConnections } from '../../lib/location-connections/build-organization-location-connection-cards'
import {
  ORGANIZATION_LOCATION_CONNECTION_FAMILY_ORDER,
  resolveOrganizationForwardFamilyPresentation,
} from '../../lib/location-connections/organization-location-connection-surface-copy'
import type {
  OrganizationLocationConnectionEditTarget,
  OrganizationLocationConnectionMutationContext,
} from '../../lib/location-connections/organization-location-connection-mutation-context'
import { OrganizationLocationConnectionListRow } from './organization-location-connection-list-row'
import { DetailCollectionPanel } from '../../../lib/detail/collection/panel/detail-collection-panel'
import { RelationshipList } from '../../../lib/relationship/list/relationship-list'
import {
  relationshipGroupUsesRootFamilyAdd,
  resolveOrganizationLocationConnectionFamilyPresentation,
} from '../../../lib/relationship/list/relationship-group-presentation'

export const ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR =
  'Could not load organization location connections.'

export type OrganizationLocationConnectionsSectionProps = {
  locationConnections: OrganizationLocationConnectionsViewModel
  visibleFamilies?: readonly OrganizationLocationConnectionFamily[]
  canAddToFamily?: Readonly<Partial<Record<OrganizationLocationConnectionFamily, boolean>>>
  canManage?: boolean
  showEmptySection?: boolean
  isPending?: boolean
  isError?: boolean
  errorText?: string
  mutationError?: string | null
  isMutationPending?: boolean
  pendingConnectionId?: string
  onAddFamily?: (family: OrganizationLocationConnectionFamily) => void
  onChangeKindConnection?: (connection: OrganizationLocationConnectionEditTarget) => void
  onChangeTargetConnection?: (connection: OrganizationLocationConnectionEditTarget) => void
  onRemoveConnection?: (input: { connectionId: string; locationId: string }) => Promise<void>
  mutationContext?: OrganizationLocationConnectionMutationContext
}

export function OrganizationLocationConnectionsSection({
  locationConnections,
  visibleFamilies = [],
  canAddToFamily = {},
  canManage = false,
  showEmptySection = true,
  isPending = false,
  isError = false,
  errorText = ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR,
  mutationError = null,
  isMutationPending = false,
  pendingConnectionId,
  onAddFamily,
  onChangeKindConnection,
  onChangeTargetConnection,
  onRemoveConnection,
  mutationContext,
}: OrganizationLocationConnectionsSectionProps) {
  const { previewItems, total, emptyText } = locationConnections

  const populatedFamilies = React.useMemo(
    () => groupOrganizationLocationConnections(previewItems),
    [previewItems],
  )

  const populatedFamilyMap = React.useMemo(
    () => new Map(populatedFamilies.map((familyGroup) => [familyGroup.family, familyGroup])),
    [populatedFamilies],
  )

  const familiesToRender = React.useMemo(() => {
    const familySet = new Set<OrganizationLocationConnectionFamily>([
      ...populatedFamilies.map((familyGroup) => familyGroup.family),
      ...(canManage ? visibleFamilies : []),
    ])
    return ORGANIZATION_LOCATION_CONNECTION_FAMILY_ORDER.filter((family) => familySet.has(family))
  }, [canManage, populatedFamilies, visibleFamilies])

  if (!showEmptySection && total === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {mutationError ? <SemanticText tone="destructive">{mutationError}</SemanticText> : null}

      {isPending ? (
        <Text variant="muted">Loading…</Text>
      ) : isError ? (
        <Text variant="muted">{errorText}</Text>
      ) : familiesToRender.length === 0 ? (
        canManage ? (
          <Text variant="muted">{emptyText}</Text>
        ) : null
      ) : (
        <div className="space-y-4">
          {familiesToRender.map((family) => {
            const familyGroup = populatedFamilyMap.get(family)
            const familyPresentation = resolveOrganizationForwardFamilyPresentation(family)
            const groupPresentation =
              resolveOrganizationLocationConnectionFamilyPresentation(family)
            const familyAddAtRoot = relationshipGroupUsesRootFamilyAdd(groupPresentation)
            const familyAddEnabled = canManage && Boolean(canAddToFamily[family])
            const familyItemCount =
              familyGroup?.kindGroups.reduce(
                (count, kindGroup) => count + kindGroup.items.length,
                0,
              ) ?? 0
            const addAction =
              familyAddAtRoot && familyAddEnabled
                ? { label: familyPresentation.add, onSelect: () => onAddFamily?.(family) }
                : undefined

            return (
              <DetailCollectionPanel
                key={family}
                heading={familyPresentation.heading}
                headingId={`organization-location-connections-${family}-heading`}
                headingAs="h3"
              >
                <RelationshipList.Root
                  itemCount={familyItemCount}
                  emptyLabel={familyPresentation.empty}
                  action={addAction}
                >
                  {familyGroup?.kindGroups.map((kindGroup) => (
                    <RelationshipList.Group
                      key={kindGroup.kind}
                      label={familyGroup.kindHeading === 'show' ? kindGroup.kindLabel : undefined}
                      itemCount={kindGroup.items.length}
                    >
                      {kindGroup.items.map((item) => (
                        <OrganizationLocationConnectionListRow
                          key={item.connectionId}
                          item={item}
                          canManage={canManage}
                          isMutationPending={
                            isMutationPending && pendingConnectionId === item.connectionId
                          }
                          mutationContext={
                            mutationContext ?? {
                              subjectOrganizationId: '',
                              locationCandidates: {
                                items: [],
                                isAuthoritativeDomainSet: false,
                              },
                              connections: [],
                            }
                          }
                          onChangeKindConnection={onChangeKindConnection}
                          onChangeTargetConnection={onChangeTargetConnection}
                          onRemoveConnection={onRemoveConnection}
                        />
                      ))}
                    </RelationshipList.Group>
                  ))}
                </RelationshipList.Root>
              </DetailCollectionPanel>
            )
          })}
        </div>
      )}
    </div>
  )
}
