import { createContentListApi } from '../../lib/list/create-content-list'
import type { Feat } from '@rpg/contracts'

/** List all feats (system + homebrew) available in a campaign's ruleset. */
export const listFeats = createContentListApi<Feat>({
  routeKey: 'feats',
  responseKey: 'feats',
  errorMessage: 'Could not load feats.',
})
