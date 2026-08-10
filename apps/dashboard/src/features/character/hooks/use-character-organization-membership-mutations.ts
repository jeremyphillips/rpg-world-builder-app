import { useMutation, useQueryClient } from '@tanstack/react-query'

import type {
  CreateCharacterOrganizationMembershipInput,
  UpdateCharacterOrganizationMembershipInput,
} from '@rpg/contracts'

import {
  createCharacterOrganizationMembership,
  deleteCharacterOrganizationMembership,
  updateCharacterOrganizationMembership,
} from '../api/organization-membership-client'
import {
  invalidateCharacterOrganizationMembershipQueries,
  type CharacterOrganizationMembershipSubjectKind,
} from '../lib/invalidate-character-organization-membership-queries'

export function useCharacterOrganizationMembershipMutations(
  campaignId: string,
  characterId: string,
  subjectKind: CharacterOrganizationMembershipSubjectKind,
) {
  const queryClient = useQueryClient()

  const invalidate = async (organizationIds: readonly string[] = []) => {
    await invalidateCharacterOrganizationMembershipQueries(queryClient, {
      campaignId,
      characterId,
      subjectKind,
      organizationIds,
    })
  }

  const createMutation = useMutation({
    mutationFn: (input: CreateCharacterOrganizationMembershipInput) =>
      createCharacterOrganizationMembership(campaignId, characterId, input),
    onSuccess: async (_result, variables) => {
      await invalidate([variables.organizationId])
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      organizationId,
      input,
    }: {
      organizationId: string
      input: UpdateCharacterOrganizationMembershipInput
    }) => updateCharacterOrganizationMembership(campaignId, characterId, organizationId, input),
    onSuccess: async (_result, variables) => {
      await invalidate([variables.organizationId])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (organizationId: string) =>
      deleteCharacterOrganizationMembership(campaignId, characterId, organizationId),
    onSuccess: async (_result, organizationId) => {
      await invalidate([organizationId])
    },
  })

  return {
    addMembership: (input: CreateCharacterOrganizationMembershipInput) =>
      createMutation.mutateAsync(input),
    updateMembership: (organizationId: string, input: UpdateCharacterOrganizationMembershipInput) =>
      updateMutation.mutateAsync({ organizationId, input }),
    removeMembership: (organizationId: string) => deleteMutation.mutateAsync(organizationId),
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: createMutation.error ?? updateMutation.error ?? deleteMutation.error ?? null,
    resetErrors: () => {
      createMutation.reset()
      updateMutation.reset()
      deleteMutation.reset()
    },
  }
}
