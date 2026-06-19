import { createContentQueryHook } from '../../lib/create-content-list'
import { listWeapons } from '../api/weapons-api'

const weaponsContentList = createContentQueryHook(
  {
    routeKey: 'weapons',
    responseKey: 'weapons',
    errorMessage: 'Could not load weapons.',
  },
  listWeapons,
)

export const weaponsQueryKey = weaponsContentList.queryKey

/** Load all weapons available in the given campaign (system seed + homebrew). */
export const useWeapons = weaponsContentList.useQuery
