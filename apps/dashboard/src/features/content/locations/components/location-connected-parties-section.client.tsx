'use client'

import * as React from 'react'

import type {
  CharacterLocationConnectionKind,
  Location,
  LocationConnectedPartyRow,
  LocationConnectedPartySectionGroup,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'

import type { RelationshipCandidateSet } from '../../lib/relationship/relationship-alternatives'

import { LocationConnectedPartiesSectionHeader } from './location-connected-parties-section-header.client'
import { LocationConnectedPartiesSectionBody } from './location-connected-parties-section-body.client'
import type { PeopleKindSlot } from '../lib/location-connected-parties-people-kind-slots'
import type { LocationConnectedPartyCharacterOption } from '../lib/location-connected-party-character-options.lib'
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

export type LocationConnectedPartyEditTarget =
  | {
      relationshipId: string
      subjectType: 'organization'
      subjectId: string
      kind: OrganizationLocationConnectionKind
    }
  | {
      relationshipId: string
      subjectType: 'character'
      subjectId: string
      kind: CharacterLocationConnectionKind
    }

/** Builds the typed edit target for a connected-party row, preserving the subject branch. */
export function toLocationConnectedPartyEditTarget(
  row: LocationConnectedPartyRow,
): LocationConnectedPartyEditTarget {
  return row.subjectType === 'organization'
    ? {
        relationshipId: row.relationshipId,
        subjectType: 'organization',
        subjectId: row.subject.id,
        kind: row.kind,
      }
    : {
        relationshipId: row.relationshipId,
        subjectType: 'character',
        subjectId: row.subject.id,
        kind: row.kind,
      }
}

export type LocationConnectedPartiesSectionProps = {
  campaignId: string
  location: Location
  sectionGroup: LocationConnectedPartySectionGroup
  rows: readonly LocationConnectedPartyRow[]
  organizationCandidates?: RelationshipCandidateSet<{ id: string; name: string }>
  peopleKindSlots?: readonly PeopleKindSlot[]
  charactersById?: ReadonlyMap<string, LocationConnectedPartyCharacterOption>
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
  organizationCandidates,
  peopleKindSlots = [],
  charactersById = new Map(),
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
    () => ({
      location,
      rows,
      organizationCandidates: organizationCandidates ?? {
        items: [],
        isAuthoritativeDomainSet: false,
      },
    }),
    [location, organizationCandidates, rows],
  )

  if (!showEmptySection && sectionRows.length === 0) {
    return null
  }

  const sectionHeadingId = resolveLocationConnectedPartiesSectionHeadingId(sectionGroup)
  const showFieldGroupHeader = usesFieldGroupHeader(sectionGroup)

  const body = (
    <LocationConnectedPartiesSectionBody
      campaignId={campaignId}
      sectionGroup={sectionGroup}
      sectionRows={sectionRows}
      sectionHeadingId={sectionHeadingId}
      peopleKindSlots={peopleKindSlots}
      charactersById={charactersById}
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
  )

  if (showFieldGroupHeader) {
    return body
  }

  return (
    <section className="space-y-4" aria-labelledby={sectionHeadingId}>
      <LocationConnectedPartiesSectionHeader
        sectionGroup={sectionGroup}
        canManage={canManage}
        hasRows={sectionRows.length > 0}
      />
      {body}
    </section>
  )
}
