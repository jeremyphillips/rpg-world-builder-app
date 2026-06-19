import type { Armor } from '@rpg/contracts'

import { createContentListApi } from '../../lib/create-content-list'

/** List all armor (system + homebrew) available in a campaign's ruleset. */
export const listArmor = createContentListApi<Armor>({
  routeKey: 'armor',
  responseKey: 'armor',
  errorMessage: 'Could not load armor.',
})
