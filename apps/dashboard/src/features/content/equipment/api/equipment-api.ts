import type { Equipment } from '@rpg/contracts'

import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { createContentListApi } from '../../lib/list/create-content-list'

/** List all equipment (system + homebrew) available in a campaign's ruleset. */
export const listEquipment = createContentListApi<Equipment>({
  routeKey: 'equipment',
  responseKey: 'equipment',
  errorMessage: formatContentListLoadErrorMessage('equipment'),
})
