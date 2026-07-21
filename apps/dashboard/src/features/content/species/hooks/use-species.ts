import { createContentQueryHook } from '../../lib/list/create-content-list'
import { createContentMutationHooks } from '../../lib/list/use-content-mutations'
import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { listSpecies } from '../api/species-api'

const speciesContentList = createContentQueryHook(
  {
    routeKey: 'species',
    responseKey: 'species',
    errorMessage: formatContentListLoadErrorMessage('species'),
  },
  listSpecies,
)

export const speciesQueryKey = speciesContentList.queryKey

/** Load all species available in the given campaign (system seed + homebrew). */
export const useSpecies = speciesContentList.useQuery

export const { useCreateContent: useCreateSpecies, useUpdateContent: useUpdateSpecies } =
  createContentMutationHooks('species', speciesQueryKey)
