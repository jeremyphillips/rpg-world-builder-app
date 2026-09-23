import { useMutation, useQueryClient } from '@tanstack/react-query'

import type {
  CreateCharacterRelationshipCommand,
  DeleteCharacterRelationshipInput,
  ReplaceCharacterRelationshipCommand,
  UpdateCharacterRelationshipInput,
} from '@rpg/contracts'

import {
  createCharacterRelationship,
  deleteCharacterRelationship,
  replaceCharacterRelationship,
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

  const replaceMutation = useMutation({
    mutationFn: ({
      relationshipId,
      command,
    }: {
      relationshipId: string
      command: ReplaceCharacterRelationshipCommand
    }) => replaceCharacterRelationship(campaignId, relationshipId, command),
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
    replaceRelationship: (relationshipId: string, command: ReplaceCharacterRelationshipCommand) =>
      replaceMutation.mutateAsync({ relationshipId, command }),
    deleteRelationship: (relationshipId: string, input: DeleteCharacterRelationshipInput) =>
      deleteMutation.mutateAsync({ relationshipId, input }),
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      replaceMutation.isPending ||
      deleteMutation.isPending,
    error:
      createMutation.error ??
      updateMutation.error ??
      replaceMutation.error ??
      deleteMutation.error ??
      null,
    invalidate,
    resetErrors: () => {
      createMutation.reset()
      updateMutation.reset()
      replaceMutation.reset()
      deleteMutation.reset()
    },
  }
}
