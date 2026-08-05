import { useQuery } from '@tanstack/react-query'

import { getLocationConnectedParties } from '../api/location-connected-parties-client'

export function locationConnectedPartiesQueryKey(
  campaignId: string | undefined,
  locationId: string | undefined,
) {
  return ['campaigns', campaignId, 'locations', locationId, 'connected-parties'] as const
}

export function useLocationConnectedParties(
  campaignId: string | undefined,
  locationId: string | undefined,
  enabled = true,
) {
  const query = useQuery({
    queryKey: locationConnectedPartiesQueryKey(campaignId, locationId),
    queryFn: () => getLocationConnectedParties(campaignId!, locationId!),
    enabled: Boolean(enabled && campaignId && locationId),
  })

  return {
    ...query,
    isPending: enabled && query.isPending,
    isError: enabled && query.isError,
    error: enabled ? query.error : null,
  }
}
