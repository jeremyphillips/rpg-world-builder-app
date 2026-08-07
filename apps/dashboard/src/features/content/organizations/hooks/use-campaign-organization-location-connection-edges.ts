import { useQuery } from '@tanstack/react-query'

import { getCampaignOrganizationLocationConnectionEdges } from '../api/organization-location-connection-edges-client'

export function campaignOrganizationLocationConnectionEdgesQueryKey(
  campaignId: string | undefined,
) {
  return ['campaigns', campaignId, 'organization-location-connection-edges'] as const
}

export function useCampaignOrganizationLocationConnectionEdges(
  campaignId: string | undefined,
  enabled = true,
) {
  const query = useQuery({
    queryKey: campaignOrganizationLocationConnectionEdgesQueryKey(campaignId),
    queryFn: () => getCampaignOrganizationLocationConnectionEdges(campaignId!),
    enabled: Boolean(enabled && campaignId),
  })

  return {
    ...query,
    isPending: enabled && query.isPending,
    isError: enabled && query.isError,
    error: enabled ? query.error : null,
  }
}
