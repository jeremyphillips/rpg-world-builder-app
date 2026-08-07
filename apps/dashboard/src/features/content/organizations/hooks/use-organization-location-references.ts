import { useQuery } from '@tanstack/react-query'

import { getOrganizationLocationReferences } from '../api/organization-location-reference-client'

export function organizationLocationReferencesQueryKey(
  campaignId: string | undefined,
  organizationId: string | undefined,
) {
  return ['campaigns', campaignId, 'organizations', organizationId, 'location-references'] as const
}

export function useOrganizationLocationReferences(
  campaignId: string | undefined,
  organizationId: string | undefined,
  enabled = true,
) {
  const query = useQuery({
    queryKey: organizationLocationReferencesQueryKey(campaignId, organizationId),
    queryFn: () => getOrganizationLocationReferences(campaignId!, organizationId!),
    enabled: Boolean(enabled && campaignId && organizationId),
  })

  return {
    ...query,
    isPending: enabled && query.isPending,
    isError: enabled && query.isError,
    error: enabled ? query.error : null,
  }
}
