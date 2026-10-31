import { resolveSpellReference } from '../../../../content/spell/spell-reference'
import type { Spell } from '../../../../content/spell'
import type { CharacterBuildCatalogIndex } from '../../context'

/** Resolves a catalog spell by exact content id. */
export function lookupSpellInCatalogIndex(
  spellId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): Spell | undefined {
  return resolveSpellReference(spellId, catalogIndex.spells)
}
