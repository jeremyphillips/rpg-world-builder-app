import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { createContentQueryHook } from '../../lib/list/create-content-list'
import { createContentMutationHooks } from '../../lib/list/use-content-mutations'
import { listOrganizations } from '../api/organizations-api'

const organizationsContentList = createContentQueryHook(
  {
    routeKey: 'organizations',
    responseKey: 'organizations',
    errorMessage: formatContentListLoadErrorMessage('organizations'),
  },
  listOrganizations,
)

export const organizationsQueryKey = organizationsContentList.queryKey
export const useOrganizations = organizationsContentList.useQuery

export const { useCreateContent: useCreateOrganization, useUpdateContent: useUpdateOrganization } =
  createContentMutationHooks('organizations', organizationsQueryKey)
