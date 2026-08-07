import { useMutation, useQueryClient } from '@tanstack/react-query'

import type {
  CreateOrganizationLocationConnectionInput,
  OrganizationLocationConnectionKind,
  UpdateOrganizationLocationConnectionInput,
} from '@rpg/contracts'

import { invalidateLocationConnectionQueries } from '../../lib/invalidate-location-connection-queries'
import {
  createOrganizationLocationConnection,
  deleteOrganizationLocationConnection,
  updateOrganizationLocationConnection,
} from '../api/organization-location-connection-client'
import { organizationLocationReferencesQueryKey } from './use-organization-location-references'

export function useOrganizationLocationConnectionMutations(
  campaignId: string,
  organizationId: string,
) {
  const queryClient = useQueryClient()

  const invalidate = async (locationIds: readonly string[] = []) => {
    await invalidateLocationConnectionQueries(queryClient, {
      campaignId,
      organizationId,
      locationIds,
    })
  }

  const createMutation = useMutation({
    mutationFn: (input: CreateOrganizationLocationConnectionInput) =>
      createOrganizationLocationConnection(campaignId, organizationId, input),
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
      input: UpdateOrganizationLocationConnectionInput
      previousLocationId: string
    }) => updateOrganizationLocationConnection(campaignId, organizationId, connectionId, input),
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
      deleteOrganizationLocationConnection(campaignId, organizationId, connectionId),
    onSuccess: async (_result, variables) => {
      await invalidate([variables.locationId])
    },
  })

  return {
    addLocationConnection: (locationId: string, kind: OrganizationLocationConnectionKind) =>
      createMutation.mutateAsync({ locationId, kind }),
    updateLocationConnection: (
      connectionId: string,
      input: UpdateOrganizationLocationConnectionInput,
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
    referencesQueryKey: organizationLocationReferencesQueryKey(campaignId, organizationId),
  }
}
