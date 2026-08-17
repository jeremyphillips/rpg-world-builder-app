import { listLanguageSeedOptions } from '@rpg/catalog/vocabulary'
import { DEFAULT_SYSTEM_RULESET_ID, type CharacterBuildCatalog } from '@rpg/contracts'

import { pickSkillProficiency, pickSpecies } from '../../pick'
import { storedFighterClassStored } from './class-stored'

export function makeCharacterBuildCatalog(
  overrides: Partial<CharacterBuildCatalog> = {},
): CharacterBuildCatalog {
  return {
    species: overrides.species ?? [pickSpecies('dwarf')],
    classes: overrides.classes ?? [storedFighterClassStored],
    spells: overrides.spells ?? [],
    equipment: overrides.equipment ?? [],
    skillProficiencies: overrides.skillProficiencies ?? [pickSkillProficiency('athletics')],
    organizations: overrides.organizations ?? [],
    languages: overrides.languages ?? [...listLanguageSeedOptions(DEFAULT_SYSTEM_RULESET_ID)],
    ...overrides,
  }
}

/** Populated builder catalog aligned with character-builder-fixtures defaults. */
export const populatedBuilderCatalog = makeCharacterBuildCatalog({
  classes: [storedFighterClassStored],
})
