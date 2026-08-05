'use client'

import * as React from 'react'

import { Heading, SemanticText, Text } from '@rpg/ui'

import {
  formatLocationConnectionsCount,
  ORGANIZATION_SECTION_LABELS,
  type OrganizationLocationConnectionsViewModel,
} from '../lib/organization-display'
import { OrganizationLocationConnectionRelationshipRow } from './organization-location-connection-relationship-row.client'

export const ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR =
  'Could not load organization location connections.'

export const ORGANIZATION_LOCATION_CONNECTION_MUTATION_ERROR =
  'Could not update location connections for this organization.'

export const ORGANIZATION_LOCATION_CONNECTIONS_SECTION_HELPER =
  'Link this organization to locations where it has site presence, geographic activity, or territorial authority.'

import type { OrganizationLocationConnectionKind } from '@rpg/contracts'

export type OrganizationLocationConnectionEditTarget = {
  connectionId: string
  locationId: string
  kind: OrganizationLocationConnectionKind
}

export type OrganizationLocationConnectionsSectionProps = {
  locationConnections: OrganizationLocationConnectionsViewModel
  canManage?: boolean
  showEmptySection?: boolean
  isPending?: boolean
  isError?: boolean
  errorText?: string
  mutationError?: string | null
  isMutationPending?: boolean
  pendingConnectionId?: string
  addConnectionAction?: React.ReactNode
  onEditConnection?: (connection: OrganizationLocationConnectionEditTarget) => void
  onRemoveConnection?: (input: { connectionId: string; locationId: string }) => Promise<void>
}

export function OrganizationLocationConnectionsSection({
  locationConnections,
  canManage = false,
  showEmptySection = true,
  isPending = false,
  isError = false,
  errorText = ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR,
  mutationError = null,
  isMutationPending = false,
  pendingConnectionId,
  addConnectionAction,
  onEditConnection,
  onRemoveConnection,
}: OrganizationLocationConnectionsSectionProps) {
  const { previewItems, total, emptyText } = locationConnections

  const groupedItems = React.useMemo(() => {
    const groups = new Map<string, typeof previewItems>()
    for (const item of previewItems) {
      const existing = groups.get(item.familyLabel) ?? []
      existing.push(item)
      groups.set(item.familyLabel, existing)
    }
    return groups
  }, [previewItems])

  if (!showEmptySection && total === 0) {
    return null
  }

  return (
    <section aria-labelledby="organization-location-connections-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Heading variant="group" as="h2" id="organization-location-connections-heading">
            {ORGANIZATION_SECTION_LABELS.locationConnections}
          </Heading>
          {canManage ? (
            <Text variant="muted">{ORGANIZATION_LOCATION_CONNECTIONS_SECTION_HELPER}</Text>
          ) : null}
        </div>
        {canManage && addConnectionAction ? addConnectionAction : null}
      </div>

      {mutationError ? <SemanticText tone="destructive">{mutationError}</SemanticText> : null}

      {isPending ? (
        <Text variant="muted">Loading…</Text>
      ) : isError ? (
        <Text variant="muted">{errorText}</Text>
      ) : total === 0 ? (
        canManage ? (
          <Text variant="muted">{emptyText}</Text>
        ) : null
      ) : (
        <div className="space-y-6">
          <Text variant="muted">{formatLocationConnectionsCount(total)}</Text>
          {[...groupedItems.entries()].map(([familyLabel, items]) => (
            <div key={familyLabel} className="space-y-2">
              <Heading variant="label" as="h3">
                {familyLabel}
              </Heading>
              <ul className="space-y-2">
                {items.map((item) => (
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
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
