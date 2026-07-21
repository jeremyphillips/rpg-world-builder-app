import type { CharacterClass } from '@rpg/contracts'

import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { createContentListApi } from '../../lib/list/create-content-list'

/** List all classes (system + homebrew) available in a campaign's ruleset. */
export const listClasses = createContentListApi<CharacterClass>({
  routeKey: 'classes',
  responseKey: 'classes',
  errorMessage: formatContentListLoadErrorMessage('classes'),
})
