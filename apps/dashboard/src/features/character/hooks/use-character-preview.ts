import { useMemo } from 'react'

import {
  buildCharacterPreview,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuildPreview,
  type ResolvedCharacterCreationRules,
} from '@rpg/contracts'

/** Memoized derive hook for the builder right panel — draft + context only. */
export function useCharacterPreview(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex | null,
  rules: ResolvedCharacterCreationRules | null,
): CharacterBuildPreview | null {
  return useMemo(() => {
    if (!catalogIndex || !rules) return null

    return buildCharacterPreview(draft, catalogIndex, rules, { resolvedChoiceSets: [] })
  }, [catalogIndex, draft, rules])
}
