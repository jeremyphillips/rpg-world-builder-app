import * as React from 'react'

import { getErrorMessage, type Location } from '@rpg/contracts'

import { useLocations } from '@/features/content'

import type { ResidenceLocationPickerItem } from '../components/connections/picker/residence-location-picker-drawer.types'
import { useCharacterRelationshipMutations } from './use-character-relationship-mutations'
import { filterResidenceEligibleLocations } from '../lib/connections/residence-location-connection.lib'
import { resolveCharacterLocationsQueryStatus } from '../lib/relationship/character-locations-query-status.lib'
import type { CharacterRelationshipSubjectKind } from '../lib/invalidate-character-relationship-queries'
import { useCharacterRelationships } from './use-character-relationships'

function toPickerItems(
  locations: readonly Location[],
  selectedLocationIds: ReadonlySet<string>,
): ResidenceLocationPickerItem[] {
  return filterResidenceEligibleLocations(locations).map((location) => ({
    location,
    selected: selectedLocationIds.has(location.id),
  }))
}

function rethrowCanonicalized(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error, fallback))
}

export function useCharacterResidenceSheet(input: {
  campaignId: string
  characterId: string
  canEdit: boolean
  subjectKind: CharacterRelationshipSubjectKind
}) {
  const { campaignId, characterId, canEdit, subjectKind } = input
  const relationshipsQuery = useCharacterRelationships(campaignId, characterId, {
    kinds: ['resides_at'],
    limit: 50,
  })
  const locationsQuery = useLocations(canEdit ? campaignId : undefined)
  const mutations = useCharacterRelationshipMutations(campaignId, {
    characters: [{ characterId, subjectKind }],
  })

  const residenceProjections = React.useMemo(
    () => relationshipsQuery.data?.items ?? [],
    [relationshipsQuery.data?.items],
  )

  const selectedLocationIds = React.useMemo(
    () =>
      new Set(
        residenceProjections
          .map((row) => (row.target?.type === 'location' ? row.target.id : undefined))
          .filter((locationId): locationId is string => Boolean(locationId)),
      ),
    [residenceProjections],
  )

  const locationsQueryStatus = React.useMemo(
    () =>
      resolveCharacterLocationsQueryStatus({
        campaignId: canEdit ? campaignId : undefined,
        isPending: locationsQuery.isPending,
        isError: locationsQuery.isError,
        error: locationsQuery.error,
        hasData: locationsQuery.data !== undefined,
      }),
    [
      campaignId,
      canEdit,
      locationsQuery.data,
      locationsQuery.error,
      locationsQuery.isError,
      locationsQuery.isPending,
    ],
  )

  const pickerItems = React.useMemo(() => {
    if (locationsQueryStatus.status !== 'success') return []
    return toPickerItems(locationsQuery.data ?? [], selectedLocationIds)
  }, [locationsQuery.data, locationsQueryStatus.status, selectedLocationIds])

  const handleAdd = React.useCallback(
    async (locationId: string, idempotencyKey: string) => {
      try {
        const { relationship } = await mutations.createRelationship({
          idempotencyKey,
          relationship: {
            kind: 'resides_at',
            characterId,
            locationId,
          },
        })
        return { relationshipId: relationship.id }
      } catch (error) {
        rethrowCanonicalized(error, 'Could not add this residence.')
      }
    },
    [characterId, mutations],
  )

  const handleRemove = React.useCallback(
    async (relationshipId: string, expectedRevision: number, _locationId: string) => {
      try {
        await mutations.deleteRelationship(relationshipId, { expectedRevision })
      } catch (error) {
        rethrowCanonicalized(error, 'Could not remove this residence.')
      }
    },
    [mutations],
  )

  return {
    isBootstrapping:
      (relationshipsQuery.isPending && relationshipsQuery.data === undefined) ||
      (canEdit && locationsQuery.isPending && locationsQuery.data === undefined),
    residenceProjections,
    locations: locationsQuery.data ?? [],
    pickerItems,
    locationsQueryStatus,
    handleAdd,
    handleRemove,
  }
}
