import type { CharacterClass } from '../../../content/classes/class'
import type { Equipment } from '../../../content/equipment'
import type { Species } from '../../../content/species'
import type { Spell } from '../../../content/spell'
import type { Organization } from '../../../content/organization/organization'
import type { CharacterBuildContext, CharacterBuildLanguageOption } from '../context'
import type { SkillProficiency } from '../../../content/skill-proficiency'
import { resolvePlayableBuilderContent } from './resolve-playable-builder-content'

export type PlayableBuilderCatalogIndex = {
  species: ReadonlyMap<string, Species>
  classes: ReadonlyMap<string, CharacterClass>
  spells: ReadonlyMap<string, Spell>
  equipment: ReadonlyMap<string, Equipment>
  organizations: ReadonlyMap<string, Organization>
  skillProficiencies: readonly SkillProficiency[]
  languages: readonly CharacterBuildLanguageOption[]
}

function byId<T extends { id: string }>(items: readonly T[]): ReadonlyMap<string, T> {
  return new Map(items.map((item) => [item.id, item]))
}

/** Indexes {@link resolvePlayableBuilderContent} output for validation and lookups. */
export function indexPlayableBuilderCatalog(
  context: CharacterBuildContext,
): PlayableBuilderCatalogIndex {
  const playable = resolvePlayableBuilderContent(context)

  return {
    species: byId(playable.species),
    classes: byId(playable.classes),
    spells: byId(playable.spells),
    equipment: byId(playable.equipment),
    organizations: byId(playable.organizations),
    skillProficiencies: context.catalog.skillProficiencies,
    languages: context.catalog.languages,
  }
}
