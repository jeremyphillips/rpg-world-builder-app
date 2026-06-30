import { createContentQueryHook } from '../../lib/list/create-content-list'
import { listSpecies } from '../api/species-api'

const speciesContentList = createContentQueryHook(
  {
    routeKey: 'species',
    responseKey: 'species',
    errorMessage: 'Could not load species.',
  },
  listSpecies,
)

export const speciesQueryKey = speciesContentList.queryKey

/** Load all species available in the given campaign (system seed + homebrew). */
export const useSpecies = speciesContentList.useQuery
