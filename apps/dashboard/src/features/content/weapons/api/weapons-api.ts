import type { Weapon } from '@rpg/contracts'

import { createContentListApi } from '../../lib/create-content-list'

/** List all weapons (system + homebrew) available in a campaign's ruleset. */
export const listWeapons = createContentListApi<Weapon>({
  routeKey: 'weapons',
  responseKey: 'weapons',
  errorMessage: 'Could not load weapons.',
})
