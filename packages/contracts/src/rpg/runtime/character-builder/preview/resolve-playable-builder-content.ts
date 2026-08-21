import { resolveAllowedCreatureTypesFromPolicy } from '../../../campaign/campaign-rules'
import type { CharacterClass } from '../../../content/classes/class'
import type { Equipment } from '../../../content/equipment'
import type { Species } from '../../../content/species'
import type { Spell } from '../../../content/spell'
import type { Organization } from '../../../content/organization/organization'
import {
  isContentPlayableFor,
  type ContentResolutionRow,
} from '../../campaign/content-resolution-policy'
import type { CharacterBuildContext } from '../context'

// ---------------------------------------------------------------------------
// resolvePlayableBuilderContent — character-play picker universe. Filters by
// playable(playActor) plus builder-specific creation rules.
// ---------------------------------------------------------------------------

export type PlayableBuilderContent = {
  species: Species[]
  classes: CharacterClass[]
  spells: Spell[]
  equipment: Equipment[]
  organizations: Organization[]
}

function isSelectableForCharacterPlay(
  row: ContentResolutionRow,
  context: CharacterBuildContext,
): boolean {
  return isContentPlayableFor(row, context.playActor)
}

function filterPlayableCatalogItems<T extends ContentResolutionRow>(
  items: readonly T[],
  context: CharacterBuildContext,
): T[] {
  return items.filter((row) => isSelectableForCharacterPlay(row, context))
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

/** Returns catalog options filtered for character-play pickers. */
export function resolvePlayableBuilderContent(
  context: CharacterBuildContext,
): PlayableBuilderContent {
  let species = filterSpeciesByCreatureTypePolicy(context.catalog.species, context)
  species = filterPlayableCatalogItems(species, context)

  const classes = filterPlayableCatalogItems(context.catalog.classes, context)
  const equipment = filterPlayableCatalogItems(context.catalog.equipment, context)
  const organizations = filterPlayableCatalogItems(context.catalog.organizations, context)

  const classSlugs = new Set(classes.map((entry) => entry.slug))
  const spells = filterPlayableCatalogItems(
    filterSpellsByClassSlugs(context.catalog.spells, classSlugs),
    context,
  )

  return {
    species,
    classes,
    spells,
    equipment,
    organizations,
  }
}
