import { useQuery } from '@tanstack/react-query'

import { ORGANIZATION_CONNECTED_CHARACTER_PREVIEW_COUNT } from '../lib/organization-connected-characters.constants'
import { getOrganizationConnectedCharacters } from '../api/organization-connected-characters-client'

export function organizationConnectedCharactersQueryKey(
  campaignId: string | undefined,
  organizationId: string | undefined,
) {
  return [
    'campaigns',
    campaignId,
    'content',
    'organizations',
    organizationId,
    'connected-characters',
    { page: 1, pageSize: ORGANIZATION_CONNECTED_CHARACTER_PREVIEW_COUNT },
  ] as const
}

export function useOrganizationConnectedCharacters(
  campaignId: string | undefined,
  organizationId: string | undefined,
  enabled = true,
) {
  const query = useQuery({
    queryKey: organizationConnectedCharactersQueryKey(campaignId, organizationId),
    queryFn: () =>
      getOrganizationConnectedCharacters(campaignId!, organizationId!, {
        page: 1,
        pageSize: ORGANIZATION_CONNECTED_CHARACTER_PREVIEW_COUNT,
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
