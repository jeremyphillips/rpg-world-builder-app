import { createContentListApi } from '../../lib/list/create-content-list'
import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import type { Feat } from '@rpg/contracts'

/** List all feats (system + homebrew) available in a campaign's ruleset. */
export const listFeats = createContentListApi<Feat>({
  routeKey: 'feats',
  responseKey: 'feats',
  errorMessage: formatContentListLoadErrorMessage('feats'),
})
