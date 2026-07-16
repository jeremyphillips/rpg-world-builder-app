import type { ChoiceSourceResolver } from './choice-source-resolver'
import { resolveClassFeatureGrantChoices } from '../class/resolve-class-feature-grant-choices'
import { resolveClassSkillChoices } from '../class/resolve-class-skill-choices'
import { resolveClassToolChoices } from '../class/resolve-class-tool-choices'
import { resolveRulesetLanguageChoices } from '../ruleset/resolve-ruleset-language-choices'
import { resolveSpellcastingChoices } from '../spellcasting/resolve-spellcasting-choices'
import { resolveSpeciesHeritageChoices } from '../species/resolve-species-heritage-choices'
import { resolveSpeciesTraitGrantChoices } from '../species/resolve-species-trait-grant-choices'
import { resolveStartingEquipmentChoices } from '../equipment/resolve-starting-equipment-choices'

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
  resolveClassToolChoices,
  resolveClassFeatureGrantChoices,
  resolveStartingEquipmentChoices,
  resolveSpellcastingChoices,
]
