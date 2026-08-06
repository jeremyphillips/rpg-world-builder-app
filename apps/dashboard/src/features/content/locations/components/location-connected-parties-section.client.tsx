'use client'

import * as React from 'react'

import type {
  CharacterLocationConnectionKind,
  Location,
  LocationConnectedPartyRow,
  LocationConnectedPartySectionGroup,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'

import { LocationConnectedPartiesSectionHeader } from './location-connected-parties-section-header.client'
import { LocationConnectedPartiesSectionBody } from './location-connected-parties-section-body.client'
import type { PeopleKindSlot } from '../lib/location-connected-parties-people-kind-slots'
import {
  resolveLocationConnectedPartiesSectionHeadingId,
  usesFieldGroupHeader,
} from '../lib/location-connected-parties-section-layout'

export { buildPeopleKindSlots } from '../lib/location-connected-parties-people-kind-slots'
export type { PeopleKindSlot } from '../lib/location-connected-parties-people-kind-slots'

export {
  LOCATION_CONNECTED_PARTIES_EMPTY_TEXT,
  LOCATION_CONNECTED_PARTIES_SECTION_HELPERS,
  LOCATION_CONNECTED_PARTIES_SECTION_LABELS,
} from '../lib/location-connected-parties-section-copy'

export type LocationConnectedPartyEditTarget = {
  relationshipId: string
  subjectType: LocationConnectedPartyRow['subject']['type']
  subjectId: string
  kind: string
}

export type LocationConnectedPartiesSectionProps = {
  campaignId: string
  location: Location
  sectionGroup: LocationConnectedPartySectionGroup
  rows: readonly LocationConnectedPartyRow[]
  organizations?: readonly { id: string; name: string }[]
  peopleKindSlots?: readonly PeopleKindSlot[]
  canManage?: boolean
  showEmptySection?: boolean
  onAddOrganizationKind?: (kind: OrganizationLocationConnectionKind) => void
  onAddCharacterKind?: (kind: CharacterLocationConnectionKind) => void
  onAddPeopleSection?: () => void
  canAddToPeopleSection?: boolean
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

export function LocationConnectedPartiesSection({
  campaignId,
  location,
  sectionGroup,
  rows,
  organizations = [],
  peopleKindSlots = [],
  canManage = false,
  showEmptySection = true,
  onAddOrganizationKind: _onAddOrganizationKind,
  onAddCharacterKind: _onAddCharacterKind,
  onAddPeopleSection,
  canAddToPeopleSection,
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

  const peopleMutationContext = React.useMemo(
    () => ({ location, rows: sectionRows }),
    [location, sectionRows],
  )

  const territorialMutationContext = React.useMemo(
    () => ({ location, rows, organizations }),
    [location, organizations, rows],
  )

  if (!showEmptySection && sectionRows.length === 0) {
    return null
  }

  const sectionHeadingId = resolveLocationConnectedPartiesSectionHeadingId(sectionGroup)
  const showFieldGroupHeader = usesFieldGroupHeader(sectionGroup)

  return (
    <section className="space-y-4" aria-labelledby={sectionHeadingId}>
      {!showFieldGroupHeader ? (
        <LocationConnectedPartiesSectionHeader
          sectionGroup={sectionGroup}
          canManage={canManage}
          hasRows={sectionRows.length > 0}
        />
      ) : null}

      <LocationConnectedPartiesSectionBody
        campaignId={campaignId}
        sectionGroup={sectionGroup}
        sectionRows={sectionRows}
        sectionHeadingId={sectionHeadingId}
        peopleKindSlots={peopleKindSlots}
        canManage={canManage}
        canAddToPeopleSection={canAddToPeopleSection}
        peopleMutationContext={peopleMutationContext}
        territorialMutationContext={territorialMutationContext}
        onAddPeopleSection={onAddPeopleSection}
        onAddTerritorialKind={onAddTerritorialKind}
        onEditConnection={onEditConnection}
        onChangeTerritorialKind={onChangeTerritorialKind}
        onReplaceTerritorialOrganization={onReplaceTerritorialOrganization}
        onRemoveConnection={onRemoveConnection}
        canEditRow={canEditRow}
        canRemoveRow={canRemoveRow}
      />
    </section>
  )
}
