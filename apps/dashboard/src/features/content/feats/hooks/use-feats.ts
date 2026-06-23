import { createContentQueryHook } from '../../lib/create-content-list'
import { listFeats } from '../api/feats-api'

const featsContentList = createContentQueryHook(
  {
    routeKey: 'feats',
    responseKey: 'feats',
    errorMessage: 'Could not load feats.',
  },
  listFeats,
)

export const featsQueryKey = featsContentList.queryKey

/** Load all feats available in the given campaign (system seed + homebrew). */
export const useFeats = featsContentList.useQuery
