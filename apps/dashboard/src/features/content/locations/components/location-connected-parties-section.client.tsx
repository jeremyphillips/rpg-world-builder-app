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
import { LocationConnectedPartiesSectionBody } from './location-connected-parties-section-body.client'
import type { PeopleKindSlot } from './location-people-and-organizations-section.client'
import {
  resolveLocationConnectedPartiesSectionHeadingId,
  usesFieldGroupHeader,
} from '../lib/location-connected-parties-section-layout'

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
        onAddOrganizationKind={onAddOrganizationKind}
        onAddCharacterKind={onAddCharacterKind}
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
