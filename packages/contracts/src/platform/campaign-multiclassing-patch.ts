import { z } from 'zod'

import { ABILITY_SCORE_MIN, CHARACTER_ABILITY_SCORE_MAX } from '../vocab/ability'

// ---------------------------------------------------------------------------
// Multiclassing — campaign-configurable rules controlling whether characters
// may take levels in additional classes and which requirements are enforced.
// Stored sparse under `characterCreation.multiclassing`; resolved into the
// ergonomic shape below for UI gating and the multiclass validator.
// ---------------------------------------------------------------------------

export const DEFAULT_MULTICLASSING_ENABLED = true

export const DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED = true

/** SRD baseline: a score of at least 13 in each relevant primary ability. */
export const DEFAULT_PRIMARY_ABILITY_MINIMUM = 13

export const DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED = false

export const DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED = false

/** Multiclass ability gate is bounded by the player-facing score cap, not the 30 stat-block cap. */
export const multiclassingMinimumScoreSchema = z
  .number()
  .int()
  .min(ABILITY_SCORE_MIN)
  .max(CHARACTER_ABILITY_SCORE_MAX)

// ---------------------------------------------------------------------------
// Sparse stored shape
// ---------------------------------------------------------------------------

const primaryAbilityMinimumRequirementPatchSchema = z
  .object({
    enabled: z.boolean().optional(),
    minimumScore: multiclassingMinimumScoreSchema.optional(),
  })
  .strict()

const speciesPolicyRequirementPatchSchema = z
  .object({
    enabled: z.boolean().optional(),
  })
  .strict()

const speciesLevelLimitsRequirementPatchSchema = z
  .object({
    enabled: z.boolean().optional(),
  })
  .strict()

const multiclassingRequirementsPatchSchema = z
  .object({
    primaryAbilityMinimum: primaryAbilityMinimumRequirementPatchSchema.optional(),
    speciesPolicy: speciesPolicyRequirementPatchSchema.optional(),
    speciesLevelLimits: speciesLevelLimitsRequirementPatchSchema.optional(),
  })
  .strict()

/** Sparse multiclassing patch stored under `characterCreation.multiclassing`. */
export const campaignMulticlassingPatchSchema = z
  .object({
    enabled: z.boolean().optional(),
    requirements: multiclassingRequirementsPatchSchema.optional(),
  })
  .strict()

export type CampaignMulticlassingPatch = z.infer<typeof campaignMulticlassingPatchSchema>

// ---------------------------------------------------------------------------
// Resolved shape (campaign defaults applied) — ergonomic for UI + validation
// ---------------------------------------------------------------------------

export const resolvedPrimaryAbilityMinimumRequirementSchema = z.object({
  enabled: z.boolean(),
  minimumScore: multiclassingMinimumScoreSchema,
})

export const resolvedSpeciesPolicyRequirementSchema = z.object({
  enabled: z.boolean(),
})

export const resolvedSpeciesLevelLimitsRequirementSchema = z.object({
  enabled: z.boolean(),
})

export const resolvedMulticlassingRequirementsSchema = z.object({
  primaryAbilityMinimum: resolvedPrimaryAbilityMinimumRequirementSchema,
  speciesPolicy: resolvedSpeciesPolicyRequirementSchema,
  speciesLevelLimits: resolvedSpeciesLevelLimitsRequirementSchema,
})

/** Multiclassing rules with campaign defaults applied — embedded in resolved character creation. */
export const resolvedCampaignMulticlassingPatchSchema = z.object({
  enabled: z.boolean(),
  requirements: resolvedMulticlassingRequirementsSchema,
})

export type ResolvedCampaignMulticlassingPatch = z.infer<
  typeof resolvedCampaignMulticlassingPatchSchema
>

// ---------------------------------------------------------------------------
// Resolver + helpers
// ---------------------------------------------------------------------------

/** Applies campaign defaults to a sparse multiclassing patch. */
export function resolveMulticlassingRules(
  patch?: CampaignMulticlassingPatch,
): ResolvedCampaignMulticlassingPatch {
  const requirements = patch?.requirements

  return {
    enabled: patch?.enabled ?? DEFAULT_MULTICLASSING_ENABLED,
    requirements: {
      primaryAbilityMinimum: {
        enabled:
          requirements?.primaryAbilityMinimum?.enabled ?? DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED,
        minimumScore:
          requirements?.primaryAbilityMinimum?.minimumScore ?? DEFAULT_PRIMARY_ABILITY_MINIMUM,
      },
      speciesPolicy: {
        enabled: requirements?.speciesPolicy?.enabled ?? DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED,
      },
      speciesLevelLimits: {
        enabled: requirements?.speciesLevelLimits?.enabled ?? DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED,
      },
    },
  }
}

/** True when a patch resolves to pure defaults — lets the API drop the stored key entirely. */
export function isSparseDefaultMulticlassingPatch(patch?: CampaignMulticlassingPatch): boolean {
  const { enabled, requirements } = resolveMulticlassingRules(patch)

  return (
    enabled === DEFAULT_MULTICLASSING_ENABLED &&
    requirements.primaryAbilityMinimum.enabled === DEFAULT_PRIMARY_ABILITY_MINIMUM_ENABLED &&
    requirements.primaryAbilityMinimum.minimumScore === DEFAULT_PRIMARY_ABILITY_MINIMUM &&
    requirements.speciesPolicy.enabled === DEFAULT_SPECIES_MULTICLASS_POLICY_ENABLED &&
    requirements.speciesLevelLimits.enabled === DEFAULT_SPECIES_LEVEL_LIMITS_ENABLED
  )
}

/** SRD / default multiclassing rules for new campaigns before any explicit patch is stored. */
export function defaultMulticlassingRules(): ResolvedCampaignMulticlassingPatch {
  return resolveMulticlassingRules(undefined)
}
