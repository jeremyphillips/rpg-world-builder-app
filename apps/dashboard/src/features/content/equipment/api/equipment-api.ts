import type { Equipment } from '@rpg/contracts'

import { createContentListApi } from '../../lib/create-content-list'

/** List all equipment (system + homebrew) available in a campaign's ruleset. */
export const listEquipment = createContentListApi<Equipment>({
  routeKey: 'equipment',
  responseKey: 'equipment',
  errorMessage: 'Could not load equipment.',
})
