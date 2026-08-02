import { createContentQueryHook } from '../../lib/list/create-content-list'
import { createContentMutationHooks } from '../../lib/list/use-content-mutations'
import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { listEquipment } from '../api/equipment-api'

const equipmentContentList = createContentQueryHook(
  {
    routeKey: 'equipment',
    responseKey: 'equipment',
    errorMessage: formatContentListLoadErrorMessage('equipment'),
  },
  listEquipment,
)

export const equipmentQueryKey = equipmentContentList.queryKey

/** Load all equipment available in the given campaign (system seed + homebrew). */
export const useEquipment = equipmentContentList.useQuery
export const useEquipmentUsageMeta = equipmentContentList.useUsageMeta

export const { useCreateContent: useCreateEquipment, useUpdateContent: useUpdateEquipment } =
  createContentMutationHooks('equipment', equipmentQueryKey)
