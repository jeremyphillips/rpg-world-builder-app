import { createContentQueryHook } from '../../lib/list/create-content-list'
import { listEquipment } from '../api/equipment-api'

const equipmentContentList = createContentQueryHook(
  {
    routeKey: 'equipment',
    responseKey: 'equipment',
    errorMessage: 'Could not load equipment.',
  },
  listEquipment,
)

export const equipmentQueryKey = equipmentContentList.queryKey

/** Load all equipment available in the given campaign (system seed + homebrew). */
export const useEquipment = equipmentContentList.useQuery
