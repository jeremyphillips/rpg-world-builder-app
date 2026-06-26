import type { z } from 'zod'
import type { Campaign, CreateCampaignInput, UpdateCampaignInput } from '@rpg/contracts'
import {
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  MAX_CHARACTER_LEVEL,
  resolveAllowedCharacterCreatureTypes,
  resolveStandardMaxCharacterLevel,
} from '@rpg/contracts'

import { identitySchema, rulesSchema, flavorSchema } from './campaign-fields'

export const campaignSettingsSchema = identitySchema.and(rulesSchema).and(flavorSchema)

export type CampaignSettingsValues = z.infer<typeof campaignSettingsSchema>

const DEFAULT_STARTING_LEVEL = 1
const DEFAULT_IMPORTED_CHARACTERS_POLICY = 'disabled' as const

function sameCreatureTypeSet(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false
  const rightSet = new Set(right)
  return left.every((value) => rightSet.has(value)) && rightSet.size === left.length
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

function resolveExtendedProgressionOverride(values: CampaignSettingsValues) {
  if (!values.extendedProgressionEnabled) return undefined

  return {
    tierName: values.extendedTierName?.trim() ?? '',
    maxLevel: values.extendedMaxLevel!,
  }
}

function resolveAllowedCharacterCreatureTypesOverride(
  allowedCharacterCreatureTypes: CampaignSettingsValues['allowedCharacterCreatureTypes'],
) {
  return sameCreatureTypeSet(
    allowedCharacterCreatureTypes,
    DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  )
    ? undefined
    : allowedCharacterCreatureTypes
}

function buildRuleOverrides(values: CampaignSettingsValues) {
  return pickDefined({
    maxCharacterLevel: resolveMaxCharacterLevelOverride(values.maxCharacterLevel),
    extendedProgression: resolveExtendedProgressionOverride(values),
    allowedCharacterCreatureTypes: resolveAllowedCharacterCreatureTypesOverride(
      values.allowedCharacterCreatureTypes,
    ),
  })
}

/** Maps a `Campaign` document to the flat shape used by the settings form. */
export function mapCampaignToSettingsValues(campaign: Campaign): CampaignSettingsValues {
  const settings = campaign.configuration.settings
  const characterCreation = settings?.characterCreation
  const flavor = campaign.configuration.flavor
  const extended = settings?.ruleOverrides?.extendedProgression

  return {
    name: campaign.identity.name,
    description: campaign.identity.description ?? '',
    banner: [],
    startingLevel: characterCreation?.startingLevel ?? DEFAULT_STARTING_LEVEL,
    maxCharacterLevel: resolveStandardMaxCharacterLevel(settings),
    extendedProgressionEnabled: extended !== undefined,
    extendedTierName: extended?.tierName ?? '',
    extendedMaxLevel: extended?.maxLevel,
    importedCharactersPolicy:
      characterCreation?.importedCharacters.policy ?? DEFAULT_IMPORTED_CHARACTERS_POLICY,
    allowedCharacterCreatureTypes: [...resolveAllowedCharacterCreatureTypes(settings)],
    playStyle: flavor?.playStyle,
    mood: flavor?.mood,
    magicLevel: flavor?.magicLevel,
    difficulty: flavor?.difficulty,
  }
}

/** Builds the create payload from the flat values accumulated by the wizard. */
export function buildCreateCampaignInput(
  values: CampaignSettingsValues,
  imageKey?: string,
): CreateCampaignInput {
  const ruleOverrides = buildRuleOverrides(values)

  return {
    name: values.name,
    description: values.description,
    ...(imageKey !== undefined && { imageKey }),
    settings: {
      characterCreation: {
        startingLevel: values.startingLevel,
        importedCharacters: { policy: values.importedCharactersPolicy },
      },
      ...(ruleOverrides !== undefined && { ruleOverrides }),
    },
    flavor: {
      playStyle: values.playStyle,
      mood: values.mood,
      magicLevel: values.magicLevel,
      difficulty: values.difficulty,
    },
  }
}

/** Builds the API patch payload from validated form values (same flat shape as create). */
export function buildUpdateCampaignInput(
  values: CampaignSettingsValues,
  imageKey?: string,
): UpdateCampaignInput {
  return buildCreateCampaignInput(values, imageKey)
}
