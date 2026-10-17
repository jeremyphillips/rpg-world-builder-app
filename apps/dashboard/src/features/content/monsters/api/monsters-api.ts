import type { Monster } from '@rpg/contracts'

import { createContentListApi } from '../../lib/list/create-content-list'
import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'

export const listMonsters = createContentListApi<Monster>({
  routeKey: 'monsters',
  responseKey: 'monsters',
  errorMessage: formatContentListLoadErrorMessage('monsters'),
})
