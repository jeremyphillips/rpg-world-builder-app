import { z } from 'zod'

import { ABSOLUTE_MAX_CHARACTER_LEVEL, MAX_CHARACTER_LEVEL } from '../../primitives/level'
import { levelValidationMessages } from '../../primitives/level-messages'
import { refineLevelRangeTable } from '../../primitives/level-range-table'
import { creatureTypeSchema, type CreatureTypeId } from '../../vocab/creature-type'
import { resolveMaxCharacterLevel } from '../campaign-rules'
import { validateExtendedMaxLevel } from '../campaign-level-validation'
import {
  resolveStartingWealthRules,
  startingWealthRulesPatchSchema,
  startingWealthRulesSchema,
  type StartingWealthRules,
} from '../rules/starting-wealth'
import {
  campaignMulticlassingPatchSchema,
  resolveMulticlassingRules,
  resolvedCampaignMulticlassingPatchSchema,
} from './campaign-multiclassing-patch'
import {
  characterCreationProficiencyChoicesPatchSchema,
  characterCreationProficiencyGrantsPatchSchema,
  resolveCharacterCreationProficiencyRules,
  resolvedCharacterCreationProficiencyRulesSchema,
} from '../../primitives/proficiency/character-creation-proficiency-rules'
import { campaignPatchValidationMessages } from './campaign-patch-messages'
import {
  campaignSubclassingPatchSchema,
  resolveSubclassingRules,
  resolvedCampaignSubclassingPatchSchema,
  validateSubclassChoicesEnabledChange,
} from './campaign-subclassing-patch'

/** Max length for extended progression tier names in campaign character-creation patch. */
export const EXTENDED_PROGRESSION_TIER_NAME_MAX = 50

export const extendedProgressionSchema = z.object({
  tierName: z.string().min(1).max(EXTENDED_PROGRESSION_TIER_NAME_MAX),
  maxLevel: z.number().int().min(1).max(ABSOLUTE_MAX_CHARACTER_LEVEL),
})

export type ExtendedProgression = z.infer<typeof extendedProgressionSchema>

export const IMPORTED_CHARACTERS_POLICIES = ['disabled', 'approval_required'] as const

export const importedCharactersPolicySchema = z.enum(IMPORTED_CHARACTERS_POLICIES)

export type ImportedCharactersPolicy = z.infer<typeof importedCharactersPolicySchema>

export const CREATURE_TYPE_POLICY_MODES = ['only'] as const

export const creatureTypePolicyModeSchema = z.enum(CREATURE_TYPE_POLICY_MODES)

export type CreatureTypePolicyMode = z.infer<typeof creatureTypePolicyModeSchema>

export const creatureTypePolicySchema = z
  .object({
    mode: creatureTypePolicyModeSchema,
    ids: z.array(creatureTypeSchema).min(1),
  })
  .strict()

export type CreatureTypePolicy = z.infer<typeof creatureTypePolicySchema>

export const DEFAULT_STARTING_LEVEL = 1

export const DEFAULT_IMPORTED_CHARACTERS_POLICY =
  'disabled' as const satisfies ImportedCharactersPolicy

export const DEFAULT_CREATURE_TYPE_POLICY = {
  mode: 'only',
  ids: ['humanoid'],
} as const satisfies CreatureTypePolicy

const campaignCharacterCreationProgressionPatchSchema = z
  .object({
    maxCharacterLevel: z.number().int().min(1).max(ABSOLUTE_MAX_CHARACTER_LEVEL).optional(),
    extendedProgression: extendedProgressionSchema.optional(),
  })
  .strict()

/** Sparse character-creation patch stored on CampaignRulesetPatch. */
export const campaignCharacterCreationPatchSchema = z
  .object({
    startingLevel: z.number().int().min(1).max(ABSOLUTE_MAX_CHARACTER_LEVEL).optional(),
    importedCharacters: z
      .object({
        policy: importedCharactersPolicySchema,
      })
      .optional(),
    progression: campaignCharacterCreationProgressionPatchSchema.optional(),
    species: z
      .object({
        creatureTypePolicy: creatureTypePolicySchema.optional(),
      })
      .optional(),
    multiclassing: campaignMulticlassingPatchSchema.optional(),
    subclasses: campaignSubclassingPatchSchema.optional(),
    startingWealth: startingWealthRulesPatchSchema.optional(),
    proficiencyGrants: characterCreationProficiencyGrantsPatchSchema.optional(),
    proficiencyChoices: characterCreationProficiencyChoicesPatchSchema.optional(),
  })
  .strict()

export type CampaignCharacterCreationPatch = z.infer<typeof campaignCharacterCreationPatchSchema>

export const resolvedCampaignCharacterCreationProgressionSchema = z.object({
  maxCharacterLevel: z.number().int().min(1).max(ABSOLUTE_MAX_CHARACTER_LEVEL),
  extendedProgression: extendedProgressionSchema.optional(),
})

export type ResolvedCampaignCharacterCreationProgression = z.infer<
  typeof resolvedCampaignCharacterCreationProgressionSchema
>

/** Character-creation patch with campaign defaults applied — returned from GET ruleset-patch. */
export const resolvedCampaignCharacterCreationPatchSchema = z.object({
  startingLevel: z.number().int().min(1).max(ABSOLUTE_MAX_CHARACTER_LEVEL),
  importedCharacters: z.object({
    policy: importedCharactersPolicySchema,
  }),
  progression: resolvedCampaignCharacterCreationProgressionSchema,
  species: z.object({
    creatureTypePolicy: creatureTypePolicySchema,
  }),
  multiclassing: resolvedCampaignMulticlassingPatchSchema,
  subclasses: resolvedCampaignSubclassingPatchSchema,
  startingWealth: startingWealthRulesSchema,
  proficiencyGrants: resolvedCharacterCreationProficiencyRulesSchema.shape.proficiencyGrants,
  proficiencyChoices: resolvedCharacterCreationProficiencyRulesSchema.shape.proficiencyChoices,
})

export type ResolvedCampaignCharacterCreationPatch = z.infer<
  typeof resolvedCampaignCharacterCreationPatchSchema
>

type CharacterCreationPatchValidationContext = {
  patch: CampaignCharacterCreationPatch
  ctx: z.RefinementCtx
  pathPrefix: (string | number)[]
}

function validateStartingLevelWithinEffectiveMax(
  { patch, ctx, pathPrefix }: CharacterCreationPatchValidationContext,
  effectiveMax: number,
): void {
  const startingLevel = patch.startingLevel
  if (startingLevel === undefined || startingLevel <= effectiveMax) return

  ctx.addIssue({
    code: 'custom',
    message: levelValidationMessages.startingLevelExceedsMax(),
    path: [...pathPrefix, 'startingLevel'],
  })
}

function validateExtendedProgressionMaxLevel(
  { patch, ctx, pathPrefix }: CharacterCreationPatchValidationContext,
  standardMaxCharacterLevel: number,
): void {
  const extended = patch.progression?.extendedProgression
  if (!extended) return

  const result = validateExtendedMaxLevel(standardMaxCharacterLevel, extended.maxLevel)
  if (result.valid) return

  ctx.addIssue({
    code: 'custom',
    message: result.message,
    path: [...pathPrefix, 'progression', 'extendedProgression', 'maxLevel'],
  })
}

function validateSubclassChoicesPatchInput({
  patch,
  ctx,
  pathPrefix,
}: CharacterCreationPatchValidationContext): void {
  if (patch.subclasses?.enabled === undefined) return

  const result = validateSubclassChoicesEnabledChange()
  if (result.valid) return

  ctx.addIssue({
    code: 'custom',
    message: result.message ?? campaignPatchValidationMessages.subclassChoicesChangeNotAllowed(),
    path: [...pathPrefix, 'subclasses', 'enabled'],
  })
}

function validateStartingWealthTiersInPatchInput({
  patch,
  ctx,
  pathPrefix,
}: CharacterCreationPatchValidationContext): void {
  const tiers = patch.startingWealth?.tiers
  if (tiers === undefined) return

  const effectiveMax = resolveMaxCharacterLevel(patch)
  refineLevelRangeTable(tiers, ctx, {
    pathPrefix: [...pathPrefix, 'startingWealth', 'tiers'],
    maxLevel: effectiveMax,
    requireStartAt: 1,
    requireEndAt: effectiveMax,
  })
}

function validateCharacterCreationPatchInput(
  patch: CampaignCharacterCreationPatch,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
  options: { skipStartingWealthTiers?: boolean } = {},
): void {
  const validationContext: CharacterCreationPatchValidationContext = { patch, ctx, pathPrefix }
  const standardMaxCharacterLevel = patch.progression?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL
  const extended = patch.progression?.extendedProgression
  const effectiveMax = extended?.maxLevel ?? standardMaxCharacterLevel

  validateStartingLevelWithinEffectiveMax(validationContext, effectiveMax)
  validateExtendedProgressionMaxLevel(validationContext, standardMaxCharacterLevel)
  validateSubclassChoicesPatchInput(validationContext)

  if (!options.skipStartingWealthTiers) {
    validateStartingWealthTiersInPatchInput(validationContext)
  }
}

/**
 * Validates a merged character-creation patch before API persist.
 * Always checks resolved starting wealth tiers against the campaign effective max.
 */
export function refineMergedCharacterCreationPatch(
  merged: CampaignCharacterCreationPatch,
  ctx: z.RefinementCtx,
  startingWealthSeed: StartingWealthRules,
  pathPrefix: (string | number)[] = [],
): void {
  validateCharacterCreationPatchInput(merged, ctx, pathPrefix, { skipStartingWealthTiers: true })

  const effectiveMax = resolveMaxCharacterLevel(merged)
  const tiers = resolveStartingWealthRules(startingWealthSeed, merged.startingWealth).tiers

  refineLevelRangeTable(tiers, ctx, {
    pathPrefix: [...pathPrefix, 'startingWealth', 'tiers'],
    maxLevel: effectiveMax,
    requireStartAt: 1,
    requireEndAt: effectiveMax,
  })
}

export function safeParseMergedCharacterCreationPatch(
  merged: CampaignCharacterCreationPatch,
  startingWealthSeed: StartingWealthRules,
) {
  return campaignCharacterCreationPatchSchema
    .superRefine((patch, ctx) => {
      refineMergedCharacterCreationPatch(patch, ctx, startingWealthSeed)
    })
    .safeParse(merged)
}

/** Partial update payload for PATCH ruleset-patch character creation. */
export const updateCampaignCharacterCreationInputSchema = campaignCharacterCreationPatchSchema
  .partial()
  .superRefine((patch, ctx) => {
    validateCharacterCreationPatchInput(patch, ctx)
  })

export type UpdateCampaignCharacterCreationInput = z.infer<
  typeof updateCampaignCharacterCreationInputSchema
>

/** Applies campaign defaults to a sparse character-creation patch. */
function resolveCharacterCreationProgression(
  patch: CampaignCharacterCreationPatch | undefined,
): ResolvedCampaignCharacterCreationProgression {
  const standardMaxCharacterLevel = patch?.progression?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL
  const extendedProgression = patch?.progression?.extendedProgression

  return extendedProgression === undefined
    ? { maxCharacterLevel: standardMaxCharacterLevel }
    : { maxCharacterLevel: standardMaxCharacterLevel, extendedProgression }
}

function resolveCharacterCreationSpecies(
  patch: CampaignCharacterCreationPatch | undefined,
): ResolvedCampaignCharacterCreationPatch['species'] {
  return {
    creatureTypePolicy: patch?.species?.creatureTypePolicy ?? {
      mode: DEFAULT_CREATURE_TYPE_POLICY.mode,
      ids: [...DEFAULT_CREATURE_TYPE_POLICY.ids] as CreatureTypeId[],
    },
  }
}

export function resolveCharacterCreationPatch(
  patch: CampaignCharacterCreationPatch | undefined,
  startingWealthSeed: StartingWealthRules,
): ResolvedCampaignCharacterCreationPatch {
  return {
    startingLevel: patch?.startingLevel ?? DEFAULT_STARTING_LEVEL,
    importedCharacters: {
      policy: patch?.importedCharacters?.policy ?? DEFAULT_IMPORTED_CHARACTERS_POLICY,
    },
    progression: resolveCharacterCreationProgression(patch),
    species: resolveCharacterCreationSpecies(patch),
    multiclassing: resolveMulticlassingRules(patch?.multiclassing),
    subclasses: resolveSubclassingRules(patch?.subclasses),
    startingWealth: resolveStartingWealthRules(startingWealthSeed, patch?.startingWealth),
    ...resolveCharacterCreationProficiencyRules(patch),
  }
}
