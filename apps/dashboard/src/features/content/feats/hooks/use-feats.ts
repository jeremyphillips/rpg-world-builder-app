import { createContentQueryHook } from '../../lib/list/create-content-list'
import { createContentMutationHooks } from '../../lib/list/use-content-mutations'
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

export const { useCreateContent: useCreateFeat, useUpdateContent: useUpdateFeat } =
  createContentMutationHooks('feats', featsQueryKey)
