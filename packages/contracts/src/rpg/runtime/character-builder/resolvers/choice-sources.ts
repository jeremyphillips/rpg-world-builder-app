import type { ChoiceSourceResolver } from './choice-source-resolver'
import { resolveClassFeatureGrantChoices } from './resolve-class-feature-grant-choices'
import { resolveClassSkillChoices } from './resolve-class-skill-choices'
import { resolveStartingEquipmentChoices } from './resolve-starting-equipment-choices'
import {
  resolveSpeciesHeritageChoices,
  resolveSpeciesTraitGrantChoices,
} from './resolve-species-trait-grant-choices'

/**
 * Ordered registry of choice-source resolvers. `resolveAvailableChoices` iterates
 * this list and concatenates results. Future sources (starting equipment, spellcasting,
 * feats, subclass, background) add a single entry each.
 */
export const CHOICE_SOURCE_RESOLVERS: readonly ChoiceSourceResolver[] = [
  resolveSpeciesHeritageChoices,
  resolveSpeciesTraitGrantChoices,
  resolveClassSkillChoices,
  resolveClassFeatureGrantChoices,
  resolveStartingEquipmentChoices,
  // BENCH-089: resolveSpellcastingChoices,
]
