import { createContentQueryHook } from '../../lib/list/create-content-list'
import { listMonsters } from '../api/monsters-api'
import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'

const monstersContentList = createContentQueryHook(
  {
    routeKey: 'monsters',
    responseKey: 'monsters',
    errorMessage: formatContentListLoadErrorMessage('monsters'),
  },
  listMonsters,
)

export const monstersQueryKey = monstersContentList.queryKey

export const useMonsters = monstersContentList.useQuery
export const useMonstersUsageMeta = monstersContentList.useUsageMeta
