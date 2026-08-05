'use client'

import type { Location } from '@rpg/contracts'
import { SemanticText, Text } from '@rpg/ui'

import { LocationConnectedPartiesDrawers } from './location-connected-parties-drawers.client'
import { LocationConnectedPartiesSection } from './location-connected-parties-section.client'
import { useLocationConnectedPartiesDetail } from '../hooks/use-location-connected-parties-detail.client'

export { LOCATION_CONNECTED_PARTIES_MUTATION_ERROR } from '../hooks/use-location-connected-parties-detail.client'

type DetailState = ReturnType<typeof useLocationConnectedPartiesDetail>

function LocationConnectedPartiesQueryState({ detail }: { detail: DetailState }) {
  if (detail.connectedPartiesQuery.isPending) {
    return <Text variant="muted">Loading connected parties…</Text>
  }

  if (detail.connectedPartiesQuery.isError) {
    return <Text variant="muted">Could not load connected parties for this location.</Text>
  }

  return null
}

// fallow-ignore-next-line complexity
function LocationConnectedPartiesSections({
  campaignId,
  location,
  detail,
}: {
  campaignId: string
  location: Location
  detail: DetailState
}) {
  const sharedSectionProps = {
    campaignId,
    rows: detail.rows,
    canManage: detail.canWriteInverse,
    isMutationPending: detail.isMutationPending,
    pendingRelationshipId: detail.pendingRelationshipId,
    onEditConnection: detail.canWriteInverse ? detail.handleEditConnection : undefined,
    onRemoveConnection: detail.canWriteInverse ? detail.handleRemoveConnection : undefined,
    canEditRow: detail.canEditRow,
    canRemoveRow: detail.canEditRow,
  }

  return (
    <div className="space-y-8">
      {detail.mutationError ? (
        <SemanticText tone="destructive">{detail.mutationError}</SemanticText>
      ) : null}

      {detail.showTerritorialSection ? (
        <LocationConnectedPartiesSection
          {...sharedSectionProps}
          sectionGroup="territorial_authority"
          showEmptySection={
            detail.canManage ||
            detail.rows.some((row) => row.sectionGroup === 'territorial_authority')
          }
          organizationAddAffordances={
            detail.canAddOrganizationInverse ? detail.territorialOrganizationAddAffordances : []
          }
          onAddOrganization={
            detail.canAddOrganizationInverse ? detail.openOrganizationAddDrawer : undefined
          }
        />
      ) : null}

      {detail.showPeopleSection ? (
        <LocationConnectedPartiesSection
          {...sharedSectionProps}
          sectionGroup="people_and_organizations"
          showEmptySection={
            detail.canManage ||
            detail.rows.some((row) => row.sectionGroup === 'people_and_organizations')
          }
          organizationAddAffordances={
            detail.canAddOrganizationInverse ? detail.peopleOrganizationAddAffordances : []
          }
          onAddOrganization={
            detail.canAddOrganizationInverse ? detail.openOrganizationAddDrawer : undefined
          }
          onAddCharacter={
            detail.canAddCharacter
              ? () => detail.setCharacterDrawerState({ mode: 'add' })
              : undefined
          }
        />
      ) : null}

      <LocationConnectedPartiesDrawers location={location} detail={detail} />
    </div>
  )
}

export function LocationConnectedPartiesDetailSections({
  campaignId,
  location,
}: {
  campaignId: string
  location: Location
}) {
  const detail = useLocationConnectedPartiesDetail(campaignId, location)

  if (detail.connectedPartiesQuery.isPending || detail.connectedPartiesQuery.isError) {
    return <LocationConnectedPartiesQueryState detail={detail} />
  }

  if (!detail.showTerritorialSection && !detail.showPeopleSection) {
    return null
  }

  return (
    <LocationConnectedPartiesSections campaignId={campaignId} location={location} detail={detail} />
  )
}
