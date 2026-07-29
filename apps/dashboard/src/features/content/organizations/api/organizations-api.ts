import type { Organization } from '@rpg/contracts'

import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { createContentListApi } from '../../lib/list/create-content-list'

export const listOrganizations = createContentListApi<Organization>({
  routeKey: 'organizations',
  responseKey: 'organizations',
  errorMessage: formatContentListLoadErrorMessage('organizations'),
})
