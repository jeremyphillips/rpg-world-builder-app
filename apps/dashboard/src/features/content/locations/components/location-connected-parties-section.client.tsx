'use client'

import * as React from 'react'

import type {
  CharacterLocationConnectionKind,
  LocationConnectedPartyRow,
  LocationConnectedPartySectionGroup,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  getCharacterLocationConnectionLabel,
  getOrganizationLocationConnectionFamily,
  getOrganizationLocationConnectionLabel,
} from '@rpg/contracts'

import { LocationConnectedPartiesSectionHeader } from './location-connected-parties-section-header.client'
import {
  LocationPeopleAndOrganizationsSectionBody,
  type PeopleKindSlot,
} from './location-people-and-organizations-section.client'
import { LocationTerritorialAuthoritySectionBody } from './location-territorial-authority-section.client'
import {
  TERRITORIAL_AUTHORITY_SECTION_EMPTY,
  TERRITORIAL_AUTHORITY_SECTION_HEADING,
  TERRITORIAL_AUTHORITY_SECTION_HELPER,
} from '../lib/location-connection-surface-copy'

export const LOCATION_CONNECTED_PARTIES_SECTION_LABELS: Record<
  LocationConnectedPartySectionGroup,
  string
> = {
  territorial_authority: TERRITORIAL_AUTHORITY_SECTION_HEADING,
  people_and_organizations: 'People & organizations',
}

export const LOCATION_CONNECTED_PARTIES_SECTION_HELPERS: Record<
  LocationConnectedPartySectionGroup,
  string
> = {
  territorial_authority: TERRITORIAL_AUTHORITY_SECTION_HELPER,
  people_and_organizations:
    'Characters and organizations with ownership, occupancy, operations, or geographic presence here.',
}

export const LOCATION_CONNECTED_PARTIES_EMPTY_TEXT: Record<
  LocationConnectedPartySectionGroup,
  string
> = {
  territorial_authority: TERRITORIAL_AUTHORITY_SECTION_EMPTY,
  people_and_organizations: 'No people or organizations linked yet.',
}

export type LocationConnectedPartyEditTarget = {
  relationshipId: string
  subjectType: LocationConnectedPartyRow['subject']['type']
  subjectId: string
  kind: string
}

export type LocationConnectedPartiesSectionProps = {
  campaignId: string
  sectionGroup: LocationConnectedPartySectionGroup
  rows: readonly LocationConnectedPartyRow[]
  peopleKindSlots?: readonly PeopleKindSlot[]
  canManage?: boolean
  showEmptySection?: boolean
  onAddOrganizationKind?: (kind: OrganizationLocationConnectionKind) => void
  onAddCharacterKind?: (kind: CharacterLocationConnectionKind) => void
  onAddTerritorialKind?: (kind: OrganizationLocationConnectionKind) => void
  isMutationPending?: boolean
  pendingRelationshipId?: string
  onEditConnection?: (input: LocationConnectedPartyEditTarget) => void
  onChangeTerritorialKind?: (input: LocationConnectedPartyEditTarget) => void
  onReplaceTerritorialOrganization?: (input: LocationConnectedPartyEditTarget) => void
  onRemoveConnection?: (input: {
    relationshipId: string
    subjectType: LocationConnectedPartyRow['subject']['type']
    subjectId: string
  }) => Promise<void>
  canEditRow?: (row: LocationConnectedPartyRow) => boolean
  canRemoveRow?: (row: LocationConnectedPartyRow) => boolean
}

export function buildPeopleKindSlots(input: {
  organizationKinds: readonly OrganizationLocationConnectionKind[]
  characterKinds: readonly CharacterLocationConnectionKind[]
}): PeopleKindSlot[] {
  const slots: PeopleKindSlot[] = []

  for (const kind of input.organizationKinds) {
    if (getOrganizationLocationConnectionFamily(kind) === 'territorial_authority') {
      continue
    }
    slots.push({
      subjectType: 'organization',
      kind,
      heading: getOrganizationLocationConnectionLabel(kind),
    })
  }

  for (const kind of input.characterKinds) {
    slots.push({
      subjectType: 'character',
      kind,
      heading: getCharacterLocationConnectionLabel(kind),
    })
  }

  return slots
}

export function LocationConnectedPartiesSection({
  campaignId,
  sectionGroup,
  rows,
  peopleKindSlots = [],
  canManage = false,
  showEmptySection = true,
  onAddOrganizationKind,
  onAddCharacterKind,
  onAddTerritorialKind,
  isMutationPending: _isMutationPending = false,
  pendingRelationshipId: _pendingRelationshipId,
  onEditConnection,
  onChangeTerritorialKind,
  onReplaceTerritorialOrganization,
  onRemoveConnection,
  canEditRow,
  canRemoveRow,
}: LocationConnectedPartiesSectionProps) {
  const sectionRows = React.useMemo(
    () => rows.filter((row) => row.sectionGroup === sectionGroup),
    [rows, sectionGroup],
  )

  if (!showEmptySection && sectionRows.length === 0) {
    return null
  }

  const hasPeopleContent =
    sectionGroup === 'people_and_organizations' &&
    (sectionRows.length > 0 || (canManage && peopleKindSlots.length > 0))

  return (
    <section
      className="space-y-4"
      aria-labelledby={`location-connected-parties-${sectionGroup}-heading`}
    >
      <LocationConnectedPartiesSectionHeader
        sectionGroup={sectionGroup}
        canManage={canManage}
        hasRows={sectionRows.length > 0}
      />

      {sectionGroup === 'territorial_authority' ? (
        sectionRows.length > 0 || canManage ? (
          <LocationTerritorialAuthoritySectionBody
            campaignId={campaignId}
            rows={sectionRows}
            canManage={canManage}
            onAddKind={onAddTerritorialKind}
            onChangeKind={onChangeTerritorialKind}
            onReplaceOrganization={onReplaceTerritorialOrganization}
            onRemoveConnection={onRemoveConnection}
          />
        ) : null
      ) : hasPeopleContent ? (
        <LocationPeopleAndOrganizationsSectionBody
          campaignId={campaignId}
          rows={sectionRows}
          kindSlots={peopleKindSlots}
          canManage={canManage}
          onAddOrganizationKind={onAddOrganizationKind}
          onAddCharacterKind={onAddCharacterKind}
          onEditConnection={onEditConnection}
          onRemoveConnection={onRemoveConnection}
          canEditRow={canEditRow}
          canRemoveRow={canRemoveRow}
        />
      ) : null}
    </section>
  )
}
