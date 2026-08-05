import { useMutation, useQueryClient } from '@tanstack/react-query'

import type {
  CreateOrganizationLocationConnectionInput,
  OrganizationLocationConnectionKind,
  UpdateOrganizationLocationConnectionInput,
} from '@rpg/contracts'

import {
  createOrganizationLocationConnection,
  deleteOrganizationLocationConnection,
  updateOrganizationLocationConnection,
} from '../api/organization-location-connection-client'
import { organizationLocationReferencesQueryKey } from './use-organization-location-references'
import { locationsQueryKey } from '../../locations/hooks/use-locations'

export function useOrganizationLocationConnectionMutations(
  campaignId: string,
  organizationId: string,
) {
  const queryClient = useQueryClient()

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: organizationLocationReferencesQueryKey(campaignId, organizationId),
      }),
      queryClient.invalidateQueries({ queryKey: locationsQueryKey(campaignId) }),
    ])
  }

  const createMutation = useMutation({
    mutationFn: (input: CreateOrganizationLocationConnectionInput) =>
      createOrganizationLocationConnection(campaignId, organizationId, input),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      connectionId,
      input,
    }: {
      connectionId: string
      input: UpdateOrganizationLocationConnectionInput
    }) => updateOrganizationLocationConnection(campaignId, organizationId, connectionId, input),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (connectionId: string) =>
      deleteOrganizationLocationConnection(campaignId, organizationId, connectionId),
    onSuccess: invalidate,
  })

  return {
    addLocationConnection: (locationId: string, kind: OrganizationLocationConnectionKind) =>
      createMutation.mutateAsync({ locationId, kind }),
    updateLocationConnectionKind: (
      connectionId: string,
      kind: OrganizationLocationConnectionKind,
    ) => updateMutation.mutateAsync({ connectionId, input: { kind } }),
    removeLocationConnection: (connectionId: string) => deleteMutation.mutateAsync(connectionId),
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    pendingConnectionId: deleteMutation.isPending
      ? deleteMutation.variables
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
