import { createContentQueryHook } from '../../lib/list/create-content-list'
import { listSkillProficiencies } from '../api/skill-proficiencies-api'

const skillProficienciesContentList = createContentQueryHook(
  {
    routeKey: 'skill-proficiencies',
    responseKey: 'skillProficiencies',
    errorMessage: 'Could not load skill proficiencies.',
  },
  listSkillProficiencies,
)

export const skillProficienciesQueryKey = skillProficienciesContentList.queryKey

/** Load all skill proficiencies available in the given campaign (system seed + homebrew). */
export const useSkillProficiencies = skillProficienciesContentList.useQuery
