import { useMutation, useQueryClient } from '@tanstack/react-query'

import type {
  CreateCharacterRelationshipCommand,
  DeleteCharacterRelationshipInput,
  UpdateCharacterRelationshipInput,
} from '@rpg/contracts'

import {
  createCharacterRelationship,
  deleteCharacterRelationship,
  updateCharacterRelationship,
} from '../api/character-relationship-client'
import {
  invalidateCharacterRelationshipQueries,
  type CharacterRelationshipInvalidationTarget,
} from '../lib/invalidate-character-relationship-queries'

export type CharacterRelationshipMutationInvalidation = {
  characters: readonly CharacterRelationshipInvalidationTarget[]
  organizationIds?: readonly string[]
  locationIds?: readonly string[]
}

export function useCharacterRelationshipMutations(
  campaignId: string,
  invalidation: CharacterRelationshipMutationInvalidation,
) {
  const queryClient = useQueryClient()

  const invalidate = async (scope?: Partial<CharacterRelationshipMutationInvalidation>) => {
    await invalidateCharacterRelationshipQueries(queryClient, {
      campaignId,
      characters: scope?.characters ?? invalidation.characters,
      organizationIds: scope?.organizationIds ?? invalidation.organizationIds,
      locationIds: scope?.locationIds ?? invalidation.locationIds,
    })
  }

  const createMutation = useMutation({
    mutationFn: (command: CreateCharacterRelationshipCommand) =>
      createCharacterRelationship(campaignId, command),
    onSuccess: async () => {
      await invalidate()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      relationshipId,
      input,
    }: {
      relationshipId: string
      input: UpdateCharacterRelationshipInput
    }) => updateCharacterRelationship(campaignId, relationshipId, input),
    onSuccess: async () => {
      await invalidate()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({
      relationshipId,
      input,
    }: {
      relationshipId: string
      input: DeleteCharacterRelationshipInput
    }) => deleteCharacterRelationship(campaignId, relationshipId, input),
    onSuccess: async () => {
      await invalidate()
    },
  })

  return {
    createRelationship: (command: CreateCharacterRelationshipCommand) =>
      createMutation.mutateAsync(command),
    updateRelationship: (relationshipId: string, input: UpdateCharacterRelationshipInput) =>
      updateMutation.mutateAsync({ relationshipId, input }),
    deleteRelationship: (relationshipId: string, input: DeleteCharacterRelationshipInput) =>
      deleteMutation.mutateAsync({ relationshipId, input }),
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: createMutation.error ?? updateMutation.error ?? deleteMutation.error ?? null,
    invalidate,
    resetErrors: () => {
      createMutation.reset()
      updateMutation.reset()
      deleteMutation.reset()
    },
  }
}
