import { createContentQueryHook } from '../../lib/list/create-content-list'
import { createContentMutationHooks } from '../../lib/list/use-content-mutations'
import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { listSkillProficiencies } from '../api/skill-proficiencies-api'

const skillProficienciesContentList = createContentQueryHook(
  {
    routeKey: 'skill-proficiencies',
    responseKey: 'skillProficiencies',
    errorMessage: formatContentListLoadErrorMessage('skill-proficiencies'),
  },
  listSkillProficiencies,
)

export const skillProficienciesQueryKey = skillProficienciesContentList.queryKey

/** Load all skill proficiencies available in the given campaign (system seed + homebrew). */
export const useSkillProficiencies = skillProficienciesContentList.useQuery
export const useSkillProficienciesUsageMeta = skillProficienciesContentList.useUsageMeta

export const {
  useCreateContent: useCreateSkillProficiency,
  useUpdateContent: useUpdateSkillProficiency,
} = createContentMutationHooks('skill-proficiencies', skillProficienciesQueryKey)
