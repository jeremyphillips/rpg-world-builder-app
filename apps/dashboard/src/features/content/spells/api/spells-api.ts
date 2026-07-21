import type { Spell } from '@rpg/contracts'

import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { createContentListApi } from '../../lib/list/create-content-list'

/** List all spells (system + homebrew) available in a campaign's ruleset. */
export const listSpells = createContentListApi<Spell>({
  routeKey: 'spells',
  responseKey: 'spells',
  errorMessage: formatContentListLoadErrorMessage('spells'),
})
