'use client'

import type {
  CharacterLocationConnectionKind,
  LocationConnectedPartyRow,
  LocationConnectedPartySectionGroup,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'

import {
  LocationPeopleAndOrganizationsSectionBody,
  type PeopleKindSlot,
} from './location-people-and-organizations-section.client'
import { LocationTerritorialAuthoritySectionBody } from './location-territorial-authority-section.client'
import {
  LOCATION_CONNECTED_PARTIES_EMPTY_TEXT,
  LOCATION_CONNECTED_PARTIES_SECTION_HELPERS,
  LOCATION_CONNECTED_PARTIES_SECTION_LABELS,
} from '../lib/location-connected-parties-section-copy'
import type { LocationConnectedPartyEditTarget } from './location-connected-parties-section.client'

type LocationConnectedPartiesSectionBodyProps = {
  campaignId: string
  sectionGroup: LocationConnectedPartySectionGroup
  sectionRows: readonly LocationConnectedPartyRow[]
  sectionHeadingId: string
  peopleKindSlots: readonly PeopleKindSlot[]
  canManage: boolean
  onAddOrganizationKind?: (kind: OrganizationLocationConnectionKind) => void
  onAddCharacterKind?: (kind: CharacterLocationConnectionKind) => void
  onAddTerritorialKind?: (kind: OrganizationLocationConnectionKind) => void
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

export function LocationConnectedPartiesSectionBody({
  campaignId,
  sectionGroup,
  sectionRows,
  sectionHeadingId,
  peopleKindSlots,
  canManage,
  onAddOrganizationKind,
  onAddCharacterKind,
  onAddTerritorialKind,
  onEditConnection,
  onChangeTerritorialKind,
  onReplaceTerritorialOrganization,
  onRemoveConnection,
  canEditRow,
  canRemoveRow,
}: LocationConnectedPartiesSectionBodyProps) {
  if (sectionGroup === 'territorial_authority') {
    if (sectionRows.length === 0 && !canManage) {
      return null
    }

    return (
      <LocationTerritorialAuthoritySectionBody
        campaignId={campaignId}
        rows={sectionRows}
        canManage={canManage}
        showHelper={canManage}
        onAddKind={onAddTerritorialKind}
        onChangeKind={onChangeTerritorialKind}
        onReplaceOrganization={onReplaceTerritorialOrganization}
        onRemoveConnection={onRemoveConnection}
      />
    )
  }

  const hasPeopleContent = sectionRows.length > 0 || (canManage && peopleKindSlots.length > 0)

  if (sectionGroup !== 'people_and_organizations' || !hasPeopleContent) {
    return null
  }

  return (
    <LocationPeopleAndOrganizationsSectionBody
      campaignId={campaignId}
      rows={sectionRows}
      kindSlots={peopleKindSlots}
      canManage={canManage}
      heading={LOCATION_CONNECTED_PARTIES_SECTION_LABELS.people_and_organizations}
      headingId={sectionHeadingId}
      helper={
        canManage ? LOCATION_CONNECTED_PARTIES_SECTION_HELPERS.people_and_organizations : undefined
      }
      sectionEmpty={
        canManage && sectionRows.length === 0
          ? LOCATION_CONNECTED_PARTIES_EMPTY_TEXT.people_and_organizations
          : undefined
      }
      onAddOrganizationKind={onAddOrganizationKind}
      onAddCharacterKind={onAddCharacterKind}
      onEditConnection={onEditConnection}
      onRemoveConnection={onRemoveConnection}
      canEditRow={canEditRow}
      canRemoveRow={canRemoveRow}
    />
  )
}
