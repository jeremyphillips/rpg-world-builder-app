import { monsterFormDef } from '../../../monsters/lib/monster-form-def'
import { equipmentFormDef } from '../../../equipment/lib/equipment-form-def'
import { spellFormDef } from '../../../spells/lib/spell-form-def'
import { locationFormDef } from '../../../locations/lib/forms/location-form-def'
import { speciesFormDef } from '../../../species/lib/species-form-def'
import { skillProficiencyFormDef } from '../../../skill-proficiencies/lib/skill-proficiency-form-def'
import { featFormDef } from '../../../feats/lib/feat-form-def'
import { classFormDef } from '../../../classes/lib/class-form-def'
import { organizationFormDef } from '../../../organizations/lib/organization-form-def'
import type { AnyContentFormDef } from './content-form-registry'

/** Explicit inventory for form schema and field drift tests. */
export const contentFormRegistry: Readonly<Record<string, AnyContentFormDef>> = {
  monsters: monsterFormDef,
  equipment: equipmentFormDef,
  spells: spellFormDef,
  locations: locationFormDef,
  species: speciesFormDef,
  'skill-proficiencies': skillProficiencyFormDef,
  feats: featFormDef,
  classes: classFormDef,
  organizations: organizationFormDef,
}
