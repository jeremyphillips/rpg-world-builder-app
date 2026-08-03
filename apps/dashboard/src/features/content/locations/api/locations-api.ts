import type { Location } from '@rpg/contracts'

import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { createContentListApi } from '../../lib/list/create-content-list'

export const listLocations = createContentListApi<Location>({
  routeKey: 'locations',
  responseKey: 'locations',
  errorMessage: formatContentListLoadErrorMessage('locations'),
})
