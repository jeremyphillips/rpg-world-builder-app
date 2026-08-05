'use client'

import * as React from 'react'

import { ApiError, canInverseWriteCrossContentRelationship } from '@rpg/contracts'
import { SemanticText, Text } from '@rpg/ui'

import { useCanManageCampaign } from '@/features/campaign'

import { deleteCharacterLocationConnection } from '../api/character-location-connection-client'
import { deleteOrganizationLocationConnection } from '../../organizations/api/organization-location-connection-client'
import { LocationConnectedPartiesSection } from './location-connected-parties-section.client'
import { useLocationConnectedParties } from '../hooks/use-location-connected-parties'
import { locationConnectedPartiesQueryKey } from '../hooks/use-location-connected-parties'
import { useQueryClient } from '@tanstack/react-query'

export const LOCATION_CONNECTED_PARTIES_MUTATION_ERROR =
  'Could not update connected parties for this location.'

export function LocationConnectedPartiesDetailSections({
  campaignId,
  locationId,
}: {
  campaignId: string
  locationId: string
}) {
  const canManage = useCanManageCampaign(campaignId)
  const canWriteInverse =
    canManage && canInverseWriteCrossContentRelationship('character_location_connection')
  const queryClient = useQueryClient()
  const connectedPartiesQuery = useLocationConnectedParties(campaignId, locationId)
  const [mutationError, setMutationError] = React.useState<string | null>(null)
  const [pendingRelationshipId, setPendingRelationshipId] = React.useState<string>()
  const [isMutationPending, setIsMutationPending] = React.useState(false)

  const rows = connectedPartiesQuery.data?.items ?? []

  const handleRemoveConnection = async (input: {
    relationshipId: string
    subjectType: 'character' | 'organization'
    subjectId: string
  }) => {
    if (!canWriteInverse) return

    setMutationError(null)
    setPendingRelationshipId(input.relationshipId)
    setIsMutationPending(true)

    try {
      if (input.subjectType === 'character') {
        await deleteCharacterLocationConnection(campaignId, input.subjectId, input.relationshipId)
      } else {
        await deleteOrganizationLocationConnection(
          campaignId,
          input.subjectId,
          input.relationshipId,
        )
      }

      await queryClient.invalidateQueries({
        queryKey: locationConnectedPartiesQueryKey(campaignId, locationId),
      })
    } catch (error) {
      setMutationError(
        error instanceof ApiError ? error.message : LOCATION_CONNECTED_PARTIES_MUTATION_ERROR,
      )
    } finally {
      setIsMutationPending(false)
      setPendingRelationshipId(undefined)
    }
  }

  if (connectedPartiesQuery.isPending) {
    return <Text variant="muted">Loading connected parties…</Text>
  }

  if (connectedPartiesQuery.isError) {
    return <Text variant="muted">Could not load connected parties for this location.</Text>
  }

  return (
    <div className="space-y-8">
      {mutationError ? <SemanticText tone="destructive">{mutationError}</SemanticText> : null}
      <LocationConnectedPartiesSection
        campaignId={campaignId}
        sectionGroup="territorial_authority"
        rows={rows}
        canManage={canWriteInverse}
        isMutationPending={isMutationPending}
        pendingRelationshipId={pendingRelationshipId}
        onRemoveConnection={canWriteInverse ? handleRemoveConnection : undefined}
      />
      <LocationConnectedPartiesSection
        campaignId={campaignId}
        sectionGroup="people_and_organizations"
        rows={rows}
        canManage={canWriteInverse}
        isMutationPending={isMutationPending}
        pendingRelationshipId={pendingRelationshipId}
        onRemoveConnection={canWriteInverse ? handleRemoveConnection : undefined}
      />
    </div>
  )
}
