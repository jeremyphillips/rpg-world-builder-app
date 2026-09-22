import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateCharacterLocationConnectionInput } from '@rpg/contracts'

import {
  createCharacterLocationConnection,
  deleteCharacterLocationConnection,
} from '../api/character-location-connection-client'
import { invalidateCharacterLocationConnectionQueries } from '../lib/invalidate-character-location-connection-queries'
import type { CharacterOrganizationMembershipSubjectKind } from '../lib/invalidate-character-organization-membership-queries'

export function useCharacterResidenceMutations(
  campaignId: string,
  characterId: string,
  subjectKind: CharacterOrganizationMembershipSubjectKind,
) {
  const queryClient = useQueryClient()

  const invalidate = async (locationIds: readonly string[] = []) => {
    await invalidateCharacterLocationConnectionQueries(queryClient, {
      campaignId,
      characterId,
      subjectKind,
      locationIds,
    })
  }

  const createMutation = useMutation({
    mutationFn: (input: CreateCharacterLocationConnectionInput) =>
      createCharacterLocationConnection(campaignId, characterId, input),
    onSuccess: async (_result, variables) => {
      await invalidate([variables.locationId])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ connectionId }: { connectionId: string; locationId: string }) =>
      deleteCharacterLocationConnection(campaignId, characterId, connectionId),
    onSuccess: async (_result, variables) => {
      await invalidate([variables.locationId])
    },
  })

  return {
    addResidence: (input: CreateCharacterLocationConnectionInput) =>
      createMutation.mutateAsync(input),
    removeResidence: (connectionId: string, locationId: string) =>
      deleteMutation.mutateAsync({ connectionId, locationId }),
    isPending: createMutation.isPending || deleteMutation.isPending,
  }
}
