'use client'

import * as React from 'react'

import type { OrganizationLocationConnectionKind } from '@rpg/contracts'
import { Button, Heading, SemanticText, Text } from '@rpg/ui'

import {
  formatLocationConnectionsCount,
  ORGANIZATION_SECTION_LABELS,
  type OrganizationLocationConnectionsViewModel,
} from '../lib/organization-display'
import { groupOrganizationLocationConnections } from '../lib/build-organization-location-connection-cards'
import { resolveOrganizationForwardSurfaceCopy } from '../lib/organization-location-connection-surface-copy'
import { OrganizationLocationConnectionRelationshipRow } from './organization-location-connection-relationship-row.client'
import { RelationshipEmptyInlineRow } from '../../lib/relationship/relationship-empty-inline-row.client'

export const ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR =
  'Could not load organization location connections.'

export const ORGANIZATION_LOCATION_CONNECTION_MUTATION_ERROR =
  'Could not update location connections for this organization.'

export const ORGANIZATION_LOCATION_CONNECTIONS_SECTION_HELPER =
  'Link this organization to locations where it has site presence, geographic activity, or territorial authority.'

export type OrganizationLocationConnectionEditTarget = {
  connectionId: string
  locationId: string
  kind: OrganizationLocationConnectionKind
}

export type OrganizationLocationConnectionsSectionProps = {
  locationConnections: OrganizationLocationConnectionsViewModel
  emptyKindSlots?: readonly OrganizationLocationConnectionKind[]
  canManage?: boolean
  showEmptySection?: boolean
  isPending?: boolean
  isError?: boolean
  errorText?: string
  mutationError?: string | null
  isMutationPending?: boolean
  pendingConnectionId?: string
  onAddKind?: (kind: OrganizationLocationConnectionKind) => void
  onEditConnection?: (connection: OrganizationLocationConnectionEditTarget) => void
  onRemoveConnection?: (input: { connectionId: string; locationId: string }) => Promise<void>
}

export function OrganizationLocationConnectionsSection({
  locationConnections,
  emptyKindSlots = [],
  canManage = false,
  showEmptySection = true,
  isPending = false,
  isError = false,
  errorText = ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR,
  mutationError = null,
  isMutationPending = false,
  pendingConnectionId,
  onAddKind,
  onEditConnection,
  onRemoveConnection,
}: OrganizationLocationConnectionsSectionProps) {
  const { previewItems, total, emptyText } = locationConnections

  const groupedFamilies = React.useMemo(
    () =>
      groupOrganizationLocationConnections(previewItems, {
        emptyKindSlots: canManage ? emptyKindSlots : undefined,
      }),
    [canManage, emptyKindSlots, previewItems],
  )

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
      ) : total === 0 && groupedFamilies.length === 0 ? (
        canManage ? (
          <Text variant="muted">{emptyText}</Text>
        ) : null
      ) : (
        <div className="space-y-6">
          {total > 0 ? <Text variant="muted">{formatLocationConnectionsCount(total)}</Text> : null}
          {groupedFamilies.map((familyGroup) => (
            <div key={familyGroup.family} className="space-y-4">
              <Heading variant="label" as="h3">
                {familyGroup.familyLabel}
              </Heading>
              {familyGroup.kindGroups.map((kindGroup) => {
                const copy = resolveOrganizationForwardSurfaceCopy(kindGroup.kind)

                return (
                  <div key={kindGroup.kind} className="space-y-1">
                    <Heading variant="label" as="h4">
                      {kindGroup.kindLabel}
                    </Heading>
                    {kindGroup.items.length > 0 ? (
                      <ul className="space-y-1">
                        {kindGroup.items.map((item) => (
                          <li key={item.connectionId}>
                            <OrganizationLocationConnectionRelationshipRow
                              item={item}
                              canManage={canManage}
                              isMutationPending={
                                isMutationPending && pendingConnectionId === item.connectionId
                              }
                              onEditConnection={onEditConnection}
                              onRemoveConnection={onRemoveConnection}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : canManage ? (
                      <RelationshipEmptyInlineRow
                        emptyLabel={copy.empty}
                        addLabel={copy.add}
                        onAdd={() => onAddKind?.(kindGroup.kind)}
                      />
                    ) : null}
                    {canManage && kindGroup.items.length > 0 ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onAddKind?.(kindGroup.kind)}
                      >
                        {copy.add}
                      </Button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
