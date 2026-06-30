import { z } from 'zod'

import { ABSOLUTE_MAX_CHARACTER_LEVEL, MAX_CHARACTER_LEVEL } from '../../primitives/level'
import { creatureTypeSchema, type CreatureTypeId } from '../../vocab/creature-type'
import { validateExtendedMaxLevel } from '../campaign-level-validation'
import {
  campaignMulticlassingPatchSchema,
  resolveMulticlassingRules,
  resolvedCampaignMulticlassingPatchSchema,
} from './campaign-multiclassing-patch'

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
})

export type ResolvedCampaignCharacterCreationPatch = z.infer<
  typeof resolvedCampaignCharacterCreationPatchSchema
>

function validateCharacterCreationPatchInput(
  patch: CampaignCharacterCreationPatch,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  const standardMaxCharacterLevel = patch.progression?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL
  const extended = patch.progression?.extendedProgression
  const effectiveMax = extended?.maxLevel ?? standardMaxCharacterLevel

  const startingLevel = patch.startingLevel
  if (startingLevel !== undefined && startingLevel > effectiveMax) {
    ctx.addIssue({
      code: 'custom',
      message: 'Starting level cannot exceed max character level',
      path: [...pathPrefix, 'startingLevel'],
    })
  }

  if (extended) {
    const result = validateExtendedMaxLevel(standardMaxCharacterLevel, extended.maxLevel)
    if (!result.valid) {
      ctx.addIssue({
        code: 'custom',
        message: result.message,
        path: [...pathPrefix, 'progression', 'extendedProgression', 'maxLevel'],
      })
    }
  }
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
export function resolveCharacterCreationPatch(
  patch?: CampaignCharacterCreationPatch,
): ResolvedCampaignCharacterCreationPatch {
  const standardMaxCharacterLevel = patch?.progression?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL
  const extendedProgression = patch?.progression?.extendedProgression

  return {
    startingLevel: patch?.startingLevel ?? DEFAULT_STARTING_LEVEL,
    importedCharacters: {
      policy: patch?.importedCharacters?.policy ?? DEFAULT_IMPORTED_CHARACTERS_POLICY,
    },
    progression: {
      maxCharacterLevel: standardMaxCharacterLevel,
      ...(extendedProgression !== undefined && { extendedProgression }),
    },
    species: {
      creatureTypePolicy: patch?.species?.creatureTypePolicy ?? {
        mode: DEFAULT_CREATURE_TYPE_POLICY.mode,
        ids: [...DEFAULT_CREATURE_TYPE_POLICY.ids] as CreatureTypeId[],
      },
    },
    multiclassing: resolveMulticlassingRules(patch?.multiclassing),
  }
}
