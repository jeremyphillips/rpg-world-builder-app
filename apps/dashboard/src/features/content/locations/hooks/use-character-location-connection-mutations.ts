import { useMutation, useQueryClient } from '@tanstack/react-query'

import type {
  CreateCharacterLocationConnectionInput,
  CharacterLocationConnectionKind,
  UpdateCharacterLocationConnectionInput,
} from '@rpg/contracts'

import { invalidateLocationConnectionQueries } from '../../lib/invalidate-location-connection-queries'
import {
  createCharacterLocationConnection,
  deleteCharacterLocationConnection,
  updateCharacterLocationConnection,
} from '../api/character-location-connection-client'

export function useCharacterLocationConnectionMutations(campaignId: string, characterId: string) {
  const queryClient = useQueryClient()

  const invalidate = async (locationIds: readonly string[] = []) => {
    await invalidateLocationConnectionQueries(queryClient, {
      campaignId,
      characterId,
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

  const updateMutation = useMutation({
    mutationFn: ({
      connectionId,
      input,
    }: {
      connectionId: string
      input: UpdateCharacterLocationConnectionInput
      previousLocationId: string
    }) => updateCharacterLocationConnection(campaignId, characterId, connectionId, input),
    onSuccess: async (_result, variables) => {
      const nextLocationId = variables.input.locationId ?? variables.previousLocationId
      const locationIds =
        nextLocationId === variables.previousLocationId
          ? [variables.previousLocationId]
          : [variables.previousLocationId, nextLocationId]
      await invalidate(locationIds)
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
    addLocationConnection: (locationId: string, kind: CharacterLocationConnectionKind) =>
      createMutation.mutateAsync({ locationId, kind }),
    updateLocationConnection: (
      connectionId: string,
      input: UpdateCharacterLocationConnectionInput,
      previousLocationId: string,
    ) => updateMutation.mutateAsync({ connectionId, input, previousLocationId }),
    removeLocationConnection: (connectionId: string, locationId: string) =>
      deleteMutation.mutateAsync({ connectionId, locationId }),
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    pendingConnectionId: deleteMutation.isPending
      ? deleteMutation.variables?.connectionId
      : updateMutation.isPending
        ? updateMutation.variables?.connectionId
        : undefined,
    error: createMutation.error ?? updateMutation.error ?? deleteMutation.error ?? null,
    resetErrors: () => {
      createMutation.reset()
      updateMutation.reset()
      deleteMutation.reset()
    },
  }
}
