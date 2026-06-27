import type { z } from 'zod'
import type {
  Campaign,
  CreateCampaignInput,
  ResolvedCampaignCharacterCreationPatch,
  UpdateCampaignInput,
  UpdateCampaignCharacterCreationInput,
} from '@rpg/contracts'
import {
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  MAX_CHARACTER_LEVEL,
  sameStringSet,
} from '@rpg/contracts'

import { identitySchema, flavorSchema } from './campaign-fields'
import {
  createRulesSchema,
  type CreateRulesValues,
  type RulesValues,
} from './character-configuration-fields'

export type { CreateRulesValues, RulesValues }

export const campaignSettingsSchema = identitySchema.and(flavorSchema)

export type CampaignSettingsValues = z.infer<typeof campaignSettingsSchema>

export const campaignCreateSchema = identitySchema.and(createRulesSchema).and(flavorSchema)

export type CampaignCreateValues = z.infer<typeof campaignCreateSchema>

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

function mergeCreateRulesWithDefaults(createRules: CreateRulesValues): RulesValues {
  return {
    ...createRules,
    maxCharacterLevel: MAX_CHARACTER_LEVEL,
    extendedProgressionEnabled: false,
    extendedTierName: '',
    extendedMaxLevel: undefined,
    allowedCharacterCreatureTypes: [...DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES],
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
  }
}

/** Maps a `Campaign` document to the flat shape used by the settings form. */
export function mapCampaignToSettingsValues(campaign: Campaign): CampaignSettingsValues {
  const flavor = campaign.configuration.flavor

  return {
    name: campaign.identity.name,
    description: campaign.identity.description ?? '',
    banner: [],
    playStyle: flavor?.playStyle,
    mood: flavor?.mood,
    magicLevel: flavor?.magicLevel,
    difficulty: flavor?.difficulty,
  }
}

/** Builds the create payload from the flat values accumulated by the wizard. */
export function buildCreateCampaignInput(
  values: CampaignCreateValues,
  imageKey?: string,
): CreateCampaignInput {
  return {
    name: values.name,
    description: values.description,
    ...(imageKey !== undefined && { imageKey }),
    characterCreation: buildCharacterCreationPatchInputFromCreateWizard(values),
    flavor: {
      playStyle: values.playStyle,
      mood: values.mood,
      magicLevel: values.magicLevel,
      difficulty: values.difficulty,
    },
  }
}

/** Builds the API patch payload from validated settings form values. */
export function buildUpdateCampaignInput(
  values: CampaignSettingsValues,
  imageKey?: string,
): UpdateCampaignInput {
  return {
    name: values.name,
    description: values.description,
    ...(imageKey !== undefined && { imageKey }),
    flavor: {
      playStyle: values.playStyle,
      mood: values.mood,
      magicLevel: values.magicLevel,
      difficulty: values.difficulty,
    },
  }
}
