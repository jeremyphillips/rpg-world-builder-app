import { createContentQueryHook } from '../../lib/list/create-content-list'
import { createContentMutationHooks } from '../../lib/list/use-content-mutations'
import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { listClasses } from '../api/classes-api'

const classesContentList = createContentQueryHook(
  {
    routeKey: 'classes',
    responseKey: 'classes',
    errorMessage: formatContentListLoadErrorMessage('classes'),
  },
  listClasses,
)

export const classesQueryKey = classesContentList.queryKey

/** Load all classes available in the given campaign (system seed + homebrew). */
export const useClasses = classesContentList.useQuery
export const useClassesUsageMeta = classesContentList.useUsageMeta

export const { useCreateContent: useCreateClass, useUpdateContent: useUpdateClass } =
  createContentMutationHooks('classes', classesQueryKey)
