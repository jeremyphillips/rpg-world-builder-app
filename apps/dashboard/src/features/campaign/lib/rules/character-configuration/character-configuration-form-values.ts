import type {
  ResolvedCampaignCharacterCreationPatch,
  SystemRulesetId,
  UpdateCampaignCharacterCreationInput,
} from '@rpg/contracts'
import {
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  DEFAULT_MULTICLASSING_ENABLED,
  DEFAULT_PRIMARY_ABILITY_MINIMUM,
  DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED,
  DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED,
  DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED,
  DEFAULT_SUBCLASS_CHOICES_ENABLED,
  MAX_CHARACTER_LEVEL,
  resolveCharacterCreationPatch,
  sameStringSet,
} from '@rpg/contracts'
import type { CampaignMulticlassingPatch, CampaignSubclassingPatch } from '@rpg/contracts'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import type { CreateRulesValues, RulesValues } from './character-configuration-form-fields'
import {
  buildStartingWealthPatchInput,
  mapStartingWealthToFormValues,
} from './starting-wealth-form-values'
import {
  buildLanguageProficiencyPatchInput,
  mapLanguageProficiencyRulesToFormValues,
} from './language-proficiency-form-values'
import {
  buildLevelZeroNpcsPatchInput,
  mapLevelZeroNpcsToFormValues,
} from './level-zero-npc-form-values'
import {
  buildStandardArrayPatchInput,
  mapStandardArrayToFormValues,
} from '@/lib/forms/standard-array-form-values'

const DEFAULT_RULESET_ID = 'srd-cc-5.2.1' as const satisfies SystemRulesetId

type BuildCharacterCreationPatchInputOptions = {
  includeDefaultMulticlassing?: boolean
  includeDefaultSubclassing?: boolean
  includeDefaultLanguageProficiencies?: boolean
  includeDefaultLevelZeroNpcs?: boolean
  existingLanguageChoice?: ResolvedCampaignCharacterCreationPatch['proficiencyChoices']['languages'][number]
}

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

function resolveMulticlassingOverride(
  values: RulesValues,
  options: BuildCharacterCreationPatchInputOptions = {},
): CampaignMulticlassingPatch | undefined {
  if (options.includeDefaultMulticlassing) {
    return {
      enabled: values.multiclassingEnabled,
      requirements: {
        primaryAbilityMinimum: {
          enabled: values.primaryAbilityMinimumEnabled,
          minimumScore: values.primaryAbilityMinimumScore,
        },
        speciesPolicy: { enabled: values.speciesMulticlassPolicyEnabled },
        speciesLevelLimits: { enabled: values.speciesLevelLimitsEnabled },
      },
    }
  }

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

function resolveSubclassingOverride(
  values: RulesValues,
  options: BuildCharacterCreationPatchInputOptions = {},
): CampaignSubclassingPatch | undefined {
  const enabled = values.subclassChoicesEnabled ?? DEFAULT_SUBCLASS_CHOICES_ENABLED

  if (options.includeDefaultSubclassing) {
    return { enabled }
  }

  return enabled === DEFAULT_SUBCLASS_CHOICES_ENABLED ? undefined : { enabled }
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
    subclassChoicesEnabled: DEFAULT_SUBCLASS_CHOICES_ENABLED,
    startingWealth: mapStartingWealthToFormValues(
      getStandardStartingWealthRules(DEFAULT_RULESET_ID),
    ),
    ...mapLanguageProficiencyRulesToFormValues(
      resolveCharacterCreationPatch(undefined, getStandardStartingWealthRules(DEFAULT_RULESET_ID)),
    ),
    ...mapLevelZeroNpcsToFormValues(
      resolveCharacterCreationPatch(undefined, getStandardStartingWealthRules(DEFAULT_RULESET_ID))
        .levelZeroNpcs,
    ),
    standardArray: mapStandardArrayToFormValues(
      resolveCharacterCreationPatch(undefined, getStandardStartingWealthRules(DEFAULT_RULESET_ID))
        .standardArray,
    ),
  }
}

/** Maps flat rules wizard fields to the nested character-creation patch shape. */
export function buildCharacterCreationPatchInput(
  values: RulesValues,
  options: BuildCharacterCreationPatchInputOptions = {},
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

  const multiclassing = resolveMulticlassingOverride(values, options)
  if (multiclassing) {
    patch.multiclassing = multiclassing
  }

  const subclassing = resolveSubclassingOverride(values, options)
  if (subclassing) {
    patch.subclasses = subclassing
  }

  const startingWealthSeed = getStandardStartingWealthRules(DEFAULT_RULESET_ID)
  const startingWealthPatch = buildStartingWealthPatchInput(
    values.startingWealth,
    startingWealthSeed,
  )
  if (startingWealthPatch) {
    patch.startingWealth = startingWealthPatch
  }

  if (options.includeDefaultLanguageProficiencies) {
    Object.assign(
      patch,
      buildLanguageProficiencyPatchInput(
        {
          languageProficiencyGrants: values.languageProficiencyGrants,
          languageProficiencyChoice: values.languageProficiencyChoice,
        },
        options.existingLanguageChoice,
      ),
    )
  }

  const levelZeroNpcs = buildLevelZeroNpcsPatchInput(values, options)
  if (levelZeroNpcs) {
    patch.levelZeroNpcs = levelZeroNpcs
  }

  const standardArray = buildStandardArrayPatchInput(values.standardArray)
  if (standardArray) {
    patch.standardArray = standardArray
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
    subclassChoicesEnabled: characterCreation.subclasses.enabled,
    startingWealth: mapStartingWealthToFormValues(characterCreation.startingWealth),
    standardArray: mapStandardArrayToFormValues(characterCreation.standardArray),
    ...mapLanguageProficiencyRulesToFormValues(characterCreation),
    ...mapLevelZeroNpcsToFormValues(characterCreation.levelZeroNpcs),
  }
}
