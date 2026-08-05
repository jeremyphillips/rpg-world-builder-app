'use client'

import * as React from 'react'

import type { OrganizationLocationConnectionKind } from '@rpg/contracts'
import { Badge, Button, ContentCardRemoveButton, Heading, SemanticText, Text } from '@rpg/ui'

import { ContentEntityCard, ContentEntityCardViewLink } from '../../lib/content-entity-card.client'
import {
  formatLocationConnectionsCount,
  ORGANIZATION_SECTION_LABELS,
  type OrganizationLocationConnectionsViewModel,
} from '../lib/organization-display'

export const ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR =
  'Could not load organization location connections.'

export const ORGANIZATION_LOCATION_CONNECTION_MUTATION_ERROR =
  'Could not update location connections for this organization.'

export type OrganizationLocationConnectionsSectionProps = {
  locationConnections: OrganizationLocationConnectionsViewModel
  canManage?: boolean
  isPending?: boolean
  isError?: boolean
  errorText?: string
  mutationError?: string | null
  isMutationPending?: boolean
  pendingConnectionId?: string
  onRemoveConnection?: (connectionId: string) => Promise<void>
}

export function OrganizationLocationConnectionsSection({
  locationConnections,
  canManage = false,
  isPending = false,
  isError = false,
  errorText = ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR,
  mutationError = null,
  isMutationPending = false,
  pendingConnectionId,
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

  return (
    <section aria-labelledby="organization-location-connections-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Heading variant="group" as="h2" id="organization-location-connections-heading">
          {ORGANIZATION_SECTION_LABELS.locationConnections}
        </Heading>
      </div>

      {mutationError ? <SemanticText tone="destructive">{mutationError}</SemanticText> : null}

      {isPending ? (
        <Text variant="muted">Loading…</Text>
      ) : isError ? (
        <Text variant="muted">{errorText}</Text>
      ) : total === 0 ? (
        <Text variant="muted">{emptyText}</Text>
      ) : (
        <div className="space-y-6">
          <Text variant="muted">{formatLocationConnectionsCount(total)}</Text>
          {[...groupedItems.entries()].map(([familyLabel, items]) => (
            <div key={familyLabel} className="space-y-2">
              <Heading variant="label" as="h3">
                {familyLabel}
              </Heading>
              <ul className="space-y-2">
                {items.map((item) => {
                  const isPendingRow = pendingConnectionId === item.connectionId

                  return (
                    <li key={item.connectionId}>
                      <ContentEntityCard
                        heading={item.card.name}
                        subheading={item.card.summary}
                        surface="outline"
                        headingEndSlot={<ContentEntityCardViewLink href={item.detailHref} />}
                        endSlot={
                          <div className="flex items-center gap-2">
                            {item.locationUnavailable ? (
                              <Badge tone="warning">Unavailable</Badge>
                            ) : null}
                            {canManage && onRemoveConnection ? (
                              <ContentCardRemoveButton
                                label={`${item.card.name} ${item.relationshipLabel}`}
                                onRemove={() => {
                                  if (isMutationPending || isPendingRow) return
                                  void onRemoveConnection(item.connectionId)
                                }}
                              />
                            ) : null}
                          </div>
                        }
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export type OrganizationLocationConnectionAddButtonProps = {
  label?: string
  disabled?: boolean
  onClick?: () => void
}

export function OrganizationLocationConnectionAddButton({
  label = 'Link location',
  disabled = false,
  onClick,
}: OrganizationLocationConnectionAddButtonProps) {
  return (
    <Button type="button" variant="outline" disabled={disabled} onClick={onClick}>
      {label}
    </Button>
  )
}

export type OrganizationLocationConnectionKindPickerProps = {
  value: OrganizationLocationConnectionKind | null
  onChange: (kind: OrganizationLocationConnectionKind) => void
}
