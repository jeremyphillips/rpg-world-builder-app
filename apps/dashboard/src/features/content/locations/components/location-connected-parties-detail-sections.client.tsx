'use client'

import type { Location } from '@rpg/contracts'
import { SemanticText, Text } from '@rpg/ui'

import { LocationConnectedPartiesDrawers } from './location-connected-parties-drawers.client'
import { LocationConnectedPartiesSection } from './location-connected-parties-section.client'
import { useLocationConnectedPartiesDetail } from '../hooks/use-location-connected-parties-detail.client'

export { LOCATION_CONNECTED_PARTIES_MUTATION_ERROR } from '../hooks/use-location-connected-parties-detail.client'

// fallow-ignore-next-line complexity
export function LocationConnectedPartiesDetailSections({
  campaignId,
  location,
}: {
  campaignId: string
  location: Location
}) {
  const detail = useLocationConnectedPartiesDetail(campaignId, location)

  if (detail.connectedPartiesQuery.isPending) {
    return <Text variant="muted">Loading connected parties…</Text>
  }

  if (detail.connectedPartiesQuery.isError) {
    return <Text variant="muted">Could not load connected parties for this location.</Text>
  }

  if (!detail.showTerritorialSection && !detail.showPeopleSection) {
    return null
  }

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
          onAddOrganization={
            detail.canAddOrganization
              ? () => detail.setOrganizationDrawerState({ mode: 'add' })
              : undefined
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
          onAddOrganization={
            detail.canAddPeopleOrganization
              ? () => detail.setOrganizationDrawerState({ mode: 'add' })
              : undefined
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
