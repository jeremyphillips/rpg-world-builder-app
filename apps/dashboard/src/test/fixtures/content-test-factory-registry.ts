import type { ContentTypeKey } from '@rpg/contracts'

import { makeCharacterClass } from './factories/character-class'
import { makeEquipment } from './factories/equipment'
import { makeFeat } from './factories/feat'
import { makeLocation } from './factories/location'
import { makeOrganization } from './factories/organization'
import { makeSkillProficiency } from './factories/skill-proficiency'
import { makeSpecies } from './factories/species'
import { makeSpell } from './factories/spell'

/** SSOT: every ContentTypeKey maps to its canonical factory. */
export const CONTENT_TEST_FACTORY_REGISTRY = {
  classes: makeCharacterClass,
  spells: makeSpell,
  species: makeSpecies,
  feats: makeFeat,
  equipment: makeEquipment,
  'skill-proficiencies': makeSkillProficiency,
  organizations: makeOrganization,
  locations: makeLocation,
} as const satisfies Record<ContentTypeKey, (...args: never[]) => unknown>
