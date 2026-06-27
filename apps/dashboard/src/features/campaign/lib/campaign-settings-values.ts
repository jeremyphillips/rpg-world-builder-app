import type { z } from 'zod'
import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  UpdateCampaignCharacterCreationInput,
} from '@rpg/contracts'
import {
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  MAX_CHARACTER_LEVEL,
  sameStringSet,
} from '@rpg/contracts'

import { rulesSchema, type RulesValues } from './character-configuration-fields'

import { identitySchema, flavorSchema } from './campaign-fields'

export const campaignSettingsSchema = identitySchema.and(flavorSchema)

export type CampaignSettingsValues = z.infer<typeof campaignSettingsSchema>

export const campaignCreateSchema = identitySchema.and(rulesSchema).and(flavorSchema)

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
    characterCreation: buildCharacterCreationPatchInput(values),
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
