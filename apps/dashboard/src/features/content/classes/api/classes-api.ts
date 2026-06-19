import type { CharacterClass } from '@rpg/contracts'

import { createContentListApi } from '../../lib/create-content-list'

/** List all classes (system + homebrew) available in a campaign's ruleset. */
export const listClasses = createContentListApi<CharacterClass>({
  routeKey: 'classes',
  responseKey: 'classes',
  errorMessage: 'Could not load classes.',
})
