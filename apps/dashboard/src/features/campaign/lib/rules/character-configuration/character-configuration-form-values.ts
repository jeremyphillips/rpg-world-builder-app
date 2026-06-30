import type {
  ResolvedCampaignCharacterCreationPatch,
  UpdateCampaignCharacterCreationInput,
} from '@rpg/contracts'
import {
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  DEFAULT_MULTICLASSING_ENABLED,
  DEFAULT_PRIMARY_ABILITY_MINIMUM,
  DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED,
  DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED,
  DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED,
  MAX_CHARACTER_LEVEL,
  sameStringSet,
} from '@rpg/contracts'
import type { CampaignMulticlassingPatch } from '@rpg/contracts'

import type { CreateRulesValues, RulesValues } from './character-configuration-form-fields'

function pickDefined<T extends Record<string, unknown>>(values: T): Partial<T> | undefined {
  const defined = Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined),
  ) as Partial<T>

  return Object.keys(defined).length > 0 ? defined : undefined
}

function resolveMaxCharacterLevelOverride(maxCharacterLevel: number) {
  return maxCharacterLevel === MAX_CHARACTER_LEVEL ? undefined : maxCharacterLevel
}

function resolveExtendedProgressionOverride(values: RulesValues) {
  if (!values.extendedProgressionEnabled) return undefined

  return {
    tierName: values.extendedTierName?.trim() ?? '',
    maxLevel: values.extendedMaxLevel!,
  }
}

function resolveCreatureTypePolicyOverride(
  allowedCharacterCreatureTypes: RulesValues['allowedCharacterCreatureTypes'],
) {
  if (sameStringSet(allowedCharacterCreatureTypes, DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES)) {
    return undefined
  }

  return { mode: 'only' as const, ids: [...allowedCharacterCreatureTypes] }
}

function resolveMulticlassingOverride(values: RulesValues): CampaignMulticlassingPatch | undefined {
  const enabledDiff =
    values.multiclassingEnabled !== DEFAULT_MULTICLASSING_ENABLED
      ? values.multiclassingEnabled
      : undefined
  const primaryAbilityMinimumEnabledDiff =
    values.primaryAbilityMinimumEnabled !== DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED
      ? values.primaryAbilityMinimumEnabled
      : undefined
  const primaryAbilityMinimumScoreDiff =
    values.primaryAbilityMinimumScore !== DEFAULT_PRIMARY_ABILITY_MINIMUM
      ? values.primaryAbilityMinimumScore
      : undefined
  const speciesPolicyEnabledDiff =
    values.speciesMulticlassPolicyEnabled !== DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED
      ? values.speciesMulticlassPolicyEnabled
      : undefined
  const speciesLevelLimitsEnabledDiff =
    values.speciesLevelLimitsEnabled !== DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED
      ? values.speciesLevelLimitsEnabled
      : undefined

  const primaryAbilityMinimum = pickDefined({
    enabled: primaryAbilityMinimumEnabledDiff,
    minimumScore: primaryAbilityMinimumScoreDiff,
  })

  const requirements = pickDefined({
    ...(primaryAbilityMinimum && { primaryAbilityMinimum }),
    ...(speciesPolicyEnabledDiff !== undefined && {
      speciesPolicy: { enabled: speciesPolicyEnabledDiff },
    }),
    ...(speciesLevelLimitsEnabledDiff !== undefined && {
      speciesLevelLimits: { enabled: speciesLevelLimitsEnabledDiff },
    }),
  })

  return pickDefined({
    enabled: enabledDiff,
    requirements,
  })
}

function mergeCreateRulesWithDefaults(createRules: CreateRulesValues): RulesValues {
  return {
    ...createRules,
    maxCharacterLevel: MAX_CHARACTER_LEVEL,
    extendedProgressionEnabled: false,
    extendedTierName: '',
    extendedMaxLevel: undefined,
    allowedCharacterCreatureTypes: [...DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES],
    multiclassingEnabled: DEFAULT_MULTICLASSING_ENABLED,
    primaryAbilityMinimumEnabled: DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED,
    primaryAbilityMinimumScore: DEFAULT_PRIMARY_ABILITY_MINIMUM,
    speciesMulticlassPolicyEnabled: DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED,
    speciesLevelLimitsEnabled: DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED,
  }
}

/** Maps flat rules wizard fields to the nested character-creation patch shape. */
export function buildCharacterCreationPatchInput(
  values: RulesValues,
): UpdateCampaignCharacterCreationInput {
  const patch: UpdateCampaignCharacterCreationInput = {
    startingLevel: values.startingLevel,
    importedCharacters: { policy: values.importedCharactersPolicy },
  }

  const progression = pickDefined({
    maxCharacterLevel: resolveMaxCharacterLevelOverride(values.maxCharacterLevel),
    extendedProgression: resolveExtendedProgressionOverride(values),
  })
  if (progression) patch.progression = progression

  const creatureTypePolicy = resolveCreatureTypePolicyOverride(values.allowedCharacterCreatureTypes)
  if (creatureTypePolicy) {
    patch.species = { creatureTypePolicy }
  }

  const multiclassing = resolveMulticlassingOverride(values)
  if (multiclassing) {
    patch.multiclassing = multiclassing
  }

  return patch
}

/** Merges create-wizard rules with defaults before building the character-creation patch. */
export function buildCharacterCreationPatchInputFromCreateWizard(
  createRules: CreateRulesValues,
): UpdateCampaignCharacterCreationInput {
  return buildCharacterCreationPatchInput(mergeCreateRulesWithDefaults(createRules))
}

/** Maps resolved ruleset-patch character creation to flat rules form values. */
export function mapRulesetPatchToRulesValues(
  characterCreation: ResolvedCampaignCharacterCreationPatch,
): RulesValues {
  const extended = characterCreation.progression.extendedProgression

  return {
    startingLevel: characterCreation.startingLevel,
    maxCharacterLevel: characterCreation.progression.maxCharacterLevel,
    extendedProgressionEnabled: extended !== undefined,
    extendedTierName: extended?.tierName ?? '',
    extendedMaxLevel: extended?.maxLevel,
    importedCharactersPolicy: characterCreation.importedCharacters.policy,
    allowedCharacterCreatureTypes: [...characterCreation.species.creatureTypePolicy.ids],
    multiclassingEnabled: characterCreation.multiclassing.enabled,
    primaryAbilityMinimumEnabled:
      characterCreation.multiclassing.requirements.primaryAbilityMinimum.enabled,
    primaryAbilityMinimumScore:
      characterCreation.multiclassing.requirements.primaryAbilityMinimum.minimumScore,
    speciesMulticlassPolicyEnabled:
      characterCreation.multiclassing.requirements.speciesPolicy.enabled,
    speciesLevelLimitsEnabled:
      characterCreation.multiclassing.requirements.speciesLevelLimits.enabled,
  }
}
