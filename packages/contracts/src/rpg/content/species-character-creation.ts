import { z } from 'zod'

import { absoluteLevelSchema } from '../primitives/level'
import { classSlugSchema } from './classes/class'

// ---------------------------------------------------------------------------
// Species character-creation data — optional, species-authored inputs consumed
// only when the governing campaign multiclassing requirements are enabled
// (`species_multiclass_policy`, `species_level_limits`). Class references use
// class *slugs*, named `classId(s)` to match the rest of the content layer
// (see spell.ts `classIds`).
// ---------------------------------------------------------------------------

export const SPECIES_MULTICLASS_POLICIES = [
  'inherit',
  'allowed',
  'forbidden',
  'restricted',
] as const

export const speciesMulticlassPolicySchema = z.enum(SPECIES_MULTICLASS_POLICIES)

export type SpeciesMulticlassPolicy = z.infer<typeof speciesMulticlassPolicySchema>

/** Default: defer to campaign/default multiclassing behavior. */
export const DEFAULT_SPECIES_MULTICLASS_POLICY =
  'inherit' as const satisfies SpeciesMulticlassPolicy

export const SPECIES_CLASS_POLICY_MODES = ['all', 'only', 'all_except'] as const

export const speciesClassPolicyModeSchema = z.enum(SPECIES_CLASS_POLICY_MODES)

export type SpeciesClassPolicyMode = z.infer<typeof speciesClassPolicyModeSchema>

export const DEFAULT_SPECIES_CLASS_POLICY_MODE = 'all' as const satisfies SpeciesClassPolicyMode

/** Modes that require an explicit class list to be meaningful. */
export const SPECIES_CLASS_POLICY_MODES_REQUIRING_IDS: readonly SpeciesClassPolicyMode[] = [
  'only',
  'all_except',
]

export const speciesClassPolicySchema = z
  .object({
    mode: speciesClassPolicyModeSchema,
    classIds: z.array(classSlugSchema),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      SPECIES_CLASS_POLICY_MODES_REQUIRING_IDS.includes(value.mode) &&
      value.classIds.length === 0
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select at least one class for this class policy mode',
        path: ['classIds'],
      })
    }
  })

export type SpeciesClassPolicy = z.infer<typeof speciesClassPolicySchema>

export const speciesMulticlassingSchema = z
  .object({
    policy: speciesMulticlassPolicySchema,
    classPolicy: speciesClassPolicySchema,
  })
  .strict()

export type SpeciesMulticlassing = z.infer<typeof speciesMulticlassingSchema>

export const speciesClassLevelCapSchema = z
  .object({
    classId: classSlugSchema,
    maxLevel: absoluteLevelSchema,
  })
  .strict()

export type SpeciesClassLevelCap = z.infer<typeof speciesClassLevelCapSchema>

export const speciesLevelLimitsSchema = z
  .object({
    /** `null` means no character-level cap from this species. */
    maxCharacterLevel: absoluteLevelSchema.nullable(),
    classLevelCaps: z.array(speciesClassLevelCapSchema),
  })
  .strict()
  .superRefine((value, ctx) => {
    const seen = new Set<string>()
    value.classLevelCaps.forEach((cap, index) => {
      if (seen.has(cap.classId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Each class can have at most one level cap',
          path: ['classLevelCaps', index, 'classId'],
        })
      }
      seen.add(cap.classId)
    })
  })

export type SpeciesLevelLimits = z.infer<typeof speciesLevelLimitsSchema>

/**
 * Optional species-authored character-creation data. Both sub-blocks are
 * optional so authors can fill only what an enabled campaign rule consumes;
 * the multiclass validator treats missing blocks as defaults.
 */
export const speciesCharacterCreationSchema = z
  .object({
    multiclassing: speciesMulticlassingSchema.optional(),
    levelLimits: speciesLevelLimitsSchema.optional(),
  })
  .strict()

export type SpeciesCharacterCreation = z.infer<typeof speciesCharacterCreationSchema>

/** Default multiclass policy block for new species authoring. */
export function defaultSpeciesMulticlassing(): SpeciesMulticlassing {
  return {
    policy: DEFAULT_SPECIES_MULTICLASS_POLICY,
    classPolicy: { mode: DEFAULT_SPECIES_CLASS_POLICY_MODE, classIds: [] },
  }
}

/** Default level-limits block for new species authoring. */
export function defaultSpeciesLevelLimits(): SpeciesLevelLimits {
  return { maxCharacterLevel: null, classLevelCaps: [] }
}
