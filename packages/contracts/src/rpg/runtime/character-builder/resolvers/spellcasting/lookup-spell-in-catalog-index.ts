import type { Spell } from '../../../../content/spell'
import type { CharacterBuildCatalogIndex } from '../../context'

/** Resolves a catalog spell by full id or slug. */
export function lookupSpellInCatalogIndex(
  spellIdOrSlug: string,
  catalogIndex: CharacterBuildCatalogIndex,
): Spell | undefined {
  const direct = catalogIndex.spells.get(spellIdOrSlug)
  if (direct) return direct

  for (const spell of catalogIndex.spells.values()) {
    if (spell.slug === spellIdOrSlug || spell.id.endsWith(`:${spellIdOrSlug}`)) {
      return spell
    }
  }

  return undefined
}
