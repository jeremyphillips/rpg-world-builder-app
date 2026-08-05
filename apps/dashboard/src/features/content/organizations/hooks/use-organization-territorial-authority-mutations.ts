import { useMutation, useQueryClient } from '@tanstack/react-query'

import type {
  CreateTerritorialAuthorityRelationshipInput,
  TerritorialAuthorityKind,
  UpdateTerritorialAuthorityRelationshipInput,
} from '@rpg/contracts'

import {
  createTerritorialAuthority,
  deleteTerritorialAuthority,
  updateTerritorialAuthority,
} from '../../locations/api/territorial-authority-api'
import { locationsQueryKey } from '../../locations/hooks/use-locations'
import { organizationConnectedRegionsQueryKey } from './use-organization-connected-regions'

export function useOrganizationTerritorialAuthorityMutations(
  campaignId: string,
  organizationId: string,
) {
  const queryClient = useQueryClient()

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: organizationConnectedRegionsQueryKey(campaignId, organizationId),
      }),
      queryClient.invalidateQueries({ queryKey: locationsQueryKey(campaignId) }),
    ])
  }

  const createMutation = useMutation({
    mutationFn: ({
      regionId,
      input,
    }: {
      regionId: string
      input: CreateTerritorialAuthorityRelationshipInput
    }) => createTerritorialAuthority(campaignId, regionId, input),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      regionId,
      relationshipId,
      input,
    }: {
      regionId: string
      relationshipId: string
      input: UpdateTerritorialAuthorityRelationshipInput
    }) => updateTerritorialAuthority(campaignId, regionId, relationshipId, input),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: ({ regionId, relationshipId }: { regionId: string; relationshipId: string }) =>
      deleteTerritorialAuthority(campaignId, regionId, relationshipId),
    onSuccess: invalidate,
  })

  return {
    addTerritorialAuthority: (regionId: string, kind: TerritorialAuthorityKind) =>
      createMutation.mutateAsync({
        regionId,
        input: { organizationId, kind },
      }),
    updateTerritorialAuthorityKind: (
      regionId: string,
      relationshipId: string,
      kind: TerritorialAuthorityKind,
    ) =>
      updateMutation.mutateAsync({
        regionId,
        relationshipId,
        input: { kind },
      }),
    removeTerritorialAuthority: (regionId: string, relationshipId: string) =>
      deleteMutation.mutateAsync({ regionId, relationshipId }),
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    pendingRelationshipId: deleteMutation.isPending
      ? deleteMutation.variables?.relationshipId
      : updateMutation.isPending
        ? updateMutation.variables?.relationshipId
        : undefined,
    error: createMutation.error ?? updateMutation.error ?? deleteMutation.error ?? null,
    resetErrors: () => {
      createMutation.reset()
      updateMutation.reset()
      deleteMutation.reset()
    },
  }
}
