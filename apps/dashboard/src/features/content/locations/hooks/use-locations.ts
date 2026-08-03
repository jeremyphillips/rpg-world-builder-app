import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { createContentQueryHook } from '../../lib/list/create-content-list'
import { createContentMutationHooks } from '../../lib/list/use-content-mutations'
import { listLocations } from '../api/locations-api'

const locationsContentList = createContentQueryHook(
  {
    routeKey: 'locations',
    responseKey: 'locations',
    errorMessage: formatContentListLoadErrorMessage('locations'),
  },
  listLocations,
)

export const locationsQueryKey = locationsContentList.queryKey
export const useLocations = locationsContentList.useQuery
export const useLocationsUsageMeta = locationsContentList.useUsageMeta

export const { useCreateContent: useCreateLocation, useUpdateContent: useUpdateLocation } =
  createContentMutationHooks('locations', locationsQueryKey)
