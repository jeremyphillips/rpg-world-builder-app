import type { SkillProficiency } from '@rpg/contracts'

import { formatContentListLoadErrorMessage } from '../../lib/content-type-labels'
import { createContentListApi } from '../../lib/list/create-content-list'

/** List all skill proficiencies (system + homebrew) available in a campaign's ruleset. */
export const listSkillProficiencies = createContentListApi<SkillProficiency>({
  routeKey: 'skill-proficiencies',
  responseKey: 'skillProficiencies',
  errorMessage: formatContentListLoadErrorMessage('skill-proficiencies'),
})
