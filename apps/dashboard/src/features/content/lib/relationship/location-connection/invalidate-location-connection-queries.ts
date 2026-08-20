import type { QueryClient } from '@tanstack/react-query'

import { characterLocationReferencesQueryKey } from '@/features/character'

import { locationConnectedPartiesQueryKey } from '../../../locations/hooks/use-location-connected-parties'
import { locationsQueryKey } from '../../../locations/hooks/use-locations'
import { organizationLocationReferencesQueryKey } from '../../../organizations/hooks/use-organization-location-references'
import { campaignOrganizationLocationConnectionEdgesQueryKey } from '../../../organizations/hooks/use-campaign-organization-location-connection-edges'

export async function invalidateLocationConnectionQueries(
  queryClient: QueryClient,
  input: {
    campaignId: string
    organizationId?: string
    characterId?: string
    locationIds?: readonly string[]
  },
): Promise<void> {
  const invalidations: Promise<void>[] = [
    queryClient.invalidateQueries({ queryKey: locationsQueryKey(input.campaignId) }),
    queryClient.invalidateQueries({
      queryKey: campaignOrganizationLocationConnectionEdgesQueryKey(input.campaignId),
    }),
  ]

  if (input.organizationId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: organizationLocationReferencesQueryKey(input.campaignId, input.organizationId),
      }),
    )
  }

  if (input.characterId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: characterLocationReferencesQueryKey(input.campaignId, input.characterId),
      }),
    )
  }

  for (const locationId of input.locationIds ?? []) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: locationConnectedPartiesQueryKey(input.campaignId, locationId),
      }),
    )
  }

  await Promise.all(invalidations)
}
