import { useQuery } from '@tanstack/react-query'

import { getOrganizationMembers } from '../api/organization-members-client'
import { ORGANIZATION_MEMBERS_PAGE_SIZE } from '../lib/members/organization-members.constants'

export function organizationMembersQueryKey(
  campaignId: string | undefined,
  organizationId: string | undefined,
) {
  return [
    'campaigns',
    campaignId,
    'content',
    'organizations',
    organizationId,
    'members',
    { page: 1, pageSize: ORGANIZATION_MEMBERS_PAGE_SIZE },
  ] as const
}

export function useOrganizationMembers(
  campaignId: string | undefined,
  organizationId: string | undefined,
  enabled = true,
) {
  const query = useQuery({
    queryKey: organizationMembersQueryKey(campaignId, organizationId),
    queryFn: () =>
      getOrganizationMembers(campaignId!, organizationId!, {
        page: 1,
        pageSize: ORGANIZATION_MEMBERS_PAGE_SIZE,
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
