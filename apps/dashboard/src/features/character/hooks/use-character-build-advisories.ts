import { useMemo } from 'react'

import {
  resolveCharacterBuildAdvisoriesForDraft,
  type CharacterBuildAdvisory,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ChoiceSet,
} from '@rpg/contracts'

/** Live advisories for the builder draft — same resolver Create uses at click time. */
export function useCharacterBuildAdvisories(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  resolvedChoiceSets: readonly ChoiceSet[],
): readonly CharacterBuildAdvisory[] {
  return useMemo(
    () => resolveCharacterBuildAdvisoriesForDraft(draft, context, { resolvedChoiceSets }),
    [context, draft, resolvedChoiceSets],
  )
}
