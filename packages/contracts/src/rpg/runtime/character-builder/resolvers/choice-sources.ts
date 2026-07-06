import type { ChoiceSourceResolver } from './choice-source-resolver'
import { resolveClassFeatureGrantChoices } from './resolve-class-feature-grant-choices'
import { resolveClassSkillChoices } from './resolve-class-skill-choices'
import { resolveRulesetLanguageChoices } from './resolve-ruleset-language-choices'
import { resolveSpellcastingChoices } from './resolve-spellcasting-choices'
import { resolveSpeciesHeritageChoices } from './resolve-species-heritage-choices'
import { resolveSpeciesTraitGrantChoices } from './resolve-species-trait-grant-choices'
import { resolveStartingEquipmentChoices } from './resolve-starting-equipment-choices'

/**
 * Ordered registry of choice-source resolvers. `resolveAvailableChoices` iterates
 * this list and concatenates results. Future sources (starting equipment, spellcasting,
 * feats, subclass, background) add a single entry each.
 */
export const CHOICE_SOURCE_RESOLVERS: readonly ChoiceSourceResolver[] = [
  resolveRulesetLanguageChoices,
  resolveSpeciesHeritageChoices,
  resolveSpeciesTraitGrantChoices,
  resolveClassSkillChoices,
  resolveClassFeatureGrantChoices,
  resolveStartingEquipmentChoices,
  resolveSpellcastingChoices,
]
