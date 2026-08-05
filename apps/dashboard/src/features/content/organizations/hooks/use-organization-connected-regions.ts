import { useQuery } from '@tanstack/react-query'

import { ORGANIZATION_CONNECTED_REGION_PREVIEW_COUNT } from '../lib/organization-connected-regions.constants'
import { getOrganizationConnectedRegions } from '../api/organization-connected-regions-client'

export function organizationConnectedRegionsQueryKey(
  campaignId: string | undefined,
  organizationId: string | undefined,
) {
  return [
    'campaigns',
    campaignId,
    'content',
    'organizations',
    organizationId,
    'connected-regions',
    { page: 1, pageSize: ORGANIZATION_CONNECTED_REGION_PREVIEW_COUNT },
  ] as const
}

export function useOrganizationConnectedRegions(
  campaignId: string | undefined,
  organizationId: string | undefined,
  enabled = true,
) {
  const query = useQuery({
    queryKey: organizationConnectedRegionsQueryKey(campaignId, organizationId),
    queryFn: () =>
      getOrganizationConnectedRegions(campaignId!, organizationId!, {
        page: 1,
        pageSize: ORGANIZATION_CONNECTED_REGION_PREVIEW_COUNT,
      }),
    enabled: Boolean(enabled && campaignId && organizationId),
  })

  return {
    ...query,
    isPending: enabled && query.isPending,
    isError: enabled && query.isError,
    error: enabled ? query.error : null,
  }
}
