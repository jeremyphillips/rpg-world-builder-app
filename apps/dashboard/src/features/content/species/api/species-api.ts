import type { Species } from '@rpg/contracts'

import { createContentListApi } from '../../lib/list/create-content-list'

/** List all species (system + homebrew) available in a campaign's ruleset. */
export const listSpecies = createContentListApi<Species>({
  routeKey: 'species',
  responseKey: 'species',
  errorMessage: 'Could not load species.',
})
