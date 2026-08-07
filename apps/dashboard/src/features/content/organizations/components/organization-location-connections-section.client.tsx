'use client'

import * as React from 'react'

import type {
  OrganizationLocationConnectionFamily,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import { Button, Heading, SemanticText, Text } from '@rpg/ui'

import {
  formatLocationConnectionsCount,
  ORGANIZATION_SECTION_LABELS,
  type OrganizationLocationConnectionsViewModel,
} from '../lib/organization-display'
import {
  groupOrganizationLocationConnections,
  ORGANIZATION_LOCATION_CONNECTION_FAMILY_LABELS,
} from '../lib/build-organization-location-connection-cards'
import { resolveOrganizationForwardFamilySurfaceCopy } from '../lib/organization-location-connection-surface-copy'
import {
  OrganizationLocationConnectionRelationshipRow,
  type OrganizationLocationConnectionMutationContext,
} from './organization-location-connection-relationship-row.client'
import { DetailSectionPanel } from '../../lib/detail/detail-section-panel.client'
import { RelationshipFieldGroupRow } from '../../lib/relationship/relationship-field-group-row.client'
import { RelationshipEmptyInlineRow } from '../../lib/relationship/relationship-empty-inline-row.client'

export const ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR =
  'Could not load organization location connections.'

export const ORGANIZATION_LOCATION_CONNECTION_MUTATION_ERROR =
  'Could not update location connections for this organization.'

export const ORGANIZATION_LOCATION_CONNECTIONS_SECTION_HELPER =
  'Link this organization to sites and facilities, geographic areas, or territories where it has presence or authority.'

const ORGANIZATION_LOCATION_CONNECTION_FAMILY_ORDER: OrganizationLocationConnectionFamily[] = [
  'territorial_authority',
  'geographic_presence',
  'site',
]

export type OrganizationLocationConnectionEditTarget = {
  connectionId: string
  locationId: string
  kind: OrganizationLocationConnectionKind
}

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
    <section aria-labelledby="organization-location-connections-heading" className="space-y-4">
      <div className="space-y-1">
        <Heading variant="group" as="h2" id="organization-location-connections-heading">
          {ORGANIZATION_SECTION_LABELS.locationConnections}
        </Heading>
        {canManage ? (
          <Text variant="muted">{ORGANIZATION_LOCATION_CONNECTIONS_SECTION_HELPER}</Text>
        ) : null}
      </div>

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
          {total > 0 ? <Text variant="muted">{formatLocationConnectionsCount(total)}</Text> : null}
          {familiesToRender.map((family) => {
            const familyGroup = populatedFamilyMap.get(family)
            const familyCopy = resolveOrganizationForwardFamilySurfaceCopy(family)
            const familyAddEnabled = canManage && Boolean(canAddToFamily[family])

            return (
              <DetailSectionPanel
                key={family}
                heading={ORGANIZATION_LOCATION_CONNECTION_FAMILY_LABELS[family]}
                headingId={`organization-location-connections-${family}-heading`}
                headingAs="h3"
              >
                {familyGroup && familyGroup.kindGroups.length > 0 ? (
                  <>
                    {familyGroup.kindGroups.map((kindGroup) => (
                      <RelationshipFieldGroupRow key={kindGroup.kind} eyebrow={kindGroup.kindLabel}>
                        <ul className="space-y-1">
                          {kindGroup.items.map((item) => (
                            <li key={item.connectionId}>
                              <OrganizationLocationConnectionRelationshipRow
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
                            </li>
                          ))}
                        </ul>
                      </RelationshipFieldGroupRow>
                    ))}
                    {familyAddEnabled ? (
                      <div className="px-4 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          density="compact"
                          onClick={() => onAddFamily?.(family)}
                        >
                          + {familyCopy.add}
                        </Button>
                      </div>
                    ) : null}
                  </>
                ) : canManage ? (
                  <div className="px-4 py-2">
                    <RelationshipEmptyInlineRow
                      emptyLabel={familyCopy.empty}
                      addLabel={familyAddEnabled ? familyCopy.add : undefined}
                      onAdd={familyAddEnabled ? () => onAddFamily?.(family) : undefined}
                    />
                  </div>
                ) : null}
              </DetailSectionPanel>
            )
          })}
        </div>
      )}
    </section>
  )
}
