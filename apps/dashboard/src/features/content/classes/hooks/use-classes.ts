import { createContentQueryHook } from '../../lib/list/create-content-list'
import { createContentMutationHooks } from '../../lib/list/use-content-mutations'
import { skillProficienciesQueryKey } from '../../skillProficiencies/hooks/use-skill-proficiencies'
import { listClasses } from '../api/classes-api'

const classesContentList = createContentQueryHook(
  {
    routeKey: 'classes',
    responseKey: 'classes',
    errorMessage: 'Could not load classes.',
  },
  listClasses,
)

export const classesQueryKey = classesContentList.queryKey

/** Load all classes available in the given campaign (system seed + homebrew). */
export const useClasses = classesContentList.useQuery

export const { useCreateContent: useCreateClass, useUpdateContent: useUpdateClass } =
  createContentMutationHooks('classes', classesQueryKey, {
    invalidateQueryKeys: (campaignId) => [skillProficienciesQueryKey(campaignId)],
  })
