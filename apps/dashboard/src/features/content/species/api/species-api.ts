import type { Species } from '@rpg/contracts'

import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { createContentListApi } from '../../lib/list/create-content-list'

/** List all species (system + homebrew) available in a campaign's ruleset. */
export const listSpecies = createContentListApi<Species>({
  routeKey: 'species',
  responseKey: 'species',
  errorMessage: formatContentListLoadErrorMessage('species'),
})
