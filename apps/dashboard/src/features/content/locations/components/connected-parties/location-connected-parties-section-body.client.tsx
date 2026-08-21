'use client'

import type {
  Location,
  LocationConnectedPartyRow,
  LocationConnectedPartySectionGroup,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'

import type { RelationshipCandidateSet } from '../../../lib/relationship/location-connection/location-connection-alternatives'
import {
  LocationPeopleAndOrganizationsSectionBody,
  type LocationPeopleMutationContext,
} from './location-people-and-organizations-section.client'
import {
  LocationTerritorialAuthoritySectionBody,
  type LocationTerritorialMutationContext,
} from './location-territorial-authority-section.client'
import type { PeopleKindSlot } from '../../lib/connected-parties/location-connected-parties-people-kind-slots'
import {
  LOCATION_CONNECTED_PARTIES_EMPTY_TEXT,
  LOCATION_CONNECTED_PARTIES_SECTION_HELPERS,
  LOCATION_CONNECTED_PARTIES_SECTION_LABELS,
} from '../../lib/connected-parties/location-connected-parties-section-copy'
import type { LocationConnectedPartyCharacterOption } from '../../lib/connected-parties/location-connected-party-character-options.lib'
import type { LocationConnectedPartyEditTarget } from './location-connected-parties-section.client'

type LocationConnectedPartiesSectionBodyProps = {
  campaignId: string
  sectionGroup: LocationConnectedPartySectionGroup
  sectionRows: readonly LocationConnectedPartyRow[]
  sectionHeadingId: string
  peopleKindSlots: readonly PeopleKindSlot[]
  charactersById: ReadonlyMap<string, LocationConnectedPartyCharacterOption>
  canManage: boolean
  canAddToPeopleSection?: boolean
  peopleMutationContext?: LocationPeopleMutationContext
  territorialMutationContext?: LocationTerritorialMutationContext
  onAddPeopleSection?: () => void
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
  charactersById,
  canManage,
  canAddToPeopleSection,
  peopleMutationContext,
  territorialMutationContext,
  onAddPeopleSection,
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
        mutationContext={
          territorialMutationContext ?? {
            location: { id: '', campaignId: '', name: '', slug: '', kind: 'region' } as Location,
            rows: sectionRows,
            organizationCandidates: {
              items: [],
              isAuthoritativeDomainSet: false,
            } satisfies RelationshipCandidateSet<{ id: string; name: string }>,
          }
        }
        onAddKind={onAddTerritorialKind}
        onChangeKind={onChangeTerritorialKind}
        onReplaceOrganization={onReplaceTerritorialOrganization}
        onRemoveConnection={onRemoveConnection}
        canEditRow={canEditRow}
        canRemoveRow={canRemoveRow}
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
      charactersById={charactersById}
      canManage={canManage}
      canAddToSection={canAddToPeopleSection}
      heading={LOCATION_CONNECTED_PARTIES_SECTION_LABELS.people_and_organizations}
      headingId={sectionHeadingId}
      helper={
        canManage ? LOCATION_CONNECTED_PARTIES_SECTION_HELPERS.people_and_organizations : undefined
      }
      sectionEmpty={LOCATION_CONNECTED_PARTIES_EMPTY_TEXT.people_and_organizations}
      mutationContext={
        peopleMutationContext ?? {
          location: { id: '', campaignId: '', name: '', slug: '', kind: 'region' } as Location,
          rows: sectionRows,
        }
      }
      onAddPeopleSection={onAddPeopleSection}
      onEditConnection={onEditConnection}
      onRemoveConnection={onRemoveConnection}
      canEditRow={canEditRow}
      canRemoveRow={canRemoveRow}
    />
  )
}
