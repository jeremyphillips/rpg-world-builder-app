import { useMemo } from 'react'

import {
  resolveAvailableChoices,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ChoiceSet,
} from '@rpg/contracts'

/** Memoized ChoiceSet resolution for the active draft and builder context. */
export function useResolvedChoiceSets(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): ChoiceSet[] {
  return useMemo(() => resolveAvailableChoices(draft, context), [context, draft])
}
