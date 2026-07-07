import { resolveAllowedCreatureTypesFromPolicy } from '../../campaign/campaign-rules'
import type { CharacterClass } from '../../content/classes/class'
import type { Equipment } from '../../content/equipment'
import type { Species } from '../../content/species'
import type { Spell } from '../../content/spell'
import type { CharacterBuildContext } from './context'

// ---------------------------------------------------------------------------
// resolveAvailableContent — availability seam for the builder UI. Campaign
// allow/deny, visibility, and DM-bypass plug in here later without UI changes.
// ---------------------------------------------------------------------------

export type AvailableContent = {
  species: Species[]
  classes: CharacterClass[]
  spells: Spell[]
  equipment: Equipment[]
}

function filterSpeciesByCreatureTypePolicy(
  species: readonly Species[],
  context: CharacterBuildContext,
): Species[] {
  const allowedTypes = resolveAllowedCreatureTypesFromPolicy(
    context.characterCreationRules.species.creatureTypePolicy,
  )
  const allowed = new Set(allowedTypes)
  return species.filter((entry) => allowed.has(entry.creatureType))
}

function filterSpellsByClassSlugs(
  spells: readonly Spell[],
  classSlugs: ReadonlySet<string>,
): Spell[] {
  if (classSlugs.size === 0) return []
  return spells.filter((spell) => spell.classIds.some((slug) => classSlugs.has(slug)))
}

/** Returns catalog options filtered by resolved character-creation rules. */
export function resolveAvailableContent(context: CharacterBuildContext): AvailableContent {
  const species = filterSpeciesByCreatureTypePolicy(context.catalog.species, context)
  const classes = [...context.catalog.classes]
  const classSlugs = new Set(classes.map((entry) => entry.slug))
  const spells = filterSpellsByClassSlugs(context.catalog.spells, classSlugs)

  return {
    species,
    classes,
    spells,
    equipment: [...context.catalog.equipment],
  }
}
