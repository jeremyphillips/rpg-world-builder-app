import { createContentQueryHook } from '../../lib/list/create-content-list'
import { createContentMutationHooks } from '../../lib/list/use-content-mutations'
import { listSpells } from '../api/spells-api'

const spellsContentList = createContentQueryHook(
  {
    routeKey: 'spells',
    responseKey: 'spells',
    errorMessage: 'Could not load spells.',
  },
  listSpells,
)

export const spellsQueryKey = spellsContentList.queryKey

/** Load all spells available in the given campaign (system seed + homebrew). */
export const useSpells = spellsContentList.useQuery

export const { useCreateContent: useCreateSpell, useUpdateContent: useUpdateSpell } =
  createContentMutationHooks('spells', spellsQueryKey)
