import { useMemo } from 'react'

import {
  buildCharacterPreview,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuildPreview,
  type ResolvedCharacterCreationRules,
  type SystemRulesetId,
  type ChoiceSet,
} from '@rpg/contracts'

/** Memoized derive hook for the builder right panel — draft + context only. */
export function useCharacterPreview(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex | null,
  rules: ResolvedCharacterCreationRules | null,
  rulesetId: SystemRulesetId | null,
  resolvedChoiceSets: readonly ChoiceSet[] = [],
): CharacterBuildPreview | null {
  return useMemo(() => {
    if (!catalogIndex || !rules || !rulesetId) return null

    return buildCharacterPreview(draft, catalogIndex, rules, rulesetId, { resolvedChoiceSets })
  }, [catalogIndex, draft, resolvedChoiceSets, rules, rulesetId])
}
