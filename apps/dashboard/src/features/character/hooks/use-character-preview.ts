import { useMemo } from 'react'

import {
  buildCharacterPreview,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuildPreview,
  type ResolvedCharacterCreationRules,
  type ResolvedSpellcastingProgressionConfig,
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
  spellcastingProgression: ResolvedSpellcastingProgressionConfig | null = null,
): CharacterBuildPreview | null {
  return useMemo(() => {
    if (!catalogIndex || !rules || !rulesetId || !spellcastingProgression) return null

    return buildCharacterPreview(
      draft,
      catalogIndex,
      rules,
      rulesetId,
      { resolvedChoiceSets },
      spellcastingProgression,
    )
  }, [catalogIndex, draft, resolvedChoiceSets, rules, rulesetId, spellcastingProgression])
}
