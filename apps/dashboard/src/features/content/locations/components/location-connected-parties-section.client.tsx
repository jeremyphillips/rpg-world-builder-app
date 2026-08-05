'use client'

import * as React from 'react'

import type { LocationConnectedPartyRow, LocationConnectedPartySectionGroup } from '@rpg/contracts'
import { Heading } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import type {
  LocationInverseOrganizationAddAffordance,
  OrganizationConnectionDrawerIntent,
} from '../../lib/location-connection-drawer-intent'

import { LocationConnectedPartiesSectionHeader } from './location-connected-parties-section-header.client'
import { LocationConnectedPartyRowCard } from './location-connected-party-row-card.client'

export const LOCATION_CONNECTED_PARTIES_SECTION_LABELS: Record<
  LocationConnectedPartySectionGroup,
  string
> = {
  territorial_authority: 'Territorial Authority',
  people_and_organizations: 'People & organizations',
}

export const LOCATION_CONNECTED_PARTIES_SECTION_HELPERS: Record<
  LocationConnectedPartySectionGroup,
  string
> = {
  territorial_authority: 'Organizations that govern, control, or claim this location.',
  people_and_organizations:
    'Characters and organizations with ownership, occupancy, operations, or geographic presence here.',
}

export const LOCATION_CONNECTED_PARTIES_EMPTY_TEXT: Record<
  LocationConnectedPartySectionGroup,
  string
> = {
  territorial_authority: 'No territorial authority linked yet.',
  people_and_organizations: 'No people or organizations linked yet.',
}

export type LocationConnectedPartyEditTarget = {
  relationshipId: string
  subjectType: LocationConnectedPartyRow['subject']['type']
  subjectId: string
  kind: string
}

function subjectDetailHref(
  campaignId: string,
  subject: LocationConnectedPartyRow['subject'],
): string | undefined {
  if (subject.type === 'character') {
    return ROUTES.campaign.characters.detail(campaignId, subject.id)
  }
  return ROUTES.content.organizations.detail(campaignId, subject.id)
}

function subjectSummary(subject: LocationConnectedPartyRow['subject']): string {
  return subject.type === 'character' ? 'Character' : 'Organization'
}

export type LocationConnectedPartiesSectionProps = {
  campaignId: string
  sectionGroup: LocationConnectedPartySectionGroup
  rows: readonly LocationConnectedPartyRow[]
  canManage?: boolean
  showEmptySection?: boolean
  organizationAddAffordances?: readonly LocationInverseOrganizationAddAffordance[]
  onAddOrganization?: (intent: OrganizationConnectionDrawerIntent) => void
  onAddCharacter?: () => void
  isMutationPending?: boolean
  pendingRelationshipId?: string
  onEditConnection?: (input: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => Promise<void>
  canEditRow?: (row: LocationConnectedPartyRow) => boolean
  canRemoveRow?: (row: LocationConnectedPartyRow) => boolean
}

export function LocationConnectedPartiesSection({
  campaignId,
  sectionGroup,
  rows,
  canManage = false,
  showEmptySection = true,
  organizationAddAffordances,
  onAddOrganization,
  onAddCharacter,
  isMutationPending = false,
  pendingRelationshipId,
  onEditConnection,
  onRemoveConnection,
  canEditRow,
  canRemoveRow,
}: LocationConnectedPartiesSectionProps) {
  const sectionRows = React.useMemo(
    () => rows.filter((row) => row.sectionGroup === sectionGroup),
    [rows, sectionGroup],
  )

  const groupedRows = React.useMemo(() => {
    const groups = new Map<string, LocationConnectedPartyRow[]>()
    for (const row of sectionRows) {
      const existing = groups.get(row.label) ?? []
      existing.push(row)
      groups.set(row.label, existing)
    }
    return groups
  }, [sectionRows])

  if (!showEmptySection && sectionRows.length === 0) {
    return null
  }

  return (
    <section
      className="space-y-4"
      aria-labelledby={`location-connected-parties-${sectionGroup}-heading`}
    >
      <LocationConnectedPartiesSectionHeader
        sectionGroup={sectionGroup}
        canManage={canManage}
        hasRows={sectionRows.length > 0}
        organizationAddAffordances={organizationAddAffordances}
        onAddOrganization={onAddOrganization}
        onAddCharacter={onAddCharacter}
      />

      {sectionRows.length > 0 ? (
        <div className="space-y-6">
          {[...groupedRows.entries()].map(([relationshipLabel, relationshipRows]) => (
            <div key={relationshipLabel} className="space-y-2">
              <Heading variant="label" as="h3">
                {relationshipLabel}
              </Heading>
              <ul className="space-y-2">
                {relationshipRows.map((row) => {
                  const href = subjectDetailHref(campaignId, row.subject)
                  const isPending = pendingRelationshipId === row.relationshipId
                  const rowCanEdit = canManage && onEditConnection && (canEditRow?.(row) ?? true)
                  const rowCanRemove =
                    canManage && onRemoveConnection && (canRemoveRow?.(row) ?? true)

                  return (
                    <li key={row.relationshipId}>
                      <LocationConnectedPartyRowCard
                        campaignId={campaignId}
                        row={row}
                        href={href}
                        subjectSummary={subjectSummary(row.subject)}
                        canEdit={Boolean(rowCanEdit)}
                        canRemove={Boolean(rowCanRemove)}
                        isPending={isPending}
                        isMutationPending={isMutationPending}
                        onEditConnection={onEditConnection}
                        onRemoveConnection={onRemoveConnection}
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
