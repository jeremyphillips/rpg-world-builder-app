import { createContentQueryHook } from '../../lib/create-content-list'
import { listArmor } from '../api/armor-api'

const armorContentList = createContentQueryHook(
  {
    routeKey: 'armor',
    responseKey: 'armor',
    errorMessage: 'Could not load armor.',
  },
  listArmor,
)

export const armorQueryKey = armorContentList.queryKey

/** Load all armor available in the given campaign (system seed + homebrew). */
export const useArmor = armorContentList.useQuery
